import React from 'react';
import { RCAResponse } from '../../types/rca';
import { GitFork, ShieldAlert, ArrowDown, BellOff, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface AlarmCorrelationTreeProps {
  rcaData: RCAResponse | null;
  onSelectDevice: (deviceId: string) => void;
}

export const AlarmCorrelationTree: React.FC<AlarmCorrelationTreeProps> = ({ rcaData, onSelectDevice }) => {
  if (!rcaData || rcaData.incidents.length === 0) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200 shadow-sm">
        <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800">No Active Incidents</h3>
        <p className="text-xs text-slate-500 mt-1">
          Network telemetry is within nominal tolerances. All alarms have been correlated and resolved.
        </p>
      </div>
    );
  }

  const {
    total_active_alarms,
    root_cause_alarms_count,
    symptom_alarms_count,
    incidents,
    cascading_symptoms,
    causal_explanation,
  } = rcaData;

  return (
    <div className="space-y-6">
      {/* Alarm Storm Reduction Banner */}
      <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <GitFork className="w-5 h-5 text-nms-primary" />
            <h2 className="text-base font-bold text-slate-800">Root Cause Analysis & Incident Correlator</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{causal_explanation}</p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="px-3 py-1.5 rounded-lg bg-red-50 border border-red-200 text-red-700">
            <span className="font-bold">{root_cause_alarms_count}</span> Root Cause
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
            <span className="font-bold">{symptom_alarms_count}</span> Filtered Symptoms
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-green-50 border border-green-200 text-green-700">
            <span className="font-bold">
              {Math.round((symptom_alarms_count / Math.max(1, total_active_alarms)) * 100)}%
            </span> Noise Reduction
          </div>
        </div>
      </div>

      {/* Incident Cards */}
      <div className="space-y-4">
        {incidents.map((inc) => (
          <div key={inc.id} className="p-5 rounded-xl bg-white border border-red-200 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-100 text-red-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      {inc.predicted_fault_category.replace('_', ' ')}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-mono bg-red-50 text-red-600 rounded border border-red-200">
                      INCIDENT: {inc.id}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Started: {new Date(inc.started_at).toLocaleTimeString()}</span>
                    </span>
                    <span>Confidence: {(inc.confidence_score * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectDevice(inc.primary_device_id)}
                className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold text-nms-primary transition-colors"
              >
                Inspect Device {inc.primary_device_id}
              </button>
            </div>

            {/* Primary Cause Summary */}
            <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
              <span className="font-bold text-red-600">Root-Cause Isolation: </span>
              {inc.primary_cause_summary}
            </div>

            {/* Downstream Blast Radius */}
            <div className="mt-4">
              <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 mb-2">
                <ArrowDown className="w-3.5 h-3.5 text-amber-500" />
                <span>Impact Analysis ({inc.blast_radius.length} Downstream Nodes Impacted)</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {inc.blast_radius.map((dId) => (
                  <button
                    key={dId}
                    onClick={() => onSelectDevice(dId)}
                    className="px-2.5 py-1 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-mono transition-colors"
                  >
                    {dId}
                  </button>
                ))}
              </div>
            </div>

            {/* Remediation Playbook Recommendation */}
            <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-xs">
              <div className="font-bold text-blue-800 uppercase tracking-wide mb-0.5">
                Recommended Remediation Playbook
              </div>
              <div className="text-slate-700">{inc.recommended_action}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Cascading Symptoms Alarm Log */}
      {cascading_symptoms.length > 0 && (
        <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center space-x-2 mb-3">
            <BellOff className="w-4 h-4 text-slate-500" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Correlated Secondary Symptoms (Filtered)
            </h3>
          </div>

          <div className="space-y-2">
            {cascading_symptoms.map((alarm) => (
              <div
                key={alarm.id}
                className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="font-mono text-slate-800 font-bold">{alarm.device_id}</span>
                  <span className="text-slate-600">{alarm.message}</span>
                </div>
                <div className="flex items-center space-x-3 text-[11px] text-slate-500 font-mono">
                  <span>Trigger: {alarm.metric_triggered}</span>
                  <span>Observed: {alarm.observed_value}</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 font-bold">SYMPTOM</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
