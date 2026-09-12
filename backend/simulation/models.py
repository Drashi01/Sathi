from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class Point(BaseModel):
    x: float
    y: float

class Patient(BaseModel):
    incident_id: str
    priority: int
    target_x: float
    target_y: float
    status: str = "en_route"  # "en_route", "servicing", "completed"
    service_remaining: float = 8.0
    pickup_time: Optional[float] = None

class TrafficZone(BaseModel):
    id: str
    name: str
    x_min: float
    x_max: float
    y_min: float
    y_max: float
    speed_factor: float = 0.4
    severity: str = "high"

class VehicleState(BaseModel):
    id: str
    name: str
    home_quadrant: int
    current_quadrant: int
    x: float
    y: float
    capacity: int = 2
    occupied_slots: int = 0
    patients: List[Patient] = Field(default_factory=list)
    target_x: Optional[float] = None
    target_y: Optional[float] = None
    status: str = "idle"  # "idle", "moving", "busy", "rebalancing"
    is_rebalancing: bool = False
    rebalance_target_quadrant: Optional[int] = None
    in_traffic_zone: bool = False
    current_speed: float = 1.0
    total_dispatches: int = 0

class IncidentState(BaseModel):
    id: str
    x: float
    y: float
    quadrant: int
    arrival_time: int
    priority: int
    priority_weight: float
    service_time: int = 8
    status: str = "unassigned"  # "unassigned", "assigned", "servicing", "completed"
    assigned_vehicle_id: Optional[str] = None
    dispatch_time: Optional[int] = None
    pickup_time: Optional[float] = None
    completion_time: Optional[float] = None
    response_time: Optional[float] = None

class DispatchDecision(BaseModel):
    step: int
    incident_id: str
    priority: int
    vehicle_id: str
    vehicle_name: str
    distance: float
    score: float
    explanation: str
    score_breakdown: Dict[str, float]
    coverage_override: bool = False
    traffic_delayed: bool = False

class QuadrantState(BaseModel):
    id: int
    name: str
    x_range: List[float]
    y_range: List[float]
    idle_vehicles: int
    total_vehicles: int
    is_outage: bool
    incident_count: int
    is_rebalancing_target: bool = False

class Metrics(BaseModel):
    total_incidents: int
    assigned_incidents: int
    completed_incidents: int
    priority_weighted_response_time: float
    avg_p1_response_time: float
    avg_p2_response_time: float
    avg_p3_response_time: float
    coverage_outage_minutes: float
    rebalance_moves_count: int = 0
    traffic_delays_encountered: int = 0
    assignment_validity_percent: float
    capacity_utilization_percent: float
    runtime_ms: float

class StepSnapshot(BaseModel):
    time: int
    vehicles: List[VehicleState]
    incidents: List[IncidentState]
    quadrants: List[QuadrantState]
    recent_decisions: List[DispatchDecision]
    traffic_zones: List[TrafficZone] = Field(default_factory=list)
    rebalance_events: List[str] = Field(default_factory=list)
    is_critical_broadcast: bool = False
    broadcast_incident: Optional[IncidentState] = None
    outage_active: bool

class SimulationResult(BaseModel):
    strategy: str
    seed: int
    total_steps: int
    snapshots: List[StepSnapshot]
    metrics: Metrics
    decisions: List[DispatchDecision]
