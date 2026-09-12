import numpy as np
from typing import List, Tuple
from .models import IncidentState, VehicleState, QuadrantState, TrafficZone, HydrantStation

PRIORITY_WEIGHTS = {1: 1.0, 2: 3.0, 3: 7.0}

def get_quadrant(x: float, y: float) -> int:
    if x < 50 and y >= 50:
        return 1
    elif x >= 50 and y >= 50:
        return 2
    elif x < 50 and y < 50:
        return 3
    else:
        return 4

def generate_traffic_zones() -> List[TrafficZone]:
    return [
        TrafficZone(id="TZ-1", name="Central Grid Chokepoint", x_min=40.0, x_max=60.0, y_min=40.0, y_max=60.0, speed_factor=0.4, severity="high"),
        TrafficZone(id="TZ-2", name="North Expressway Bottleneck", x_min=15.0, x_max=45.0, y_min=70.0, y_max=85.0, speed_factor=0.5, severity="high"),
        TrafficZone(id="TZ-3", name="South-East Industrial Delay", x_min=65.0, x_max=90.0, y_min=15.0, y_max=35.0, speed_factor=0.5, severity="high")
    ]

def generate_hydrant_stations() -> List[HydrantStation]:
    return [
        HydrantStation(id="HYD-1", name="Q1 North Hydrant Station", x=20.0, y=80.0, quadrant=1),
        HydrantStation(id="HYD-2", name="Q2 East Hydrant Station", x=80.0, y=80.0, quadrant=2),
        HydrantStation(id="HYD-3", name="Q3 West Hydrant Station", x=20.0, y=20.0, quadrant=3),
        HydrantStation(id="HYD-4", name="Q4 South Hydrant Station", x=80.0, y=20.0, quadrant=4)
    ]

def is_in_traffic_zone(x: float, y: float, zones: List[TrafficZone]) -> Tuple[bool, float]:
    for z in zones:
        if z.x_min <= x <= z.x_max and z.y_min <= y <= z.y_max:
            return True, z.speed_factor
    return False, 1.0

# 🚑 Medical Incidents & Fleet
def generate_incidents(count: int = 100, seed: int = 42) -> List[IncidentState]:
    rng = np.random.RandomState(seed)
    incidents = []
    arrival_times = rng.randint(0, 60, size=count)
    arrival_times.sort()
    priorities = rng.choice([1, 2, 3], size=count, p=[0.60, 0.30, 0.10])
    
    for i in range(count):
        x = round(float(rng.uniform(2.0, 98.0)), 2)
        y = round(float(rng.uniform(2.0, 98.0)), 2)
        p = int(priorities[i])
        arr = int(arrival_times[i])
        quad = get_quadrant(x, y)
        incidents.append(
            IncidentState(
                id=f"MED-{i+1:03d}",
                agency="medical",
                x=x, y=y, quadrant=quad, arrival_time=arr,
                priority=p, priority_weight=PRIORITY_WEIGHTS[p], service_time=8, status="unassigned"
            )
        )
    return incidents

def generate_initial_vehicles() -> List[VehicleState]:
    vehicles = []
    quad_offsets = {
        1: [(25, 75), (15, 85), (35, 85), (15, 65), (35, 65)],
        2: [(75, 75), (65, 85), (85, 85), (65, 65), (85, 65)],
        3: [(25, 25), (15, 35), (35, 35), (15, 15), (35, 15)],
        4: [(75, 25), (65, 35), (85, 35), (65, 15), (85, 15)]
    }
    
    v_counter = 1
    for quad_id, coords in quad_offsets.items():
        for x, y in coords:
            v_id = f"AMB-{v_counter:02d}"
            vehicles.append(
                VehicleState(
                    id=v_id, name=f"Ambulance {v_id}", agency="medical",
                    home_quadrant=quad_id, current_quadrant=quad_id, x=float(x), y=float(y),
                    capacity=2, occupied_slots=0, patients=[], status="idle", total_dispatches=0
                )
            )
            v_counter += 1
    return vehicles

# 🚒 Fire Incidents & Fleet
def generate_fire_incidents(count: int = 100, seed: int = 42) -> List[IncidentState]:
    rng = np.random.RandomState(seed + 100)
    incidents = []
    arrival_times = rng.randint(0, 60, size=count)
    arrival_times.sort()
    priorities = rng.choice([1, 2, 3], size=count, p=[0.55, 0.35, 0.10])
    
    for i in range(count):
        x = round(float(rng.uniform(2.0, 98.0)), 2)
        y = round(float(rng.uniform(2.0, 98.0)), 2)
        p = int(priorities[i])
        arr = int(arrival_times[i])
        quad = get_quadrant(x, y)
        req_water = 300.0 if p == 1 else 600.0 if p == 2 else 1200.0
        
        incidents.append(
            IncidentState(
                id=f"FIRE-{i+1:03d}",
                agency="fire",
                x=x, y=y, quadrant=quad, arrival_time=arr,
                priority=p, priority_weight=PRIORITY_WEIGHTS[p], service_time=10,
                fire_severity=p, required_water=req_water, status="unassigned"
            )
        )
    return incidents

