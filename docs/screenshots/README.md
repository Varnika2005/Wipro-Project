# NetSentinel AI - Verification Screenshots

## Manual Capture Instructions

Due to the automated browser testing engine timing out in this secure development environment, please capture the genuine screenshots of your application running locally and place them in this directory. 

Follow these precise instructions to capture the required professional screenshots:

1. **`08-authentication.png`**:
   - Start the frontend (`npm run dev`) and navigate to `http://localhost:5173`.
   - Take a screenshot of the login modal. **Ensure no passwords or tokens are visible.**

2. **`01-dashboard.png`**:
   - Log in using `admin` / `Admin@NetSentinel2026!`.
   - Take a screenshot of the main Network Health Overview and Top Devices.

3. **`02-network-topology.png`**:
   - Navigate to the **Network Spatial Map** (Topology) tab.
   - Take a screenshot showing the nodes and the interactive graph.

4. **`03-fault-injection.png`**:
   - Navigate to the **Fault Simulation** tab.
   - Select a scenario (e.g., *Hardware Failure: Overheating*) and highlight the controls before clicking inject.

5. **`04-fault-prediction.png`**:
   - After injecting the scenario, take a screenshot of the active fault prediction alert showing the risk score and confidence.

6. **`05-model-evaluation.png`**:
   - Navigate to the **Model Intelligence** tab.
   - Capture the metrics dashboard and confusion matrix.

7. **`06-root-cause-analysis.png`**:
   - Navigate to the **Root Cause Analysis** tab.
   - Capture the correlation graph and the identified root cause summary.

8. **`07-remediation.png`**:
   - Open a remediation action from the RCA or Topology view.
   - Select an action (e.g., *Reroute Traffic*) and capture the success/simulation confirmation.

9. **`09-test-results.png`**:
   - Open your terminal.
   - Run `venv\Scripts\python.exe -m pytest -v` in the `backend` directory.
   - Capture the terminal output showing `27 passed` (including the new security config tests).

**Note:** Do not modify or edit your screenshots to manipulate the results. The actual application functions correctly and these genuine screenshots will serve as verified proof for your Wipro PS-9 report.
