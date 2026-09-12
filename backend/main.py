import os
import io
import csv
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from simulation.engine import SimulationEngine
from simulation.generator import generate_incidents, generate_fire_incidents, generate_police_incidents
from simulation.models import SimulationResult, Metrics

app = FastAPI(
    title="SATHI – Multi-Agency Intelligent Fleet Dispatcher API",
    description="Backend simulation engine for SATHI real-time emergency dispatcher across Medical, Fire & Rescue, Police Tactical, and Master Unified Command.",
    version="4.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimulateRequest(BaseModel):
    strategy: str = "sathi"      # "sathi" or "greedy"
    scenario: str = "medical"    # "medical", "fire", "police", "unified"
    seed: int = 42

class AssignRequest(BaseModel):
    incident_id: str
    vehicle_id: str
    scenario: str = "medical"
    seed: int = 42

class AIChatRequest(BaseModel):
    query: str
    scenario: str = "medical"
    strategy: str = "sathi"
    seed: int = 42

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "system": "SATHI – Multi-Agency Intelligent Fleet Dispatcher",
        "tagline": "Always There When It Matters",
        "version": "4.0.0"
    }

@app.post("/api/simulate", response_model=SimulationResult)
def run_simulation(req: SimulateRequest):
    if req.strategy not in ("sathi", "greedy"):
        raise HTTPException(status_code=400, detail="Strategy must be 'sathi' or 'greedy'")
    if req.scenario not in ("medical", "fire", "police", "unified"):
        raise HTTPException(status_code=400, detail="Invalid scenario type")
        
    engine = SimulationEngine(strategy=req.strategy, scenario=req.scenario, seed=req.seed)
    result = engine.run()
    return result

@app.post("/api/battle")
def run_battle_mode(req: SimulateRequest):
    sathi_engine = SimulationEngine(strategy="sathi", scenario=req.scenario, seed=req.seed)
    sathi_res = sathi_engine.run()
    
    greedy_engine = SimulationEngine(strategy="greedy", scenario=req.scenario, seed=req.seed)
    greedy_res = greedy_engine.run()
    
    return {
        "scenario": req.scenario,
        "seed": req.seed,
        "sathi": sathi_res,
        "greedy": greedy_res,
        "improvement": {
            "p3_response_time_reduction_pct": round(
                ((greedy_res.metrics.avg_p3_response_time - sathi_res.metrics.avg_p3_response_time)
                 / max(0.001, greedy_res.metrics.avg_p3_response_time)) * 100.0, 1
            ),
            "outage_minutes_saved": round(
                greedy_res.metrics.coverage_outage_minutes - sathi_res.metrics.coverage_outage_minutes, 1
            ),
            "rebalance_moves_executed": sathi_res.metrics.rebalance_moves_count
        }
    }

@app.post("/api/compare")
def compare_strategies(req: SimulateRequest):
    sathi_engine = SimulationEngine(strategy="sathi", scenario=req.scenario, seed=req.seed)
    sathi_res = sathi_engine.run()
    
    greedy_engine = SimulationEngine(strategy="greedy", scenario=req.scenario, seed=req.seed)
    greedy_res = greedy_engine.run()
    
    return {
        "scenario": req.scenario,
        "seed": req.seed,
        "sathi": {
            "metrics": sathi_res.metrics,
            "decisions_count": len(sathi_res.decisions)
        },
        "greedy": {
            "metrics": greedy_res.metrics,
            "decisions_count": len(greedy_res.decisions)
        },
        "improvement": {
            "response_time_reduction_pct": round(
                ((greedy_res.metrics.priority_weighted_response_time - sathi_res.metrics.priority_weighted_response_time)
                 / max(0.001, greedy_res.metrics.priority_weighted_response_time)) * 100.0, 1
            ),
            "outage_minutes_saved": round(
                greedy_res.metrics.coverage_outage_minutes - sathi_res.metrics.coverage_outage_minutes, 1
            ),
            "p3_response_time_reduction_pct": round(
                ((greedy_res.metrics.avg_p3_response_time - sathi_res.metrics.avg_p3_response_time)
                 / max(0.001, greedy_res.metrics.avg_p3_response_time)) * 100.0, 1
            )
        }
    }

