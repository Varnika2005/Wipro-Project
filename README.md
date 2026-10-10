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
| **Frontend** | React 18, TypeScript, Tailwind CSS (professional light NOC UI), Recharts, Lucide React, Axios |
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

**Note on Database & Data:** The backend automatically provisions a SQLite database and seeds the topology upon startup. No manual initialization is required.

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

### 3. Demonstration Credentials
By default, the application will automatically prompt for login if no active session is found. To initialize the first administrator in a fresh deployment, you **must** supply an environment variable:
- `INITIAL_ADMIN_PASSWORD`

Login with:
- **Username:** `admin`
- **Password:** *(the value you provided in `INITIAL_ADMIN_PASSWORD`)*
- **Role:** `admin` (Required for remediation actions)

### 4. Configuration & Environment Variables
The application defaults to safe local configuration using standard ports (`8000` for backend, `5173` for frontend). To override these settings or deploy securely, use environment variables in a `.env` file or export them:
- `ENVIRONMENT`: Set to `production` to enforce strict security checks, `Secure` cookie flags, and require a 32+ character JWT secret.
- `JWT_SECRET_KEY`: Cryptographic key for signing session tokens (Mandatory in production).
- `INITIAL_ADMIN_PASSWORD`: Password to seed the first `admin` user.
- `API_PREFIX`: Modify API routing prefix (default: `/api`)
- `CORS_ORIGINS`: Set specific CORS origins (default: `http://localhost:5173,http://127.0.0.1:5173`)
- `DATABASE_URL`: Change the SQLAlchemy connection string (default: `sqlite:///./netsentinel_ai.db`)

### 5. Architectural Boundaries & Security
NetSentinel AI implements a strict Zero-Trust architectural boundary between the UI client and the FastAPI backend:
- **Authentication:** Stateless JSON Web Tokens (JWT) issued as `HttpOnly`, `SameSite=Lax` secure cookies to mitigate XSS and CSRF risks.
- **Role-Based Access Control (RBAC):** Server-side route dependencies restrict critical infrastructure endpoints. `viewer` (read-only telemetry), `operator` (simulation injection), and `admin` (remediation commit).
- **Validation:** Pydantic strictly validates all inbound API schemas, utilizing `Literal` types to reject unknown simulation or remediation commands.


---

## 🧪 Automated Testing & Verification

NetSentinel AI includes a complete test suite covering database models, simulation boundary physics, machine learning pipelines, RCA correlation logic, remediation safety, and REST API integration.

To run the complete test suite:
```powershell
cd backend
python -m pytest -v
```

### Test Coverage
* `tests/test_api_endpoints.py`: All REST API contracts (200 OK, Pydantic validation)
* `tests/test_database_init.py`: Schema creation and initial 12-node enterprise topology seeding
* `tests/test_simulation.py`: Physical bounds, repeatability with seeds, cascading propagation
* `tests/test_ml_pipeline.py`: Balanced synthetic datasets, stratified hold-out split, macro F1 $> 0.85$, prediction risk score. These are simulator-distribution metrics, not production accuracy.
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
2. **Model Evaluation**: Click the **Model** tab. Review the held-out simulated-data evaluation report, including accuracy, macro F1 score, and the 5x5 confusion matrix.
3. **Fault Injection**: In the **Overview** tab, select `Core Router Alpha` and click the **Hardware Overload** scenario card.
4. **Alarm Storm & Cascade**: Observe the status shift to *Critical Incident*. Notice the selected node receives a `ROOT CAUSE` badge, while related nodes receive `SYMPTOM` tags.
5. **RCA View**: Click the **Incidents** tab. Note how raw alarms are correlated, noise is suppressed, and the blast radius is isolated.
6. **Safe Remediation**: Click the **Remediation Sandbox** tab. Click **Simulate Policy (Safe Digital Twin)**. Review the projected risk reduction from 100 to 0. Click **Commit & Resolve Fault** to restore the network back to 100% fleet health.

---

## ⚠️ Limitations & Troubleshooting

### Synthetic-Data ML Limitations
The machine learning classifier (`RandomForestClassifier`) relies on **synthetic simulated data** generated by the built-in deterministic simulation engine. While the system demonstrates real scikit-learn API usage, feature extraction, and mathematically-consistent telemetry, the evaluation metrics (Precision/Recall/F1) **measure the model's accuracy on the same simulator distribution**. 

**Important Notice:** These results were obtained using held-out synthetic telemetry generated by the project's simulator. They demonstrate performance under the tested simulation conditions and do not establish equivalent accuracy on real-world network traffic. For production use, the model must be re-trained on empirical historical network data.

### Known Limitations
- The topology graph utilizes synthetic spatial coordinates and scales horizontally to a maximum interactive dimension.
- Database records are stored locally via SQLite, which lacks the concurrency control required for massive true-scale datacenter telemetry streams.

### Troubleshooting
- **Connection Refused (`ERR_CONNECTION_REFUSED`)**: Verify the backend is running at `127.0.0.1:8000`. Double-check there are no conflicting services on port 8000.
- **Vite Warning (Chunk Size)**: A warning during `npm run build` is expected for the large bundled React modules. The application employs route-level code splitting using `React.lazy()` to mitigate initial load overhead.
- **Simulation Desynchronization**: If the frontend topology differs from injected scenarios, click **Reset Simulation** in the top navigation bar to flush the database and restore a healthy baseline.
