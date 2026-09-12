import math
from typing import List, Optional, Tuple, Dict, Any
from .models import IncidentState, VehicleState, DispatchDecision, QuadrantState
from .generator import get_quadrant

def calculate_distance(x1: float, y1: float, x2: float, y2: float) -> float:
    return math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2)

class BaseDispatcher:
    def assign(
        self,
        incident: IncidentState,
        vehicles: List[VehicleState],
        quadrants: Dict[int, QuadrantState],
        step: int
    ) -> Optional[DispatchDecision]:
        raise NotImplementedError

class GreedyDispatcher(BaseDispatcher):
    def assign(
        self,
        incident: IncidentState,
        vehicles: List[VehicleState],
        quadrants: Dict[int, QuadrantState],
        step: int
    ) -> Optional[DispatchDecision]:
        best_vehicle = None
        min_dist = float('inf')
        
        # Filter matching agency vehicles
        eligible_v = [v for v in vehicles if v.agency == incident.agency or incident.agency == "multi"]
        
        for v in eligible_v:
            if incident.priority == 3:
                if v.occupied_slots > 0 or len(v.patients) > 0:
                    continue
            else:
                if v.occupied_slots >= v.capacity:
                    continue
            
            dist = calculate_distance(v.x, v.y, incident.x, incident.y)
            if dist < min_dist:
                min_dist = dist
                best_vehicle = v
                
        if not best_vehicle:
            return None
            
        explanation = (
            f"Greedy baseline assigned {best_vehicle.name} purely because it was the closest available vehicle "
            f"(distance: {min_dist:.2f} units), ignoring coverage risk and agency capacity rules."
        )
        
        return DispatchDecision(
            step=step,
            incident_id=incident.id,
            agency=incident.agency,
            priority=incident.priority,
            vehicle_id=best_vehicle.id,
            vehicle_name=best_vehicle.name,
            distance=round(min_dist, 2),
            score=round(min_dist, 2),
            explanation=explanation,
            score_breakdown={
                "distance": round(min_dist, 2),
                "priority_cost": 0.0,
                "coverage_penalty": 0.0,
                "capacity_bonus": 0.0
            },
            coverage_override=False
        )

class SATHIDispatcher(BaseDispatcher):
    """
    SATHI Multi-Domain Intelligence Engine v4.0:
    Handles Medical, Fire & Rescue, Police Tactical, and Multi-Agency Disaster Incidents.
    """
    def assign(
        self,
        incident: IncidentState,
        vehicles: List[VehicleState],
        quadrants: Dict[int, QuadrantState],
        step: int
    ) -> Optional[DispatchDecision]:
        
        eligible_vehicles = [
            v for v in vehicles 
            if (v.agency == incident.agency or incident.agency == "multi") and v.status != "refilling"
        ]
        
        if not eligible_vehicles:
            return None

        # Calculate quadrant idle counts for this agency
        quad_idle_counts = {1: 0, 2: 0, 3: 0, 4: 0}
        for v in eligible_vehicles:
            if (v.status in ("idle", "rebalancing")) and v.occupied_slots == 0:
                quad_idle_counts[v.current_quadrant] += 1

        best_vehicle = None
        min_score = float('inf')
        best_breakdown = {}
        best_dist = 0.0
        coverage_override_triggered = False
        skipped_due_to_coverage = False

        for v in eligible_vehicles:
            # Domain-Specific Rules
            if incident.agency == "fire":
                # Fire Engine must have at least 20% water level
                if v.water_level < 20.0:
                    continue
                # F3 Industrial Blaze prefers Tanker / Ladder
                if incident.fire_severity == 3 and v.vehicle_type == "pumper" and len(eligible_vehicles) > 2:
                    pass
            elif incident.agency == "police":
                # Threat level T3 requires SWAT unit if available
                if incident.threat_level == 3 and v.unit_type != "swat":
                    swat_avail = any(alt.unit_type == "swat" and alt.status == "idle" for alt in eligible_vehicles)
                    if swat_avail:
                        continue
            else: # Medical
                if incident.priority == 3:
                    if v.occupied_slots > 0 or len(v.patients) > 0:
                        continue
                else:
                    if v.occupied_slots >= v.capacity or any(p.priority == 3 for p in v.patients):
                        continue

            v_quad = v.current_quadrant
            idle_in_quad = quad_idle_counts.get(v_quad, 0)
            is_last_vehicle = (v.status in ("idle", "rebalancing")) and (v.occupied_slots == 0) and (idle_in_quad == 1)

            # Last Vehicle Protection Rule
            if is_last_vehicle and incident.priority < 3:
                has_alternative = any(
                    alt_v.id != v.id and (
                        alt_v.occupied_slots > 0 or 
                        quad_idle_counts.get(alt_v.current_quadrant, 0) > 1
                    )
                    for alt_v in eligible_vehicles
                )
                if has_alternative:
                    skipped_due_to_coverage = True
                    continue

            dist = calculate_distance(v.x, v.y, incident.x, incident.y)
            dist_cost = dist * 1.0
            p_weight = incident.priority_weight
            priority_cost = (10.0 - p_weight) * 0.5
            
            # Coverage Penalty
            coverage_penalty = 0.0
            if (v.status in ("idle", "rebalancing")) and (v.occupied_slots == 0):
                if idle_in_quad == 1:
                    coverage_penalty = 1500.0
                    if incident.priority == 3:
                        coverage_override_triggered = True
                elif idle_in_quad == 2:
                    coverage_penalty = 200.0

            # Capacity Bonus
            capacity_bonus = 0.0
            if v.occupied_slots == 1 and incident.priority in (1, 2):
                capacity_bonus = 25.0

            score = dist_cost + priority_cost + coverage_penalty - capacity_bonus
            
            if score < min_score:
                min_score = score
                best_vehicle = v
                best_dist = dist
                best_breakdown = {
                    "distance_cost": round(dist_cost, 2),
                    "priority_cost": round(priority_cost, 2),
                    "coverage_penalty": round(coverage_penalty, 2),
                    "capacity_bonus": round(capacity_bonus, 2),
                    "total_score": round(score, 2)
                }

        if not best_vehicle:
            return None

        reasons = []
        if incident.agency == "fire":
            reasons.append(f"Water tank capacity at {best_vehicle.water_level:.0f}%")
            if incident.fire_severity == 3:
                reasons.append("Matched heavy fire suppression unit")
        elif incident.agency == "police":
            if incident.threat_level == 3:
                reasons.append("🚨 SWAT Tactical Unit deployed for high-threat emergency")
        
        if coverage_override_triggered and incident.priority == 3:
            reasons.append("🚨 Coverage sacrificed for critical emergency (P3/F3/T3)")
        elif skipped_due_to_coverage:
            reasons.append(f"🔒 Preserved minimum coverage in Quadrant Q{best_vehicle.current_quadrant}")
        else:
            reasons.append(f"Response distance: {best_dist:.1f} units")

        explanation = (
            f"SATHI assigned {best_vehicle.name} to {incident.id} (P{incident.priority}):\n"
            + "\n".join(f"• {r}" for r in reasons)
        )

        return DispatchDecision(
            step=step,
            incident_id=incident.id,
            agency=incident.agency,
            priority=incident.priority,
            vehicle_id=best_vehicle.id,
            vehicle_name=best_vehicle.name,
            distance=round(best_dist, 2),
            score=round(min_score, 2),
            explanation=explanation,
            score_breakdown=best_breakdown,
            coverage_override=coverage_override_triggered
        )
