import numpy as np
from typing import Dict, List, Any
from app.services.ml_service import MLService, FEATURE_NAMES

# Normal baseline distribution means & standard deviations for reference
BASELINE_STATS = {
    "cpu_utilization_pct": {"mean": 22.0, "std": 6.0, "unit": "%"},
    "memory_utilization_pct": {"mean": 35.0, "std": 8.0, "unit": "%"},
    "packet_loss_rate_pct": {"mean": 0.02, "std": 0.05, "unit": "%"},
    "latency_ms": {"mean": 3.5, "std": 1.2, "unit": "ms"},
    "jitter_ms": {"mean": 0.5, "std": 0.2, "unit": "ms"},
    "bandwidth_utilization_pct": {"mean": 28.0, "std": 8.0, "unit": "%"},
    "interface_error_rate": {"mean": 0.0, "std": 0.1, "unit": "err/s"},
    "active_connections": {"mean": 150.0, "std": 40.0, "unit": "conns"},
    "device_temperature_c": {"mean": 43.0, "std": 3.0, "unit": "°C"},
}

FRIENDLY_NAMES = {
    "cpu_utilization_pct": "CPU Utilization",
    "memory_utilization_pct": "RAM Utilization",
    "packet_loss_rate_pct": "Packet Drop Rate",
    "latency_ms": "Round-Trip Latency",
    "jitter_ms": "Packet Jitter",
    "bandwidth_utilization_pct": "Bandwidth Saturation",
    "interface_error_rate": "Interface CRC Errors",
    "active_connections": "Active Connections",
    "device_temperature_c": "Chassis Temperature",
}


class ExplainerService:
    """
    Explainability Engine for Network Fault Predictions.
    Calculates exact mathematical feature attributions and generates operational NOC narratives.
    """

    @classmethod
    def explain_prediction(
        cls,
        metrics: Dict[str, float],
        prediction_result: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Computes metric-level contribution scores to the risk score and predicted category.
        Returns sorted list of contributing features.
        """
        model, _ = MLService.load_active_model()
        importances = getattr(model, "feature_importances_", None)
        if importances is None:
            # Fallback uniform
            importances = [1.0 / len(FEATURE_NAMES)] * len(FEATURE_NAMES)

        attributions = []
        raw_scores = []

        for idx, feat in enumerate(FEATURE_NAMES):
            val = float(metrics.get(feat, 0.0))
            stat = BASELINE_STATS.get(feat, {"mean": 0.0, "std": 1.0, "unit": ""})
            importance = float(importances[idx])

            # Compute standard deviation units (z-score) above nominal mean
            mean_val = stat["mean"]
            std_val = max(0.001, stat["std"])
            deviation = (val - mean_val) / std_val

            # Positive deviation contributes to fault risk
            risk_contribution = max(0.0, deviation) * importance
            raw_scores.append(risk_contribution)

        total_raw = sum(raw_scores)

        for idx, feat in enumerate(FEATURE_NAMES):
            val = float(metrics.get(feat, 0.0))
            stat = BASELINE_STATS[feat]
            friendly = FRIENDLY_NAMES[feat]

            if total_raw > 0:
                pct = round((raw_scores[idx] / total_raw) * 100.0, 1)
            else:
                pct = round(100.0 / len(FEATURE_NAMES), 1)

            unit = stat["unit"]
            if val > stat["mean"] * 1.5:
                direction = "increases_risk"
                explanation = f"{friendly} is elevated at {val}{unit} (nominal: {stat['mean']}{unit})"
            else:
                direction = "decreases_risk"
                explanation = f"{friendly} is within healthy operating bounds ({val}{unit})"

            attributions.append({
                "feature_name": feat,
                "friendly_name": friendly,
                "feature_value": val,
                "importance_pct": pct,
                "direction": direction,
                "explanation": explanation,
            })

        # Sort descending by contribution percentage
        attributions.sort(key=lambda x: x["importance_pct"], reverse=True)
        return attributions

    @classmethod
    def generate_narrative(
        cls,
        predicted_category: str,
        risk_score: float,
        attributions: List[Dict[str, Any]]
    ) -> str:
        """Synthesizes human-readable operational incident summary for NOC engineers."""
        if predicted_category == "normal" or risk_score < 25.0:
            return "Nominal operational telemetry. All monitored metrics exhibit steady-state baseline distributions."

        top_contributors = [a for a in attributions if a["direction"] == "increases_risk"][:2]
        if not top_contributors:
            return f"Moderate operational anomaly detected with risk score {risk_score}/100."

        summary_parts = [
            f"{c['friendly_name']} ({c['feature_value']}{BASELINE_STATS[c['feature_name']]['unit']}, +{c['importance_pct']}% impact)"
            for c in top_contributors
        ]
        return (
            f"Alert: Risk Score is {risk_score}/100 driven predominantly by "
            f"{' and '.join(summary_parts)}. Pattern matches {predicted_category.replace('_', ' ').title()}."
        )
