import time
import math
from typing import List, Dict, Any, Tuple
from .models import (
    IncidentState, VehicleState, Patient, QuadrantState, TrafficZone,
    StepSnapshot, Metrics, SimulationResult, DispatchDecision
)
from .generator import (
    generate_incidents, generate_initial_vehicles, get_quadrant_definitions,
    get_quadrant, generate_traffic_zones, is_in_traffic_zone
)
from .dispatcher import SATHIDispatcher, GreedyDispatcher, calculate_distance

class SimulationEngine:
    def __init__(self, strategy: str = "sathi", seed: int = 42, custom_incidents: List[IncidentState] = None):
        self.strategy_name = strategy
        self.seed = seed
        
        if strategy == "sathi":
            self.dispatcher = SATHIDispatcher()
        else:
            self.dispatcher = GreedyDispatcher()
            
        if custom_incidents is not None:
            self.incidents = [inc.model_copy(deep=True) for inc in custom_incidents]
        else:
            self.incidents = generate_incidents(count=100, seed=seed)
            
        self.vehicles = generate_initial_vehicles()
        self.quadrants = {q.id: q.model_copy(deep=True) for q in get_quadrant_definitions()}
        self.traffic_zones = generate_traffic_zones()
        self.snapshots: List[StepSnapshot] = []
        self.decisions: List[DispatchDecision] = []
        self.rebalance_events: List[str] = []
        self.coverage_outage_minutes = 0.0
        self.rebalance_moves_count = 0
        self.traffic_delays_encountered = 0

        # Quadrant Center Coordinates for Rebalancing
        self.quad_centers = {
            1: (25.0, 75.0),
            2: (75.0, 75.0),
            3: (25.0, 25.0),
            4: (75.0, 25.0)
        }

    def run(self, max_steps: int = 150) -> SimulationResult:
        start_time = time.time()
        incident_map = {inc.id: inc for inc in self.incidents}
        unassigned_queue: List[IncidentState] = []
        
        for current_time in range(max_steps):
            # 1. Process active vehicle movement & patient service timers
            self._update_vehicles(current_time, incident_map)
            
            # 2. Reveal new incidents arriving at current_time
            new_incidents = [inc for inc in self.incidents if inc.arrival_time == current_time]
            unassigned_queue.extend(new_incidents)
            
            # Sort unassigned queue: Priority DESC (P3=7, P2=3, P1=1), Arrival ASC
            unassigned_queue.sort(key=lambda x: (-x.priority_weight, x.arrival_time))
            
            # 3. Update quadrant states & count idle vehicles
            quad_idle_counts = {1: 0, 2: 0, 3: 0, 4: 0}
            quad_inc_counts = {1: 0, 2: 0, 3: 0, 4: 0}
            
            for v in self.vehicles:
                v.current_quadrant = get_quadrant(v.x, v.y)
                if (v.status in ("idle", "rebalancing")) and v.occupied_slots == 0:
                    quad_idle_counts[v.current_quadrant] += 1

            for inc in self.incidents:
                if inc.status != "completed":
                    quad_inc_counts[inc.quadrant] += 1

            is_outage = any(count == 0 for count in quad_idle_counts.values())
            if is_outage and current_time < 60:
                self.coverage_outage_minutes += 1.0

            for q_id, q_state in self.quadrants.items():
                idle_c = quad_idle_counts[q_id]
                q_state.idle_vehicles = idle_c
                q_state.is_outage = (idle_c == 0)
                q_state.incident_count = quad_inc_counts[q_id]

            # 4. Dispatch unassigned incidents causally
            recent_step_decisions = []
            assigned_this_step = []
            
            for inc in unassigned_queue:
                decision = self.dispatcher.assign(
                    incident=inc,
                    vehicles=self.vehicles,
                    quadrants=self.quadrants,
                    step=current_time
                )
                if decision:
                    v = next(veh for veh in self.vehicles if veh.id == decision.vehicle_id)
                    
                    inc.status = "assigned"
                    inc.assigned_vehicle_id = v.id
                    inc.dispatch_time = current_time
                    
                    patient = Patient(
                        incident_id=inc.id,
                        priority=inc.priority,
                        target_x=inc.x,
                        target_y=inc.y,
                        status="en_route",
                        service_remaining=8.0
                    )
                    v.patients.append(patient)
                    v.occupied_slots = len(v.patients)
                    v.total_dispatches += 1
                    
                    # Intercept any active rebalancing
                    v.is_rebalancing = False
                    v.rebalance_target_quadrant = None
                    
                    v.target_x = inc.x
                    v.target_y = inc.y
                    v.status = "busy" if v.occupied_slots >= v.capacity or inc.priority == 3 else "moving"
                    
                    assigned_this_step.append(inc)
                    recent_step_decisions.append(decision)
                    self.decisions.append(decision)

            for inc in assigned_this_step:
                unassigned_queue.remove(inc)

            # 5. 🔄 AUTOMATED QUADRANT REBALANCING LOGIC (SATHI Engine Only)
            step_rebalance_notes = []
            if self.strategy_name == "sathi":
                step_rebalance_notes = self._trigger_rebalancing(quad_idle_counts)

            # 6. Take Step Snapshot for UI Animation
            snapshot_vehicles = [v.model_copy(deep=True) for v in self.vehicles]
            snapshot_incidents = [inc.model_copy(deep=True) for inc in self.incidents]
            snapshot_quadrants = [q.model_copy(deep=True) for q in self.quadrants.values()]
            
            self.snapshots.append(
                StepSnapshot(
                    time=current_time,
                    vehicles=snapshot_vehicles,
                    incidents=snapshot_incidents,
                    quadrants=snapshot_quadrants,
                    recent_decisions=recent_step_decisions,
                    traffic_zones=self.traffic_zones,
                    rebalance_events=step_rebalance_notes,
                    outage_active=is_outage
                )
            )

            all_done = all(inc.status == "completed" for inc in self.incidents)
            if all_done and current_time >= 60:
                break

        runtime_ms = round((time.time() - start_time) * 1000, 2)
        metrics = self._calculate_metrics(runtime_ms)
        
        return SimulationResult(
            strategy=self.strategy_name,
            seed=self.seed,
            total_steps=len(self.snapshots),
            snapshots=self.snapshots,
            metrics=metrics,
            decisions=self.decisions
        )

    def _trigger_rebalancing(self, quad_idle_counts: Dict[int, int]) -> List[str]:
        notes = []
        # Find weak quadrants (idle_vehicles <= 1, prioritized 0-idle outages first)
        weak_quads = [q_id for q_id, count in sorted(quad_idle_counts.items(), key=lambda x: x[1]) if count <= 1]
        surplus_quads = [q_id for q_id, count in quad_idle_counts.items() if count >= 2]

        if weak_quads and surplus_quads:
            for w_quad in weak_quads:
                if quad_idle_counts[w_quad] >= 1 and any(quad_idle_counts[q] == 0 for q in weak_quads):
                    continue  # prioritize 0-idle outage quadrants first
                
                best_v = None
                min_dist = float('inf')
                target_center = self.quad_centers[w_quad]

                for s_quad in surplus_quads:
                    if s_quad == w_quad:
                        continue
                    for v in self.vehicles:
                        if v.current_quadrant == s_quad and v.status == "idle" and v.occupied_slots == 0:
                            d = calculate_distance(v.x, v.y, target_center[0], target_center[1])
                            if d < min_dist:
                                min_dist = d
                                best_v = v

                if best_v:
                    best_v.status = "rebalancing"
                    best_v.is_rebalancing = True
                    best_v.rebalance_target_quadrant = w_quad
                    best_v.target_x = target_center[0]
                    best_v.target_y = target_center[1]
                    
                    self.rebalance_moves_count += 1
                    msg = f"🔄 Rebalancing {best_v.name} from Q{best_v.current_quadrant} to reinforce Q{w_quad}"
                    notes.append(msg)
                    self.rebalance_events.append(msg)
                    quad_idle_counts[best_v.current_quadrant] -= 1
                    quad_idle_counts[w_quad] += 1
                    if quad_idle_counts[best_v.current_quadrant] < 2:
                        if best_v.current_quadrant in surplus_quads:
                            surplus_quads.remove(best_v.current_quadrant)
        return notes

    def _update_vehicles(self, current_time: int, incident_map: Dict[str, IncidentState]):
        for v in self.vehicles:
            in_tz, speed_factor = is_in_traffic_zone(v.x, v.y, self.traffic_zones)
            v.in_traffic_zone = in_tz
            v.current_speed = round(1.0 * speed_factor, 2)
            
            if in_tz and v.status in ("moving", "busy"):
                self.traffic_delays_encountered += 1

            if v.status == "idle" or (not v.patients and not v.is_rebalancing):
                v.target_x = None
                v.target_y = None
                v.occupied_slots = 0
                v.is_rebalancing = False
                v.status = "idle"
                continue

            # Movement towards target
            if v.target_x is not None and v.target_y is not None:
                dist = calculate_distance(v.x, v.y, v.target_x, v.target_y)
                move_dist = v.current_speed
                
                if dist <= move_dist:
                    v.x = v.target_x
                    v.y = v.target_y
                    
                    # If rebalancing reached target center
                    if v.is_rebalancing:
                        v.is_rebalancing = False
                        v.rebalance_target_quadrant = None
                        v.status = "idle"
                        v.target_x = None
                        v.target_y = None
                    else:
                        for p in v.patients:
                            if p.status == "en_route" and p.target_x == v.target_x and p.target_y == v.target_y:
                                p.status = "servicing"
                                p.pickup_time = float(current_time)
                                
                                inc = incident_map.get(p.incident_id)
                                if inc:
                                    inc.status = "servicing"
                                    inc.pickup_time = float(current_time)
                                    inc.response_time = max(0.0, float(current_time) - float(inc.arrival_time))
                else:
                    dx = (v.target_x - v.x) / dist
                    dy = (v.target_y - v.y) / dist
                    v.x += dx * move_dist
                    v.y += dy * move_dist

            # Servicing patient countdowns
            completed_patients = []
            for p in v.patients:
                if p.status == "servicing":
                    p.service_remaining -= 1.0
                    if p.service_remaining <= 0:
                        p.status = "completed"
                        completed_patients.append(p)
                        
                        inc = incident_map.get(p.incident_id)
                        if inc:
                            inc.status = "completed"
                            inc.completion_time = float(current_time)

            for p in completed_patients:
                v.patients.remove(p)
                
            v.occupied_slots = len(v.patients)
            
            if not v.is_rebalancing:
                en_route_patients = [p for p in v.patients if p.status == "en_route"]
                if en_route_patients:
                    v.target_x = en_route_patients[0].target_x
                    v.target_y = en_route_patients[0].target_y
                    v.status = "busy" if v.occupied_slots >= v.capacity or any(p.priority == 3 for p in v.patients) else "moving"
                elif v.patients:
                    v.target_x = None
                    v.target_y = None
                    v.status = "busy" if v.occupied_slots >= v.capacity or any(p.priority == 3 for p in v.patients) else "moving"
                else:
                    v.target_x = None
                    v.target_y = None
                    v.status = "idle"

    def _calculate_metrics(self, runtime_ms: float) -> Metrics:
        total_inc = len(self.incidents)
        assigned_inc = sum(1 for inc in self.incidents if inc.status in ("assigned", "servicing", "completed"))
        completed_inc = sum(1 for inc in self.incidents if inc.status == "completed")
        
        response_times = [inc.response_time for inc in self.incidents if inc.response_time is not None]
        p1_resps = [inc.response_time for inc in self.incidents if inc.priority == 1 and inc.response_time is not None]
        p2_resps = [inc.response_time for inc in self.incidents if inc.priority == 2 and inc.response_time is not None]
        p3_resps = [inc.response_time for inc in self.incidents if inc.priority == 3 and inc.response_time is not None]
        
        avg_p1 = float(sum(p1_resps) / len(p1_resps)) if p1_resps else 0.0
        avg_p2 = float(sum(p2_resps) / len(p2_resps)) if p2_resps else 0.0
        avg_p3 = float(sum(p3_resps) / len(p3_resps)) if p3_resps else 0.0
        
        weighted_sum = sum(inc.priority_weight * (inc.response_time or 0.0) for inc in self.incidents if inc.response_time is not None)
        weight_total = sum(inc.priority_weight for inc in self.incidents if inc.response_time is not None)
        pw_resp_time = float(weighted_sum / weight_total) if weight_total > 0 else 0.0

        total_dispatches = sum(v.total_dispatches for v in self.vehicles)
        cap_util = min(100.0, (total_dispatches / (20.0 * 2.0)) * 100.0)

        return Metrics(
            total_incidents=total_inc,
            assigned_incidents=assigned_inc,
            completed_incidents=completed_inc,
            priority_weighted_response_time=round(pw_resp_time, 2),
            avg_p1_response_time=round(avg_p1, 2),
            avg_p2_response_time=round(avg_p2, 2),
            avg_p3_response_time=round(avg_p3, 2),
            coverage_outage_minutes=round(self.coverage_outage_minutes, 1),
            rebalance_moves_count=self.rebalance_moves_count,
            traffic_delays_encountered=self.traffic_delays_encountered,
            assignment_validity_percent=100.0 if assigned_inc > 0 else 0.0,
            capacity_utilization_percent=round(cap_util, 1),
            runtime_ms=runtime_ms
        )
