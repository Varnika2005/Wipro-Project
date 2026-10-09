import networkx as nx
from typing import Dict, List, Set, Any, Tuple
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.device import Device, Link
from app.models.alarm import AlarmEvent, Incident
from app.services.ml_service import MLService


class RCAService:
    """
    Graph-Based Root-Cause Analysis (RCA) & Alarm Storm Correlator.
    Employs topological dependency traversal to separate root causes from cascading symptoms.
    """

    @classmethod
    def build_topology_graph(cls, db: Session) -> nx.DiGraph:
        """Constructs a NetworkX directed graph from Link database records."""
        G = nx.DiGraph()
        devices = db.query(Device).all()
        for d in devices:
            G.add_node(d.id, name=d.name, type=d.type, tier=d.tier, status=d.status)

        links = db.query(Link).all()
        for l in links:
            G.add_edge(l.source_device_id, l.target_device_id, id=l.id, latency=l.baseline_latency_ms)

        return G

    @classmethod
    def correlate_alarms(cls, db: Session) -> Dict[str, Any]:
        """
        Gathers active alarms, performs topological causal discovery,
        updates `is_root_cause` in the database, and returns structured RCA result.
        """
        active_alarms = (
            db.query(AlarmEvent)
            .filter(AlarmEvent.status == "active")
            .order_by(AlarmEvent.timestamp.asc())
            .all()
        )

        if not active_alarms:
            return {
                "total_active_alarms": 0,
                "root_cause_alarms_count": 0,
                "symptom_alarms_count": 0,
                "incidents": [],
                "root_cause_devices": [],
                "cascading_symptoms": [],
                "causal_explanation": "Network telemetry nominal. Zero active alarms or cascading incidents.",
            }

        G = cls.build_topology_graph(db)

        # Map devices to their active alarms
        device_alarm_map: Dict[str, List[AlarmEvent]] = {}
        for a in active_alarms:
            device_alarm_map.setdefault(a.device_id, []).append(a)

        impacted_nodes = set(device_alarm_map.keys())

        # Subgraph of impacted nodes and their paths
        # Determine ancestor/descendant relationships among alarmed nodes
        root_cause_devices: Set[str] = set()
        symptom_devices: Set[str] = set()

        for node in impacted_nodes:
            # Check if any ancestor of `node` in G also has active alarms
            has_alarmed_ancestor = False
            for potential_ancestor in impacted_nodes:
                if potential_ancestor != node:
                    if nx.has_path(G, potential_ancestor, node):
                        has_alarmed_ancestor = True
                        break

            if has_alarmed_ancestor:
                symptom_devices.add(node)
            else:
                root_cause_devices.add(node)

        # Update DB flags
        for node in root_cause_devices:
            for alm in device_alarm_map[node]:
                alm.is_root_cause = True

        for node in symptom_devices:
            for alm in device_alarm_map[node]:
                alm.is_root_cause = False

        db.commit()

        # Group into Incidents per root cause device
        incidents: List[Dict[str, Any]] = []
        for rc_device_id in root_cause_devices:
            rc_device = db.query(Device).filter(Device.id == rc_device_id).first()
            rc_alarms = device_alarm_map[rc_device_id]

            # Compute blast radius: downstream impacted nodes reachable from rc_device
            blast_radius = [
                d_id for d_id in symptom_devices
                if nx.has_path(G, rc_device_id, d_id)
            ]

            downstream_alarm_count = sum(len(device_alarm_map[d]) for d in blast_radius)

            # Determine dominant predicted category from latest telemetry
            latest_metric = rc_device.telemetry[-1] if rc_device.telemetry else None
            fault_cat = "Network Degradation"
            conf = 0.85
            if latest_metric:
                pred = MLService.predict({
                    "cpu_utilization_pct": latest_metric.cpu_utilization_pct,
                    "memory_utilization_pct": latest_metric.memory_utilization_pct,
                    "packet_loss_rate_pct": latest_metric.packet_loss_rate_pct,
                    "latency_ms": latest_metric.latency_ms,
                    "jitter_ms": latest_metric.jitter_ms,
                    "bandwidth_utilization_pct": latest_metric.bandwidth_utilization_pct,
                    "interface_error_rate": latest_metric.interface_error_rate,
                    "active_connections": latest_metric.active_connections,
                    "device_temperature_c": latest_metric.device_temperature_c,
                })
                fault_cat = pred["predicted_category"]
                conf = pred["confidence"]

            inc_id = f"inc-{rc_device_id}-{int(rc_alarms[0].timestamp.timestamp())}"
            summary = (
                f"Primary failure detected on {rc_device.name} ({rc_device_id}) "
                f"[{fault_cat}]. Downstream blast radius spans {len(blast_radius)} nodes."
            )
            rec_action = MLService.predict({})["recommended_action"] if not latest_metric else pred["recommended_action"]

            incident_dict = {
                "id": inc_id,
                "primary_device_id": rc_device_id,
                "predicted_fault_category": fault_cat,
                "confidence_score": round(conf, 2),
                "status": "active",
                "primary_cause_summary": summary,
                "recommended_action": rec_action,
                "started_at": rc_alarms[0].timestamp,
                "resolved_at": None,
                "root_cause_device": rc_device_id,
                "cascading_impact_count": downstream_alarm_count,
                "blast_radius": blast_radius,
            }
            incidents.append(incident_dict)

        root_cause_alarms = [a for a in active_alarms if a.is_root_cause]
        symptom_alarms = [a for a in active_alarms if not a.is_root_cause]

        causal_exp = (
            f"Correlated {len(active_alarms)} alarms into {len(incidents)} distinct incident(s). "
            f"Isolated {len(root_cause_devices)} primary root-cause device(s) and filtered out "
            f"{len(symptom_alarms)} downstream symptom alarms."
        )

        return {
            "total_active_alarms": len(active_alarms),
            "root_cause_alarms_count": len(root_cause_alarms),
            "symptom_alarms_count": len(symptom_alarms),
            "incidents": incidents,
            "root_cause_devices": list(root_cause_devices),
            "cascading_symptoms": symptom_alarms,
            "causal_explanation": causal_exp,
        }
