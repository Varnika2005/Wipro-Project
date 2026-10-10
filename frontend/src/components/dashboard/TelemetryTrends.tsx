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
      <div className="h-64 flex items-center justify-center bg-white rounded-xl border border-slate-200 text-slate-500 text-sm shadow-sm">
        No telemetry records available for {deviceName}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4">
      {/* Chart 1: CPU & RAM Utilization */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700">System Resources</span>
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="flex items-center space-x-1 text-blue-600">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>CPU %</span>
            </span>
            <span className="flex items-center space-x-1 text-purple-600">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              <span>RAM %</span>
            </span>
          </div>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ramGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9333ea" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={9} domain={[0, 100]} unit="%" tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '11px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="cpu" stroke="#2563eb" fill="url(#cpuGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="memory" stroke="#9333ea" fill="url(#ramGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Latency & Jitter */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700">Round-Trip Latency & Jitter</span>
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="flex items-center space-x-1 text-amber-600">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span>RTT (ms)</span>
            </span>
            <span className="flex items-center space-x-1 text-indigo-600">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              <span>Jitter (ms)</span>
            </span>
          </div>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={9} unit="ms" tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '11px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Line type="monotone" dataKey="latency" stroke="#d97706" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="jitter" stroke="#4f46e5" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 3: Packet Loss & CRC Errors */}
      <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-700">Packet Loss & Framing Errors</span>
          <div className="flex items-center space-x-3 text-[10px]">
            <span className="flex items-center space-x-1 text-red-600">
              <span className="w-2 h-2 rounded-full bg-red-600" />
              <span>Loss %</span>
            </span>
            <span className="flex items-center space-x-1 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>CRC Err/s</span>
            </span>
          </div>
        </div>
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formattedData}>
              <defs>
                <linearGradient id="lossGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={9} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={9} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', fontSize: '11px', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="loss" stroke="#dc2626" fill="url(#lossGrad)" strokeWidth={2} />
              <Line type="monotone" dataKey="errors" stroke="#059669" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
