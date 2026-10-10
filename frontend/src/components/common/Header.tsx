import React from 'react';
import { Activity, RefreshCw, LogOut, User, Lock } from 'lucide-react';
import { TopologySummary } from '../../types/topology';
import { UserProfile } from '../../api/authApi';

interface HeaderProps {
  summary: TopologySummary | null;
  onReset: () => void;
  isResetting: boolean;
  currentUser: UserProfile | null;
  onOpenGatekeeper: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  summary,
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
        return 'bg-red-100 text-red-800 border-red-200';
      case 'operator':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <header className="bg-white px-4 sm:px-6 py-3.5 border-b border-nms-border sticky top-0 z-50">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Brand & Title */}
        <div className="flex min-w-0 items-start sm:items-center space-x-3.5">
          <div className="p-2 bg-nms-primary/10 border border-nms-primary/20 rounded-xl">
            <Activity className="w-5 h-5 text-nms-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <h1 className="text-lg font-bold tracking-tight text-nms-text font-sans">NetSentinel AI</h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold bg-nms-primary/10 text-nms-primary border border-nms-primary/20 rounded-full">
                NMS Simulation
              </span>
            </div>
            <p className="break-words text-[11px] leading-relaxed text-nms-textMuted font-mono">
              Network Fault Prediction & Incident Root Cause Analysis
            </p>
          </div>
        </div>

        {/* Global Controls & User Session HUD */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Health Pulse Indicator */}
          <div
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium border ${
              isCritical
                ? 'bg-red-50 text-red-700 border-red-200'
                : isDegraded
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-green-50 text-green-700 border-green-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isCritical ? 'bg-red-500 animate-pulse' : isDegraded ? 'bg-amber-500' : 'bg-green-500'
              }`}
            />
            <span className="font-mono text-[11px] font-bold">
              {isCritical ? 'CRITICAL INCIDENT' : isDegraded ? 'DEGRADED SERVICE' : 'SYSTEM HEALTHY'}
            </span>
          </div>

          {/* User Session Pill */}
          {currentUser ? (
            <div className="flex items-center space-x-2">
              <div
                onClick={onOpenGatekeeper}
                className={`cursor-pointer px-3 py-1 rounded-md border flex items-center space-x-2 transition-all ${getRoleBadge(
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
                title="Log out"
                className="p-1.5 rounded-md text-nms-textMuted hover:bg-slate-100 hover:text-nms-text transition-colors border border-transparent hover:border-slate-200"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenGatekeeper}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-nms-primary hover:bg-nms-primaryHover text-white rounded-md text-xs font-bold transition-all"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}

          {/* Reset Baseline */}
          <button
            onClick={onReset}
            disabled={isResetting}
            title="Restore simulation to healthy baseline"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-md text-xs font-medium text-nms-text transition-colors disabled:opacity-50 font-mono"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-nms-primary ${isResetting ? 'animate-spin' : ''}`} />
            <span>Reset Simulation</span>
          </button>
        </div>
      </div>
    </header>
  );
};
