import React from 'react';
import { PredictionResult } from '../../types/ml';
import { AlertTriangle, ShieldCheck, Zap, ArrowUpRight, ArrowDownRight, Compass } from 'lucide-react';

interface FaultPredictorCardProps {
  prediction: PredictionResult | null;
  deviceName: string;
}

export const FaultPredictorCard: React.FC<FaultPredictorCardProps> = ({ prediction, deviceName }) => {
  if (!prediction) {
    return (
      <div className="p-6 rounded-xl bg-noc-surface border border-noc-border text-center text-slate-500">
        Select a node to inspect AI fault risk & feature contributions.
      </div>
    );
  }

  const { risk_score, predicted_category, confidence, top_contributions, recommended_action, explanation_summary } = prediction;

  const getRiskColor = (score: number) => {
    if (score >= 70) return { text: 'text-rose-400', bg: 'bg-rose-500', border: 'border-rose-500/50', label: 'CRITICAL RISK' };
    if (score >= 35) return { text: 'text-amber-400', bg: 'bg-amber-500', border: 'border-amber-500/50', label: 'ELEVATED RISK' };
    return { text: 'text-emerald-400', bg: 'bg-emerald-500', border: 'border-emerald-500/50', label: 'NOMINAL / HEALTHY' };
  };

  const riskMeta = getRiskColor(risk_score);

  return (
    <div className="p-5 rounded-xl bg-noc-surface border border-noc-border shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-noc-border">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 text-noc-cyan" />
            <h3 className="text-sm font-bold text-white">AI Fault Risk & Telemetry Attribution</h3>
          </div>
          <p className="text-xs text-slate-400">Target Device: <span className="font-mono text-cyan-300">{deviceName}</span></p>
        </div>
        <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full border ${riskMeta.border} ${riskMeta.text} bg-noc-card`}>
          {riskMeta.label}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-4">
        {/* Risk Score Dial Card */}
        <div className="flex flex-col items-center justify-center p-4 bg-noc-card rounded-lg border border-noc-border text-center">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG circular meter */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={riskMeta.text}
                strokeDasharray={`${risk_score}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-2xl font-black ${riskMeta.text}`}>{risk_score}</span>
              <span className="text-[10px] text-slate-400 uppercase font-mono">Risk Index</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-slate-300 font-medium capitalize">
            {predicted_category.replace('_', ' ')}
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Model Confidence: {(confidence * 100).toFixed(1)}%
          </div>
        </div>

        {/* Feature Contribution Breakdown Bars */}
        <div className="md:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Feature Risk Attribution</span>
              <span className="text-[10px] text-slate-500 font-mono">Decision Tree Attribution</span>
            </div>
            <div className="space-y-2">
              {top_contributions.map((feat, idx) => {
                const isRiskDriver = feat.direction === 'increases_risk';
                return (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-300 flex items-center space-x-1">
                        {isRiskDriver ? (
                          <ArrowUpRight className="w-3 h-3 text-rose-400 inline" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3 text-emerald-400 inline" />
                        )}
                        <span>{feat.friendly_name}</span>
                      </span>
                      <span className="font-mono text-slate-400">
                        {feat.importance_pct}% (+{feat.feature_value})
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          isRiskDriver ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, feat.importance_pct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Narrative */}
          <div className="mt-3 p-2.5 rounded-lg bg-noc-card border border-noc-border text-xs text-slate-300 italic">
            "{explanation_summary}"
          </div>
        </div>
      </div>

      {/* Recommended Action Playbook */}
      <div className="mt-3 p-3 rounded-lg bg-cyan-950/30 border border-cyan-800/40 flex items-start space-x-3">
        <Compass className="w-5 h-5 text-noc-cyan shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-bold text-cyan-300 uppercase tracking-wide">
            Automated Recommended Action Playbook
          </div>
          <div className="text-xs text-slate-300 mt-0.5">{recommended_action}</div>
        </div>
      </div>
    </div>
  );
};
