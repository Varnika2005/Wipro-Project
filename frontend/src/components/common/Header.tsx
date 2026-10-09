import React from 'react';
import { Activity, ShieldCheck, RefreshCw, Layers, Cpu, GitFork, Wrench, Lock, LogOut, User } from 'lucide-react';
import { TopologySummary } from '../../types/topology';
import { UserProfile } from '../../api/authApi';

interface HeaderProps {
  summary: TopologySummary | null;
  activeTab: 'overview' | 'ml' | 'rca' | 'sandbox';
  setActiveTab: (tab: 'overview' | 'ml' | 'rca' | 'sandbox') => void;
  onReset: () => void;
  isResetting: boolean;
  currentUser: UserProfile | null;
  onOpenGatekeeper: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
  activeTab,
  setActiveTab,
  onReset,
  isResetting,
  currentUser,
  onOpenGatekeeper,
  onLogout,
}) => {
  const isCritical = (summary?.critical_devices || 0) > 0;
  const isDegraded = (summary?.degraded_devices || 0) > 0;

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'admin':
        return 'bg-rose-950/60 text-rose-300 border-rose-500/50 shadow-glow-crimson';
      case 'operator':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50 shadow-glow-cyan';
      default:
        return 'bg-slate-900/60 text-slate-300 border-slate-700/50';
    }
  };

  return (
    <header className="spatial-glass px-6 py-3.5 sticky top-0 z-50 shadow-2xl border-b border-white/[0.08]">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Brand & Title */}
        <div className="flex items-center space-x-3.5">
          <div className="p-2.5 bg-cyan-950/70 border border-cyan-500/40 rounded-xl shadow-glow-cyan">
            <Activity className="w-5 h-5 text-noc-cyan animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white font-sans">NetSentinel AI</h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-cyan-950/70 text-noc-cyan border border-cyan-700/50 rounded-full">
                Antigravity Spatial OS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              AIOps Network Fault Prediction & Zero-Trust Incident HUD
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1.5 bg-black/40 p-1.5 rounded-xl border border-white/[0.06]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Spatial Topology</span>
          </button>

          <button
            onClick={() => setActiveTab('ml')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'ml'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Predictive Visor</span>
          </button>

          <button
            onClick={() => setActiveTab('rca')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'rca'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Causal RCA</span>
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'sandbox'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 shadow-glow-cyan'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Remediation Twin</span>
          </button>
        </div>

        {/* Global Controls & User Session HUD */}
        <div className="flex items-center space-x-3">
          {/* Health Pulse Indicator */}
          <div
            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border ${
              isCritical
                ? 'bg-rose-950/50 text-rose-300 border-rose-500/50 shadow-glow-crimson'
                : isDegraded
                ? 'bg-amber-950/50 text-amber-300 border-amber-500/50'
                : 'bg-emerald-950/50 text-emerald-300 border-emerald-500/50 shadow-glow-emerald'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isCritical ? 'bg-rose-500 animate-ping' : isDegraded ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
            <span className="font-mono text-[11px]">
              {isCritical ? 'Singularity Alert' : isDegraded ? 'Tension Elevated' : 'Nominal Flux'}
            </span>
          </div>

          {/* User Session Pill */}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <div
                onClick={onOpenGatekeeper}
                className={`cursor-pointer px-3 py-1 rounded-xl border flex items-center space-x-2 transition-all ${getRoleBadge(
                  currentUser.role
                )}`}
                title="Click to switch RBAC persona"
              >
                <User className="w-3.5 h-3.5" />
                <span className="font-mono text-xs font-bold">{currentUser.username}</span>
                <span className="text-[10px] font-mono uppercase opacity-75">({currentUser.role})</span>
              </div>

              <button
                onClick={onLogout}
                title="Revoke session tokens and log out"
                className="p-1.5 rounded-lg bg-white/[0.05] hover:bg-rose-950/40 hover:text-rose-300 text-slate-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenGatekeeper}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 rounded-xl text-xs font-bold text-cyan-300 shadow-glow-cyan transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Gatekeeper HUD</span>
            </button>
          )}

          {/* Reset Baseline */}
          <button
            onClick={onReset}
            disabled={isResetting}
            title="Restore equilibrium baseline"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] rounded-xl text-xs font-medium text-slate-200 transition-colors disabled:opacity-50 font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-noc-cyan ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Flux</span>
          </button>
        </div>
      </div>
    </header>
  );
};
