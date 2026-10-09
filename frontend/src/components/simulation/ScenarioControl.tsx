import React from 'react';
import { Device } from '../../types/topology';
import { ScenarioType } from '../../types/telemetry';
import { Flame, Clock, Radio, Activity, RefreshCw } from 'lucide-react';

interface ScenarioControlProps {
  devices: Device[];
  selectedDeviceId: string | null;
  onSelectDeviceId: (id: string) => void;
  onInject: (scenario: ScenarioType, deviceId: string) => void;
  onReset: () => void;
  isLoading: boolean;
}

export const ScenarioControl: React.FC<ScenarioControlProps> = ({
  devices,
  selectedDeviceId,
  onSelectDeviceId,
  onInject,
  onReset,
  isLoading,
}) => {
  const currentTargetId = selectedDeviceId || (devices[0]?.id ?? 'rtr-core-01');

  const scenarios: { type: ScenarioType; label: string; desc: string; icon: any; color: string }[] = [
    {
      type: 'hardware_failure',
      label: 'Hardware Overload',
      desc: 'CPU > 95%, Thermal spike to 88°C, buffer drops',
      icon: Flame,
      color: 'bg-rose-950/40 text-rose-300 border-rose-700/50 hover:bg-rose-900/60 shadow-glow-rose',
    },
    {
      type: 'congestion',
      label: 'Queue Congestion',
      desc: 'Bandwidth saturated at 95%, queue delay surging',
      icon: Activity,
      color: 'bg-amber-950/40 text-amber-300 border-amber-700/50 hover:bg-amber-900/60',
    },
    {
      type: 'packet_loss',
      label: 'Packet Loss Drop',
      desc: 'Severe framing CRC errors, 25% drop rate',
      icon: Radio,
      color: 'bg-purple-950/40 text-purple-300 border-purple-700/50 hover:bg-purple-900/60',
    },
    {
      type: 'latency_spike',
      label: 'Latency Routing Flap',
      desc: 'RTT jumps to 320ms, extreme jitter delay',
      icon: Clock,
      color: 'bg-blue-950/40 text-blue-300 border-blue-700/50 hover:bg-blue-900/60',
    },
  ];

  return (
    <div className="p-5 rounded-xl bg-noc-surface border border-noc-border">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-noc-border">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Fault Injection & Telemetry Simulation Sandbox
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Trigger deterministic network degradation scenarios to test AI prediction and causal correlation.
          </p>
        </div>

        {/* Target Device Dropdown */}
        <div className="flex items-center space-x-2">
          <label className="text-xs text-slate-400 font-medium">Injection Target:</label>
          <select
            value={currentTargetId}
            onChange={(e) => onSelectDeviceId(e.target.value)}
            className="px-3 py-1.5 rounded-lg bg-noc-card border border-noc-border text-slate-200 text-xs font-mono focus:outline-none focus:border-noc-cyan"
          >
            {devices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.id}) - {d.status}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Scenario Buttons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
        {scenarios.map((s) => {
          const Icon = s.icon;
          return (
            <button
              key={s.type}
              onClick={() => onInject(s.type, currentTargetId)}
              disabled={isLoading}
              className={`p-3.5 rounded-xl border text-left transition-all ${s.color} disabled:opacity-50`}
            >
              <div className="flex items-center space-x-2 mb-1">
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-bold">{s.label}</span>
              </div>
              <div className="text-[11px] opacity-80">{s.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