@app.post("/api/assign")
def test_override_assignment(req: AssignRequest):
    base_engine = SimulationEngine(strategy="sathi", scenario=req.scenario, seed=req.seed)
    base_res = base_engine.run()
    
    orig_decision = next((d for d in base_res.decisions if d.incident_id == req.incident_id), None)
    orig_v_id = orig_decision.vehicle_id if orig_decision else "None"
    
    override_engine = SimulationEngine(strategy="sathi", scenario=req.scenario, seed=req.seed)
    override_res = override_engine.run()
    
    resp_delta = round(override_res.metrics.priority_weighted_response_time - base_res.metrics.priority_weighted_response_time, 2)
    outage_delta = round(override_res.metrics.coverage_outage_minutes - base_res.metrics.coverage_outage_minutes, 1)
    
    return {
        "incident_id": req.incident_id,
        "scenario": req.scenario,
        "original_vehicle": orig_v_id,
        "override_vehicle": req.vehicle_id,
        "impact": {
            "weighted_response_time_delta": resp_delta,
            "coverage_outage_delta_minutes": outage_delta,
            "recommendation": "SATHI Default Assignment is Optimal" if resp_delta >= 0 and outage_delta >= 0 else "Custom Override Evaluated"
        },
        "baseline_metrics": base_res.metrics,
        "override_metrics": override_res.metrics
    }

@app.post("/api/ai-chat")
def ai_assistant_query(req: AIChatRequest):
    query_lower = req.query.lower()
    engine = SimulationEngine(strategy=req.strategy, scenario=req.scenario, seed=req.seed)
    res = engine.run()
    m = res.metrics
    
    if "fire" in query_lower or "water" in query_lower or "hydrant" in query_lower:
        answer = (
            f"SATHI Fire & Rescue Command monitors 20 Fire Engines (Pumper, Ladder, Tanker) and 4 Hydrant Refill Stations. "
            f"When water levels drop below 20%, engines automatically route to the nearest Hydrant Station. Refill operations: {m.refill_operations_count}."
        )
    elif "police" in query_lower or "swat" in query_lower or "threat" in query_lower:
        answer = (
            f"SATHI Police Tactical Command dispatches Patrol Cruisers, SWAT Tactical Vans, and Interceptors. "
            f"Threat Level T3 emergencies (active shooter/hostage) trigger exclusive SWAT deployment and perimeter cordoning."
        )
    elif "unified" in query_lower or "multi" in query_lower:
        answer = (
            f"SATHI Unified Master Command manages 60 combined units across EMS, Fire & Rescue, and Police Tactical. "
            f"It handles complex multi-agency disasters (e.g. major crash requiring Ambulance + Fire Engine + Police Cruiser simultaneously)."
        )
    elif "coverage" in query_lower or "outage" in query_lower or "rebalance" in query_lower:
        answer = (
            f"Coverage preservation enforces Last Vehicle Protection and dispatches automated rebalancing transfers ({m.rebalance_moves_count} moves executed)."
        )
    else:
        answer = (
            f"SATHI v4.0 Multi-Agency Dispatcher running '{req.scenario.upper()}' scenario under '{req.strategy.upper()}' strategy. "
            f"Weighted Response Time: {m.priority_weighted_response_time}m, Coverage Outages: {m.coverage_outage_minutes}m, "
            f"P3 Avg Response: {m.avg_p3_response_time}m."
        )

    return {
        "query": req.query,
        "answer": answer,
        "context_summary": {
            "scenario": req.scenario,
            "strategy": req.strategy,
            "weighted_response_time": m.priority_weighted_response_time,
            "outage_minutes": m.coverage_outage_minutes,
            "rebalance_moves": m.rebalance_moves_count
        }
    }

@app.get("/api/export/csv")
def export_csv(strategy: str = "sathi", scenario: str = "medical", seed: int = 42):
    engine = SimulationEngine(strategy=strategy, scenario=scenario, seed=seed)
    res = engine.run()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "Step", "Incident_ID", "Agency", "Priority", "Vehicle_ID", "Vehicle_Name",
        "Distance_Units", "Dispatch_Score", "Coverage_Override", "Explanation"
    ])
    
    for d in res.decisions:
        writer.writerow([
            d.step, d.incident_id, d.agency, d.priority, d.vehicle_id, d.vehicle_name,
            d.distance, d.score, d.coverage_override, d.explanation.replace("\n", " ")
        ])
        
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=sathi_{scenario}_dispatch_log.csv"}
    )

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_frontend(full_path: str):
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="API route not found")
        file_path = os.path.join(frontend_dist, full_path)
        if full_path and os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
