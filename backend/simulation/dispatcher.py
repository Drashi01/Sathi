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
        
        for v in vehicles:
            # Check availability
            if incident.priority == 3:
                if v.occupied_slots > 0 or len(v.patients) > 0:
                    continue
            else:
                if v.occupied_slots >= v.capacity:
                    continue
                if any(p.priority == 3 for p in v.patients):
                    continue
            
            dist = calculate_distance(v.x, v.y, incident.x, incident.y)
            if dist < min_dist:
                min_dist = dist
                best_vehicle = v
                
        if not best_vehicle:
            return None
            
        explanation = (
            f"Greedy baseline assigned {best_vehicle.name} purely because it was the closest available vehicle "
            f"(distance: {min_dist:.2f} units), ignoring quadrant coverage risk and capacity optimization."
        )
        
        return DispatchDecision(
            step=step,
            incident_id=incident.id,
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
    SATHI Engine v2: Intelligent Dispatcher with Last Vehicle Protection Rule,
    Exponential Coverage Penalty, and Smart Priority Override.
    """
    def assign(
        self,
        incident: IncidentState,
        vehicles: List[VehicleState],
        quadrants: Dict[int, QuadrantState],
        step: int
    ) -> Optional[DispatchDecision]:
        
        # 1. Calculate current idle vehicles per quadrant
        quad_idle_counts = {1: 0, 2: 0, 3: 0, 4: 0}
        for v in vehicles:
            if (v.status == "idle" or v.status == "rebalancing") and v.occupied_slots == 0:
                quad_idle_counts[v.current_quadrant] += 1

        best_vehicle = None
        min_score = float('inf')
        best_breakdown = {}
        best_dist = 0.0
        coverage_override_triggered = False
        skipped_due_to_coverage = False

        for v in vehicles:
            # Availability Check
            if incident.priority == 3:
                # P3 requires exclusive empty ambulance
                if v.occupied_slots > 0 or len(v.patients) > 0:
                    continue
            else:
                # P1/P2 can share if occupied_slots < 2 and no P3 patient on board
                if v.occupied_slots >= v.capacity:
                    continue
                if any(p.priority == 3 for p in v.patients):
                    continue

            v_quad = v.current_quadrant
            idle_in_quad = quad_idle_counts.get(v_quad, 0)
            is_last_vehicle = (v.status in ("idle", "rebalancing")) and (v.occupied_slots == 0) and (idle_in_quad == 1)

            # 🔒 1. LAST VEHICLE PROTECTION RULE
            # IF assigning a vehicle will cause quadrant_idle_count == 0,
            # DO NOT ASSIGN that vehicle unless incident priority == 3 AND no alternative vehicle exists.
            if is_last_vehicle and incident.priority < 3:
                # Check if there exists ANY other candidate vehicle that is not the last vehicle in its quadrant
                has_alternative = any(
                    alt_v.id != v.id and (
                        alt_v.occupied_slots > 0 or 
                        quad_idle_counts.get(alt_v.current_quadrant, 0) > 1
                    )
                    for alt_v in vehicles
                    if alt_v.occupied_slots < alt_v.capacity and not any(p.priority == 3 for p in alt_v.patients)
                )
                if has_alternative:
                    # STRICT RULE: Exclude this vehicle to protect quadrant coverage!
                    skipped_due_to_coverage = True
                    continue

            dist = calculate_distance(v.x, v.y, incident.x, incident.y)
            
            # Distance Cost
            dist_cost = dist * 1.0
            
            # Priority Urgency Weighting
            p_weight = incident.priority_weight
            priority_cost = (10.0 - p_weight) * 0.5
            
            # ⚖️ 2. STRONG COVERAGE PENALTY IN SCORING
            coverage_penalty = 0.0
            if (v.status in ("idle", "rebalancing")) and (v.occupied_slots == 0):
                if idle_in_quad == 1:
                    # VERY HIGH Penalty (1500) for draining last vehicle
                    coverage_penalty = 1500.0
                    if incident.priority == 3:
                        coverage_override_triggered = True
                elif idle_in_quad == 2:
                    # MEDIUM Penalty (200) for reducing to 1
                    coverage_penalty = 200.0
                elif idle_in_quad == 3:
                    coverage_penalty = 20.0
            
            # 🚑 Capacity Bonus for reusing 1/2 filled ambulance
            capacity_bonus = 0.0
            if v.occupied_slots == 1 and incident.priority in (1, 2):
                capacity_bonus = 25.0  # High bonus to preserve fully idle vehicles

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

        # Build AI Explanation text
        reasons = []
        if coverage_override_triggered and incident.priority == 3:
            reasons.append("🚨 Coverage sacrificed due to high-priority emergency (P3)")
        elif skipped_due_to_coverage:
            reasons.append(f"🔒 Assignment skipped to preserve minimum coverage in Quadrant Q{best_vehicle.current_quadrant}")
        else:
            reasons.append(f"🛡️ Preserves minimum coverage guarantee in Quadrant Q{best_vehicle.current_quadrant}")

        reasons.append(f"Response distance: {best_dist:.1f} units")
        if best_breakdown.get("capacity_bonus", 0) > 0:
            reasons.append(f"Utilized active capacity slot (1/2 filled) on {best_vehicle.name}")

        explanation = (
            f"SATHI Engine assigned {best_vehicle.name} to {incident.id} (P{incident.priority}):\n"
            + "\n".join(f"• {r}" for r in reasons)
        )

        return DispatchDecision(
            step=step,
            incident_id=incident.id,
            priority=incident.priority,
            vehicle_id=best_vehicle.id,
            vehicle_name=best_vehicle.name,
            distance=round(best_dist, 2),
            score=round(min_score, 2),
            explanation=explanation,
            score_breakdown=best_breakdown,
            coverage_override=coverage_override_triggered
        )
