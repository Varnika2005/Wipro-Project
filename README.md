# NetSentinel AI — AI-Based Network Fault Prediction & Intelligent Incident Analysis

**Problem Statement 9 (PS 9):** AI-Based Network Fault Prediction System  
**Academic Level:** Final-Year Engineering / Recruitment-Ready Mini-Project  
**Domain:** AIOps, Network Management Systems (NMS), Machine Learning & Topological Root-Cause Analysis (RCA)

---

## 🌟 Overview & Key Capabilities

NetSentinel AI is an end-to-end Network Operations Center (NOC) intelligence system designed to automate network health monitoring, preemptively predict multi-class network degradation, correlate alarm storms into primary root causes, and provide a safe digital-twin remediation sandbox.

### Core Features
1. **Interactive Network Topology Canvas**:
   - Visualizes a 4-tier enterprise infrastructure (Edge Gateway, Core Mesh, Distribution Switches, Access/Datacenter Servers).
   - Real-time animated traffic pulses with dynamic health colors (Nominal Cyan/Emerald, Degraded Amber, Critical Coral).
   - Automated visual beacons for `[PRIMARY ROOT CAUSE]` and `[CASCADING SYMPTOM]`.
2. **Ground-Truth Physical Telemetry & Deterministic Simulation Engine**:
   - Generates mathematically grounded network metrics bounded by physical limits (queueing models, Poisson drops, thermal profiles).
   - Simulates 5 distinct scenarios: `Normal Operation`, `Link Congestion`, `Packet Loss`, `Latency Spike`, and `Hardware Overload`.
3. **Genuine scikit-learn Machine Learning Classifier**:
   - Multi-class `RandomForestClassifier` (with `GradientBoostingClassifier` baseline).
   - Features: CPU, Memory, Packet Drop Rate, Latency, Jitter, Bandwidth Saturation, CRC Error Rate, Active Connections, Chassis Temperature.
   - Genuine held-out test evaluation (20% unseen test split) with a verified Confusion Matrix, Precision, Recall, and F1 Score.
4. **Explainable Risk Scoring & Mathematical Attribution**:
   - Tree-based decision path feature attribution explaining the exact percentage drivers of elevated risk (e.g., *+48% Packet Loss, +32% CRC Errors*).
   - Automated natural-language incident narratives and recommended playbook actions.
5. **Topological Alarm Correlation & Root-Cause Analysis (RCA)**:
   - Breadth-First Search (BFS) / directed graph traversal across network links.
   - Groups multi-node alarm storms and isolates the single upstream primary root cause while suppressing secondary cascading symptoms.
6. **Non-Destructive Digital Twin Remediation Sandbox**:
   - Counterfactual What-If simulation mode predicting risk reduction before committing changes.
   - Interactive playbooks: Daemon Restart, Traffic Reroute, QoS Rate Throttling, Link Failover, Fan Speed Boost.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS (NOC Dark Theme), Recharts, Lucide React, Axios |
| **Backend** | Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0, SQLite |
| **Machine Learning** | scikit-learn (`RandomForestClassifier`, `StandardScaler`), pandas, numpy, joblib |
| **Graph Analysis** | NetworkX (Topological causal traversal) |
| **Testing** | pytest, FastAPI TestClient, httpx |

---

## 🚀 Quick Start & Local Execution

### Prerequisites
- Python 3.10 or higher
- Node.js v18 or higher (npm 9+)

### 1. Automated One-Click Launch (Windows)
Double-click `run_dev.bat` or run in terminal:
```powershell
.\run_dev.bat
```

### 2. Manual Execution

#### Backend Setup
```powershell
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Backend API will be accessible at:
- **API Base:** `http://127.0.0.1:8000`
- **Interactive Swagger Docs:** `http://127.0.0.1:8000/docs`

#### Frontend Setup
In a new terminal window:
```powershell
cd frontend
npm install
npm run dev
```
Frontend dashboard will be accessible at:
- **NOC Dashboard:** `http://127.0.0.1:5173`

---

## 🧪 Automated Testing & Verification

NetSentinel AI includes a complete test suite covering database models, simulation boundary physics, machine learning pipelines, RCA correlation logic, remediation safety, and REST API integration.

To run the complete test suite:
```powershell
cd backend
python -m pytest -v
```

### Verified Test Matrix (17 Automated Tests):
* `tests/test_api_endpoints.py`: All REST API contracts (200 OK, Pydantic validation)
* `tests/test_database_init.py`: Schema creation and initial 12-node enterprise topology seeding
* `tests/test_simulation.py`: Physical bounds, repeatability with seeds, cascading propagation
* `tests/test_ml_pipeline.py`: Balanced synthetic datasets, train/test split, macro F1 $> 0.85$, prediction risk score
* `tests/test_rca_correlation.py`: Graph-based upstream root cause vs. downstream symptom isolation
* `tests/test_remediation.py`: Non-destructive What-If digital twin simulation and live action commit

---

## 📡 API Reference Overview

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/topology` | `GET` | Fetches entire network graph nodes, links, and health stats |
| `/api/topology/devices/{id}` | `GET` | Details, hardware specs, active alarms, and live telemetry for a node |
| `/api/simulation/scenario` | `POST` | Injects fault scenario (`congestion`, `packet_loss`, `latency_spike`, `hardware_failure`) |
| `/api/simulation/reset` | `POST` | Restores baseline normal operating state across all nodes |
| `/api/telemetry/history` | `GET` | Time-series telemetry metrics for charting |
| `/api/ml/predict` | `POST` | Model inference: fault category, risk score, and feature attributions |
| `/api/ml/evaluation` | `GET` | Held-out test evaluation report, accuracy, and confusion matrix |
| `/api/ml/train` | `POST` | Trains and persists a new scikit-learn classifier artifact |
| `/api/rca/correlate` | `GET` | Correlates active alarms into incidents and isolates primary root causes |
| `/api/remediation/simulate` | `POST` | Digital-twin What-If simulation without modifying real nodes |
| `/api/remediation/apply` | `POST` | Commits approved remediation policy to resolve network faults |

---

## 🔬 Demonstration Workflow for Evaluation

1. **Baseline State**: Open `http://127.0.0.1:5173`. Notice 12 healthy nodes, animated cyan traffic lines, and 100% Fleet Health.
2. **Model Evaluation**: Click the **AI Predictor & Eval** tab. Review the held-out test evaluation report showing verified accuracy, macro F1 score, and the 5x5 Confusion Matrix.
3. **Fault Injection**: In the **NOC Topology** tab, select `Core Router Alpha` and click **Hardware Overload**.
4. **Alarm Storm & Cascade**: Observe the status shift to *Critical Incident Active*. Notice `Core Router Alpha` receives a glowing `ROOT CAUSE` badge, while connected downstream distribution switches receive `CASCADING SYMPTOM` tags.
5. **RCA View**: Click the **RCA & Correlation** tab. Note how raw alarms are correlated, noise is suppressed, and the blast radius is isolated.
6. **Safe Remediation**: Click the **Remediation Sandbox** tab. Click **Simulate Policy (Safe Digital Twin)**. Review the projected risk reduction from 100 to 0. Click **Commit & Resolve Fault** to restore the network back to 100% fleet health.