def generate_fire_vehicles() -> List[VehicleState]:
    vehicles = []
    quad_offsets = {
        1: [(20, 80), (30, 80), (20, 70), (30, 70), (25, 75)],
        2: [(70, 80), (80, 80), (70, 70), (80, 70), (75, 75)],
        3: [(20, 30), (30, 30), (20, 20), (30, 20), (25, 25)],
        4: [(70, 30), (80, 30), (70, 20), (80, 20), (75, 25)]
    }
    
    types = ["pumper", "ladder", "pumper", "tanker", "pumper"]
    v_counter = 1
    for quad_id, coords in quad_offsets.items():
        for idx, (x, y) in enumerate(coords):
            v_id = f"ENG-{v_counter:02d}"
            v_type = types[idx % len(types)]
            vehicles.append(
                VehicleState(
                    id=v_id, name=f"Fire Engine {v_id}", agency="fire",
                    home_quadrant=quad_id, current_quadrant=quad_id, x=float(x), y=float(y),
                    capacity=1, occupied_slots=0, water_level=100.0, vehicle_type=v_type,
                    status="idle", total_dispatches=0
                )
            )
            v_counter += 1
    return vehicles

# 🚔 Police Incidents & Fleet
def generate_police_incidents(count: int = 100, seed: int = 42) -> List[IncidentState]:
    rng = np.random.RandomState(seed + 200)
    incidents = []
    arrival_times = rng.randint(0, 60, size=count)
    arrival_times.sort()
    priorities = rng.choice([1, 2, 3], size=count, p=[0.60, 0.30, 0.10])
    
    for i in range(count):
        x = round(float(rng.uniform(2.0, 98.0)), 2)
        y = round(float(rng.uniform(2.0, 98.0)), 2)
        p = int(priorities[i])
        arr = int(arrival_times[i])
        quad = get_quadrant(x, y)
        
        incidents.append(
            IncidentState(
                id=f"TAC-{i+1:03d}",
                agency="police",
                x=x, y=y, quadrant=quad, arrival_time=arr,
                priority=p, priority_weight=PRIORITY_WEIGHTS[p], service_time=7,
                threat_level=p, requires_swat=(p == 3), status="unassigned"
            )
        )
    return incidents

def generate_police_vehicles() -> List[VehicleState]:
    vehicles = []
    quad_offsets = {
        1: [(22, 78), (28, 82), (18, 72), (32, 68), (25, 75)],
        2: [(72, 78), (78, 82), (68, 72), (82, 68), (75, 75)],
        3: [(22, 28), (28, 32), (18, 22), (32, 18), (25, 25)],
        4: [(72, 28), (78, 32), (68, 22), (82, 18), (75, 25)]
    }
    
    types = ["patrol", "patrol", "interceptor", "swat", "patrol"]
    v_counter = 1
    for quad_id, coords in quad_offsets.items():
        for idx, (x, y) in enumerate(coords):
            v_id = f"PAT-{v_counter:02d}"
            u_type = types[idx % len(types)]
            vehicles.append(
                VehicleState(
                    id=v_id, name=f"Police Unit {v_id}", agency="police",
                    home_quadrant=quad_id, current_quadrant=quad_id, x=float(x), y=float(y),
                    capacity=2, occupied_slots=0, unit_type=u_type,
                    status="idle", total_dispatches=0
                )
            )
            v_counter += 1
    return vehicles

def get_quadrant_definitions() -> List[QuadrantState]:
    return [
        QuadrantState(id=1, name="Q1 (North-West)", x_range=[0.0, 50.0], y_range=[50.0, 100.0], idle_vehicles=5, total_vehicles=5, is_outage=False, incident_count=0),
        QuadrantState(id=2, name="Q2 (North-East)", x_range=[50.0, 100.0], y_range=[50.0, 100.0], idle_vehicles=5, total_vehicles=5, is_outage=False, incident_count=0),
        QuadrantState(id=3, name="Q3 (South-West)", x_range=[0.0, 50.0], y_range=[0.0, 50.0], idle_vehicles=5, total_vehicles=5, is_outage=False, incident_count=0),
        QuadrantState(id=4, name="Q4 (South-East)", x_range=[50.0, 100.0], y_range=[0.0, 50.0], idle_vehicles=5, total_vehicles=5, is_outage=False, incident_count=0)
    ]
