import React from 'react';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TelemetryMetric } from '../../types/telemetry';

interface TelemetryTrendsProps {
  metrics: TelemetryMetric[];
  deviceName: string;
}

export const TelemetryTrends: React.FC<TelemetryTrendsProps> = ({ metrics, deviceName }) => {
  const formattedData = React.useMemo(() => {
    return metrics.map((m) => ({
      time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      cpu: m.cpu_utilization_pct,
      memory: m.memory_utilization_pct,
      latency: m.latency_ms,
      jitter: m.jitter_ms,
      loss: m.packet_loss_rate_pct,
      errors: m.interface_error_rate,
      bw: m.bandwidth_utilization_pct,
      temp: m.device_temperature_c,
    }));
  }, [metrics]);

  if (!metrics || metrics.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-noc-surface rounded-xl border border-noc-border text-slate-500 text-sm">
        No telemetry records available for {deviceName}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Chart 1: CPU & RAM Utilization */}
      <div className="p-4 rounded-xl bg-noc-surface border border-noc-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-200">System Resources</span>
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="flex items-center space-x-1 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>CPU %</span>
            </span>
            <span className="flex items-center space-x-1 text-purple-400">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span>RAM %</span>
            </span>
          </div>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2d42" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={9} domain={[0, 100]} unit="%" tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2d42', fontSize: '11px', borderRadius: '8px' }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#06b6d4" fill="url(#cpuGrad)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="memory" stroke="#a855f7" fill="url(#ramGrad)" strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Latency & Jitter */}
      <div className="p-4 rounded-xl bg-noc-surface border border-noc-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-200">Round-Trip Latency & Jitter</span>
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="flex items-center space-x-1 text-amber-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>RTT (ms)</span>
            </span>
            <span className="flex items-center space-x-1 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Jitter (ms)</span>
            </span>
          </div>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2d42" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={9} unit="ms" tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2d42', fontSize: '11px', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="latency" stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="jitter" stroke="#3b82f6" strokeWidth={1.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Packet Loss & CRC Errors */}
      <div className="p-4 rounded-xl bg-noc-surface border border-noc-border">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-slate-200">Packet Loss & Framing Errors</span>
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="flex items-center space-x-1 text-rose-400">
              <span className="w-2 h-2 rounded-full bg-rose-400" />
              <span>Loss %</span>
            </span>
            <span className="flex items-center space-x-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>CRC Err/s</span>
            </span>
          </div>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2d42" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#111827', borderColor: '#1f2d42', fontSize: '11px', borderRadius: '8px' }}
              />
              <Area type="monotone" dataKey="loss" stroke="#f43f5e" fill="url(#lossGrad)" strokeWidth={2} />
              <Line type="monotone" dataKey="errors" stroke="#10b981" strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
