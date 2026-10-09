import React from 'react';
import { TopologySummary } from '../../types/topology';
import { Server, CheckCircle2, AlertTriangle, AlertOctagon, Bell, Activity } from 'lucide-react';

interface HealthOverviewProps {
  summary: TopologySummary | null;
}

export const HealthOverview: React.FC<HealthOverviewProps> = ({ summary }) => {
  if (!summary) return null;

  const cards = [
    {
      title: 'Monitored Devices',
      value: summary.total_devices,
      sub: `${summary.total_links} Active Trunks`,
      icon: Server,
      color: 'text-cyan-400',
      bg: 'bg-cyan-950/20 border-cyan-800/30',
    },
    {
      title: 'Healthy (Nominal)',
      value: summary.healthy_devices,
      sub: `${Math.round((summary.healthy_devices / Math.max(1, summary.total_devices)) * 100)}% Fleet Health`,
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bg: 'bg-emerald-950/20 border-emerald-800/30',
    },
    {
      title: 'Degraded Nodes',
      value: summary.degraded_devices,
      sub: 'Congestion / High Jitter',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-950/20 border-amber-800/30',
    },
    {
      title: 'Critical Outages',
      value: summary.critical_devices,
      sub: summary.critical_devices > 0 ? 'Action Required' : 'Zero Critical',
      icon: AlertOctagon,
      color: summary.critical_devices > 0 ? 'text-rose-400' : 'text-slate-400',
      bg: summary.critical_devices > 0 ? 'bg-rose-950/30 border-rose-800/40' : 'bg-noc-surface border-noc-border',
    },
    {
      title: 'Active Alarms',
      value: summary.active_alarms,
      sub: 'Threshold Breaches',
      icon: Bell,
      color: summary.active_alarms > 0 ? 'text-rose-400' : 'text-emerald-400',
      bg: summary.active_alarms > 0 ? 'bg-rose-950/20 border-rose-800/30' : 'bg-noc-surface border-noc-border',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-3.5 rounded-xl border bg-noc-surface/80 backdrop-blur-sm ${c.bg} transition-all hover:border-slate-600`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-slate-400">{c.title}</span>
              <Icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <div className={`text-2xl font-bold tracking-tight ${c.color}`}>
              {c.value}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5 truncate">{c.sub}</div>
          </div>
        );
      })}
    </div>
  );
};
