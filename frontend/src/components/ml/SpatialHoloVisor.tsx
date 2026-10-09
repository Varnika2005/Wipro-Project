import React from 'react';
import { motion } from 'framer-motion';
import { PredictionResult } from '../../types/ml';
import { Zap, Compass, ShieldCheck, ArrowUpRight, ArrowDownRight, Activity, Cpu } from 'lucide-react';

interface SpatialHoloVisorProps {
  prediction: PredictionResult | null;
  deviceName: string;
}

export const SpatialHoloVisor: React.FC<SpatialHoloVisorProps> = ({ prediction, deviceName }) => {
  if (!prediction) {
    return (
      <div className="p-8 rounded-2xl spatial-glass border border-white/[0.08] text-center text-slate-400 font-mono text-xs">
        Select any node in the spatial topography to initialize holographic telemetry visor.
      </div>
    );
  }

  const { risk_score, predicted_category, confidence, top_contributions, recommended_action, explanation_summary } = prediction;

  const isCritical = risk_score >= 70;
  const isElevated = risk_score >= 35 && risk_score < 70;

  const visorColor = isCritical
    ? { border: 'border-rose-500/50', glow: 'shadow-glow-crimson', text: 'text-rose-400', stroke: '#f43f5e' }
    : isElevated
    ? { border: 'border-amber-500/50', glow: 'shadow-[0_0_25px_rgba(245,158,11,0.3)]', text: 'text-amber-400', stroke: '#f59e0b' }
    : { border: 'border-cyan-500/40', glow: 'shadow-glow-cyan', text: 'text-cyan-400', stroke: '#06b6d4' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`relative p-6 rounded-2xl spatial-glass border ${visorColor.border} ${visorColor.glow} overflow-hidden shadow-2xl`}
    >
      {/* Holographic Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-white/[0.08] gap-3">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/60 border border-cyan-500/30 shadow-glow-cyan">
            <Zap className="w-5 h-5 text-noc-cyan animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide">
              Holographic Risk Visor & Predictive HUD
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Target Entity: <span className="text-cyan-300 font-semibold">{deviceName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase tracking-wider border ${visorColor.border} ${visorColor.text} bg-black/40`}>
            {isCritical ? 'CRITICAL SINGULARITY' : isElevated ? 'ELEVATED TENSION' : 'EQUILIBRIUM NOMINAL'}
          </span>
        </div>
      </div>

      {/* Main Kinetic Gauges Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 my-5">
        {/* Holographic Concentric Ring Meter */}
        <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-black/40 border border-white/[0.06] text-center relative">
          <div className="relative w-36 h-36 flex items-center justify-center">
            {/* Outer Orbital Kinetic Track */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.9155"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="2.5"
              />
              <circle
                cx="18"
                cy="18"
                r="15.9155"
                fill="none"
                stroke={visorColor.stroke}
                strokeWidth="3.2"
                strokeDasharray={`${risk_score}, 100`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Holographic Core Readout */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-3xl font-black font-mono tracking-tight ${visorColor.text}`}>
                {risk_score}
              </span>
              <span className="text-[9px] uppercase font-mono tracking-widest text-slate-400">
                Risk Index
              </span>
            </div>
          </div>

          <div className="mt-3 text-xs font-bold text-slate-200 capitalize tracking-wide">
            {predicted_category.replace('_', ' ')}
          </div>
          <div className="text-[10px] font-mono text-cyan-400/80 mt-0.5">
            Quantum Confidence: {(confidence * 100).toFixed(1)}%
          </div>
        </div>

        {/* Feature Tension Attribution Cylinders */}
        <div className="lg:col-span-2 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-3 text-xs font-mono uppercase tracking-wider text-slate-300">
              <span>Metric Tension Attribution</span>
              <span className="text-slate-500">Tree Decision Path</span>
            </div>

            <div className="space-y-2.5">
              {top_contributions.map((feat, idx) => {
                const isAnomalyDriver = feat.direction === 'increases_risk';
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300 flex items-center space-x-1.5">
                        {isAnomalyDriver ? (
                          <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        )}
                        <span>{feat.friendly_name}</span>
                      </span>
                      <span className="text-slate-400">
                        {feat.importance_pct}% (+{feat.feature_value})
                      </span>
                    </div>

                    {/* Fluid Liquid-Tension Cylinder */}
                    <div className="w-full h-2 bg-slate-900/80 rounded-full overflow-hidden p-0.5 border border-white/[0.05]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, feat.importance_pct)}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className={`h-full rounded-full ${
                          isAnomalyDriver
                            ? 'bg-gradient-to-r from-rose-500 via-amber-400 to-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.6)]'
                            : 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Narrative Visor Transcript */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs text-slate-300 font-sans italic border-l-2 border-l-cyan-400">
            "{explanation_summary}"
          </div>
        </div>
      </div>

      {/* Recommended Remediation Action */}
      <div className="p-3.5 rounded-xl bg-cyan-950/25 border border-cyan-500/30 flex items-start space-x-3 text-xs">
        <Compass className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-cyan-300 uppercase font-mono tracking-wider text-[10px]">
            Kinetic Playbook Recommendation
          </div>
          <div className="text-slate-300 mt-0.5">{recommended_action}</div>
        </div>
      </div>
    </motion.div>
  );
};
