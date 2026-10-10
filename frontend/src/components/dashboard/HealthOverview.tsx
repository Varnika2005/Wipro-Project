import React from 'react';
import { TopologySummary } from '../../types/topology';
import { Server, CheckCircle2, AlertTriangle, AlertOctagon, Bell } from 'lucide-react';

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
      color: 'text-nms-primary',
      bg: 'bg-white border-nms-border',
    },
    {
      title: 'Healthy (Nominal)',
      value: summary.healthy_devices,
      sub: `${Math.round((summary.healthy_devices / Math.max(1, summary.total_devices)) * 100)}% Fleet Health`,
      icon: CheckCircle2,
      color: 'text-green-600',
      bg: 'bg-green-50 border-green-200',
    },
    {
      title: 'Degraded Nodes',
      value: summary.degraded_devices,
      sub: 'Congestion / High Jitter',
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: summary.degraded_devices > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-nms-border',
    },
    {
      title: 'Critical Outages',
      value: summary.critical_devices,
      sub: summary.critical_devices > 0 ? 'Action Required' : 'Zero Critical',
      icon: AlertOctagon,
      color: summary.critical_devices > 0 ? 'text-red-600' : 'text-slate-400',
      bg: summary.critical_devices > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-nms-border',
    },
    {
      title: 'Active Alarms',
      value: summary.active_alarms,
      sub: 'Threshold Breaches',
      icon: Bell,
      color: summary.active_alarms > 0 ? 'text-red-600' : 'text-green-600',
      bg: summary.active_alarms > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-nms-border',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`p-4 rounded-xl border ${c.bg} shadow-sm transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{c.title}</span>
              <Icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <div className={`text-3xl font-black font-mono tracking-tight ${c.color}`}>
              {c.value}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate font-medium">{c.sub}</div>
          </div>
        );
      })}
    </div>
  );
};
