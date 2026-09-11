# SATHI – Intelligent Emergency Fleet Dispatcher with Coverage Preservation & Capacity Optimization

> **Tagline:** “Always There When It Matters.”

SATHI is a real-time, causal emergency vehicle dispatcher built for high-stakes municipal fleet management. It minimizes priority-weighted response times, preserves quadrant coverage to prevent emergency blindspots, and optimizes dual-slot ambulance capacities dynamically.

---

## 🎯 Core Features & Innovation

1. **Ambulance Capacity System (Dual-Slot)**:
   - **Capacity**: 2 slots per ambulance.
   - **Priority 3 (Critical)**: Requires exclusive FULL ambulance (locks 2/2 slots, no sharing allowed).
   - **Priority 1 & 2**: Can dynamically share an ambulance (up to 2 patients), enabling intelligent dynamic re-routing for nearby incidents.
   - **Independent Service Timers**: 8 minutes per patient once on-site.

2. **Quadrant Coverage Preservation**:
   - 100x100 Grid divided into 4 quadrants ($Q_1..Q_4$).
   - Real-time idle fleet tracking per quadrant.
   - Applies exponential coverage penalty when dispatching a vehicle would leave its home quadrant with 0 idle ambulances.

3. **Multi-Factor Dispatch Scoring Engine**:
   $$\text{Score} = (d(V, I) \cdot w_{\text{dist}}) + (w_P \cdot w_{\text{priority}}) + (\text{CoveragePenalty} \cdot w_{\text{cov}}) - \text{CapacityBonus}$$
   - Minimizes dispatch score causally (zero future knowledge).

4. **Explainable AI Decision Explainer Panel**:
   - Real-time natural language explanations for every vehicle selection.

5. **What-If Simulation Mode & Strategy Comparison**:
   - Interactive override tool to test custom vehicle assignments and evaluate live metric deltas.
   - Side-by-side comparison with Greedy Baseline.

---

## 🚀 Quick Run Instructions

### 1. Start Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
python run.py
```
*Backend runs at `http://127.0.0.1:8000`*

### 2. Start Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at `http://localhost:3000`*

---

## 📊 Performance Benchmark (100 Incidents)

| Metric | Greedy Baseline | SATHI Engine | Outperformance |
| :--- | :--- | :--- | :--- |
| **Priority-Weighted Response Time** | 40.79 mins | **40.26 mins** | ⚡ Improved |
| **P3 Critical Response Time** | 38.33 mins | **33.38 mins** | 🚀 **+12.9% Faster** |
| **Coverage Outage Duration** | 53.0 mins | **45.0 mins** | 🛡️ **-8.0 mins Saved** |
| **Assignment Validity** | 100% | **100%** | 💯 Zero Violations |

---

## 📥 Exporting Simulation Data

- **CSV Export**: `GET http://127.0.0.1:8000/api/export/csv?seed=42`
- **JSON Simulation Trace**: `POST http://127.0.0.1:8000/api/simulate`
