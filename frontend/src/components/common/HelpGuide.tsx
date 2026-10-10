import React from 'react';

export const HelpGuide: React.FC = () => {
  return (
    <div className="nms-panel">
      <div className="nms-panel-header">
        <h2 className="text-lg font-bold text-nms-text">User Guide & Documentation</h2>
      </div>
      <div className="p-8 space-y-8 text-sm text-nms-text">
        <section>
          <h3 className="text-base font-bold text-nms-primary mb-3">Getting Started</h3>
          <p className="mb-2">
            NetSentinel AI is a simulated Network Management System (NMS) designed to demonstrate
            AI-based fault prediction and root cause analysis.
          </p>
          <p className="mb-2">
            <strong>Simulation Note:</strong> The backend generates deterministic, synthetic telemetry and network
            states. The data is simulated rather than collected from live infrastructure.
          </p>
          <p>
            To run the application, start both the FastAPI backend on port 8000 and the Vite frontend on port 5173 
            using the provided <code>run_dev.bat</code> script.
          </p>
        </section>

        <hr className="border-nms-border" />

        <section>
          <h3 className="text-base font-bold text-nms-primary mb-3">Understanding the Dashboard</h3>
          <ul className="list-disc pl-5 space-y-2 text-nms-textMuted">
            <li><strong className="text-nms-text">Fleet Health:</strong> High-level overview of healthy, degraded, and critical nodes.</li>
            <li><strong className="text-nms-text">Network Topology:</strong> The interactive spatial canvas representing the infrastructure.</li>
            <li><strong className="text-nms-text">Telemetry Metrics:</strong> Real-time visualizations of CPU, memory, bandwidth, latency, and packet loss.</li>
            <li><strong className="text-nms-text">Alarm Severity:</strong> Alarms indicate threshold breaches mapped to specific network nodes.</li>
          </ul>
        </section>

        <hr className="border-nms-border" />

        <section>
          <h3 className="text-base font-bold text-nms-primary mb-3">Running a Fault Scenario</h3>
          <ol className="list-decimal pl-5 space-y-2 text-nms-textMuted">
            <li>Navigate to the <strong>Overview</strong> tab.</li>
            <li>Locate the <strong>Scenario Control</strong> panel.</li>
            <li>Select a target device from the dropdown.</li>
            <li>Choose a supported scenario (e.g., Hardware Overload, Queue Congestion, Packet Loss Drop).</li>
            <li>Click a scenario card to alter the simulated state.</li>
            <li>Observe the resulting telemetry and network health changes in the <strong>Network</strong> tab.</li>
          </ol>
        </section>

        <hr className="border-nms-border" />

        <section>
          <h3 className="text-base font-bold text-nms-primary mb-3">Understanding Predictions</h3>
          <p className="mb-2">Navigate to the <strong>Predictions</strong> tab (requires a selected node).</p>
          <ul className="list-disc pl-5 space-y-2 text-nms-textMuted">
            <li><strong className="text-nms-text">Fault Category & Probability:</strong> The classifier evaluates telemetry features to classify normal, congestion, packet-loss, latency-spike, and hardware-failure states.</li>
            <li><strong className="text-nms-text">Probability vs Certainty:</strong> The model outputs a probability distribution. A 100% probability indicates high confidence based on the synthetic training data, but does not represent real-world physical certainty.</li>
            <li><strong className="text-nms-text">Feature Explanations:</strong> The top contributing telemetry features driving the prediction are highlighted.</li>
          </ul>
        </section>

        <hr className="border-nms-border" />

        <section>
          <h3 className="text-base font-bold text-nms-primary mb-3">Investigating Incidents</h3>
          <p className="mb-2">Navigate to the <strong>Incidents</strong> tab.</p>
          <ul className="list-disc pl-5 space-y-2 text-nms-textMuted">
            <li><strong className="text-nms-text">Alarm Correlation:</strong> The RCA service uses topological heuristics to group related alarms.</li>
            <li><strong className="text-nms-text">Root-Cause Hypothesis:</strong> A suspected root cause is identified based on upstream dependencies, helping distinguish the primary fault from cascading symptoms.</li>
          </ul>
        </section>

        <hr className="border-nms-border" />

        <section>
          <h3 className="text-base font-bold text-nms-primary mb-3">Using Remediation</h3>
          <p className="mb-2">Navigate to the <strong>Remediation</strong> tab.</p>
          <ol className="list-decimal pl-5 space-y-2 text-nms-textMuted">
            <li>Select a proposed corrective action for the target device.</li>
            <li>Preview the simulated expected changes (e.g., traffic rerouting, interface reset).</li>
            <li>Click <strong>Apply Simulation</strong>. The backend will attempt to resolve the injected fault and return telemetry to baseline.</li>
          </ol>
        </section>

        <hr className="border-nms-border" />

        <section>
          <h3 className="text-base font-bold text-nms-primary mb-3">Model Evaluation</h3>
          <p className="mb-2">Navigate to the <strong>Model Evaluation</strong> tab.</p>
          <ul className="list-disc pl-5 space-y-2 text-nms-textMuted">
            <li><strong className="text-nms-text">Metrics:</strong> Displays standard ML metrics (Accuracy, Precision, Recall, F1) calculated on a held-out test set.</li>
            <li><strong className="text-nms-text">Synthetic Limitations:</strong> The held-out score measures data from the same simulator distribution, not a live network. Validate with representative production telemetry before making operational claims.</li>
          </ul>
        </section>
        
        <hr className="border-nms-border" />

        <section>
          <h3 className="text-base font-bold text-nms-primary mb-3">Troubleshooting</h3>
          <ul className="list-disc pl-5 space-y-2 text-nms-textMuted">
            <li><strong>Data missing or API fails:</strong> Ensure the FastAPI backend is running. Check network tab for 500/503 errors.</li>
            <li><strong>Resetting:</strong> Use the "Reset Simulation" button in the header or Scenario Control to clear all injected faults and return the topology to a healthy baseline.</li>
          </ul>
        </section>
      </div>
    </div>
  );
};
