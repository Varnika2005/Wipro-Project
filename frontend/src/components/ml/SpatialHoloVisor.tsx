import React from 'react';
import { PredictionResult } from '../../types/ml';
import { Zap, Compass, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface SpatialHoloVisorProps {
  prediction: PredictionResult | null;
  deviceName: string;
}

export const SpatialHoloVisor: React.FC<SpatialHoloVisorProps> = ({ prediction, deviceName }) => {
  if (!prediction) {
    return (
      <div className="nms-panel p-8 text-center text-nms-textMuted font-mono text-xs">
        Select any node in the network to view predictions.
      </div>
    );
  }

  const { risk_score, predicted_category, confidence, top_contributions, recommended_action, explanation_summary } = prediction;

  const isCritical = risk_score >= 70;
  const isElevated = risk_score >= 35 && risk_score < 70;

  const statusColor = isCritical
    ? { border: 'border-red-200', text: 'text-red-700', bg: 'bg-red-50', stroke: '#DC2626' }
    : isElevated
    ? { border: 'border-amber-200', text: 'text-amber-700', bg: 'bg-amber-50', stroke: '#D97706' }
    : { border: 'border-green-200', text: 'text-green-700', bg: 'bg-green-50', stroke: '#059669' };

  return (
    <div className={`nms-panel border ${statusColor.border}`}>
      {/* Header */}
      <div className="nms-panel-header flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded bg-white border ${statusColor.border}`}>
            <Zap className={`w-4 h-4 ${statusColor.text}`} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-nms-text tracking-wide uppercase font-mono">
              Predictive Risk Assessment
            </h3>
            <p className="text-xs text-nms-textMuted font-mono">
              Target Node: <span className="text-nms-text font-bold">{deviceName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider border ${statusColor.border} ${statusColor.text} ${statusColor.bg}`}>
            {isCritical ? 'CRITICAL RISK' : isElevated ? 'ELEVATED RISK' : 'NOMINAL'}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col space-y-6">
        {/* Main Gauges Layout */}
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-stretch">
          {/* Circular Risk Score Meter */}
          <div className="flex flex-col items-center justify-center p-4 rounded-lg bg-slate-50 border border-slate-200 min-w-[180px]">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke="#E2E8F0"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.9155"
                  fill="none"
                  stroke={statusColor.stroke}
                  strokeWidth="3"
                  strokeDasharray={`${risk_score}, 100`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className={`text-2xl font-black font-mono tracking-tight ${statusColor.text}`}>
                  {risk_score}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">
                  Risk Score
                </span>
              </div>
            </div>

            <div className="mt-3 text-sm font-bold text-slate-700 capitalize tracking-wide text-center">
              {predicted_category.replace('_', ' ')}
            </div>
            <div className="text-xs font-mono text-slate-500 mt-1">
              Confidence: {(confidence * 100).toFixed(1)}%
            </div>
          </div>

          {/* Feature Contributions */}
          <div className="flex-1 flex flex-col justify-between space-y-4 w-full">
            <div>
              <div className="flex items-center justify-between mb-3 text-[10px] font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1">
                <span>Top Telemetry Drivers</span>
                <span>Impact</span>
              </div>

              <div className="space-y-3">
                {top_contributions.map((feat, idx) => {
                  const isAnomalyDriver = feat.direction === 'increases_risk';
                  return (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-slate-700 flex items-center space-x-1">
                          {isAnomalyDriver ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-red-500 shrink-0" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          )}
                          <span>{feat.friendly_name}</span>
                        </span>
                        <span className="text-slate-600 font-bold">
                          {feat.importance_pct}% <span className="text-slate-400 font-normal">({feat.feature_value})</span>
                        </span>
                      </div>

                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, feat.importance_pct)}%` }}
                          className={`h-full ${isAnomalyDriver ? 'bg-red-400' : 'bg-green-400'}`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Summary */}
            <div className="p-3 rounded bg-slate-50 border-l-4 border-slate-300 text-xs text-slate-700 italic">
              "{explanation_summary}"
            </div>
          </div>
        </div>

        {/* Recommended Action */}
        <div className="p-3 rounded bg-nms-primary/5 border border-nms-primary/20 flex items-start space-x-3 text-xs">
          <Compass className="w-4 h-4 text-nms-primary shrink-0 mt-0.5" />
          <div>
            <div className="font-bold text-nms-primary uppercase font-mono tracking-wider text-[10px] mb-1">
              Recommended Remediation
            </div>
            <div className="text-nms-text">{recommended_action}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
