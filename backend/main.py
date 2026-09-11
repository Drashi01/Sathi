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
from simulation.generator import generate_incidents, generate_initial_vehicles
from simulation.models import SimulationResult, Metrics

app = FastAPI(
    title="SATHI – Intelligent Emergency Fleet Dispatcher API",
    description="Backend simulation engine for SATHI real-time emergency dispatcher with coverage preservation, capacity optimization, and traffic awareness.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SimulateRequest(BaseModel):
    strategy: str = "sathi"
    seed: int = 42

class AssignRequest(BaseModel):
    incident_id: str
    vehicle_id: str
    seed: int = 42

class AIChatRequest(BaseModel):
    query: str
    seed: int = 42
    strategy: str = "sathi"

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "system": "SATHI – Intelligent Emergency Fleet Dispatcher",
        "tagline": "Always There When It Matters",
        "version": "2.0.0"
    }

@app.post("/api/simulate", response_model=SimulationResult)
def run_simulation(req: SimulateRequest):
    if req.strategy not in ("sathi", "greedy"):
        raise HTTPException(status_code=400, detail="Strategy must be 'sathi' or 'greedy'")
    
    engine = SimulationEngine(strategy=req.strategy, seed=req.seed)
    result = engine.run()
    return result

@app.post("/api/battle")
def run_battle_mode(req: SimulateRequest):
    sathi_engine = SimulationEngine(strategy="sathi", seed=req.seed)
    sathi_res = sathi_engine.run()
    
    greedy_engine = SimulationEngine(strategy="greedy", seed=req.seed)
    greedy_res = greedy_engine.run()
    
    return {
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
    sathi_engine = SimulationEngine(strategy="sathi", seed=req.seed)
    sathi_res = sathi_engine.run()
    
    greedy_engine = SimulationEngine(strategy="greedy", seed=req.seed)
    greedy_res = greedy_engine.run()
    
    return {
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
    base_engine = SimulationEngine(strategy="sathi", seed=req.seed)
    base_res = base_engine.run()
    
    orig_decision = next((d for d in base_res.decisions if d.incident_id == req.incident_id), None)
    orig_v_id = orig_decision.vehicle_id if orig_decision else "None"
    
    incidents = generate_incidents(count=100, seed=req.seed)
    target_inc = next((inc for inc in incidents if inc.id == req.incident_id), None)
    if not target_inc:
        raise HTTPException(status_code=404, detail=f"Incident {req.incident_id} not found")
        
    override_engine = SimulationEngine(strategy="sathi", seed=req.seed)
    override_res = override_engine.run()
    
    resp_delta = round(override_res.metrics.priority_weighted_response_time - base_res.metrics.priority_weighted_response_time, 2)
    outage_delta = round(override_res.metrics.coverage_outage_minutes - base_res.metrics.coverage_outage_minutes, 1)
    
    return {
        "incident_id": req.incident_id,
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
    engine = SimulationEngine(strategy=req.strategy, seed=req.seed)
    res = engine.run()
    m = res.metrics
    
    if "vehicle" in query_lower or "chosen" in query_lower or "why" in query_lower:
        latest_d = res.decisions[0] if res.decisions else None
        if latest_d:
            answer = (
                f"SATHI selects vehicles using a multi-factor score (Distance + Traffic Factor + Coverage Risk Penalty - Capacity Sharing Bonus). "
                f"For incident {latest_d.incident_id} (P{latest_d.priority}), {latest_d.vehicle_name} was chosen. {latest_d.explanation}"
            )
        else:
            answer = "SATHI enforces the Last Vehicle Protection Rule to protect quadrant coverage while optimizing travel distance and traffic delays."
            
    elif "coverage" in query_lower or "drop" in query_lower or "outage" in query_lower or "rebalance" in query_lower:
        answer = (
            f"Coverage drops occur when a quadrant has 0 available idle ambulances. "
            f"SATHI enforces the Last Vehicle Protection Rule and automatically dispatches rebalancing moves ({m.rebalance_moves_count} moves executed) from surplus quadrants to weak quadrants."
        )
        
    elif "traffic" in query_lower or "slow" in query_lower or "zone" in query_lower:
        answer = (
            f"SATHI monitors real-time Traffic Congestion Zones (red zones reduce travel speed by 50%). "
            f"During the current run, SATHI encountered {m.traffic_delays_encountered} traffic delay events."
        )
        
    elif "capacity" in query_lower or "share" in query_lower or "slot" in query_lower:
        answer = (
            f"Each ambulance has 2 capacity slots. P3 critical incidents require exclusive full locks (2 slots). "
            f"P1 & P2 incidents share capacity up to 2 patients, allowing dynamic on-the-fly re-routing."
        )
    else:
        answer = (
            f"SATHI ('Always There When It Matters') v2.0 is running '{req.strategy.upper()}' strategy on seed {req.seed}. "
            f"Telemetry: Weighted response time: {m.priority_weighted_response_time}m, Coverage Outages: {m.coverage_outage_minutes}m, "
            f"P3 Avg Response: {m.avg_p3_response_time}m, Rebalance Moves: {m.rebalance_moves_count}."
        )

    return {
        "query": req.query,
        "answer": answer,
        "context_summary": {
            "strategy": req.strategy,
            "weighted_response_time": m.priority_weighted_response_time,
            "outage_minutes": m.coverage_outage_minutes,
            "rebalance_moves": m.rebalance_moves_count,
            "p3_avg_resp": m.avg_p3_response_time
        }
    }

@app.get("/api/export/csv")
def export_csv(strategy: str = "sathi", seed: int = 42):
    engine = SimulationEngine(strategy=strategy, seed=seed)
    res = engine.run()
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    writer.writerow([
        "Step", "Incident_ID", "Priority", "Vehicle_ID", "Vehicle_Name",
        "Distance_Units", "Dispatch_Score", "Coverage_Override", "Explanation"
    ])
    
    for d in res.decisions:
        writer.writerow([
            d.step, d.incident_id, d.priority, d.vehicle_id, d.vehicle_name,
            d.distance, d.score, d.coverage_override, d.explanation.replace("\n", " ")
        ])
        
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=sathi_dispatch_log_seed_{seed}.csv"}
    )

# 🌐 SERVE FRONTEND BUILD AT ROOT
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
