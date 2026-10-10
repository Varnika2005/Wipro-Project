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
      color: 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100',
    },
    {
      type: 'congestion',
      label: 'Queue Congestion',
      desc: 'Bandwidth saturated at 95%, queue delay surging',
      icon: Activity,
      color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100',
    },
    {
      type: 'packet_loss',
      label: 'Packet Loss Drop',
      desc: 'Severe framing CRC errors, 25% drop rate',
      icon: Radio,
      color: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    },
    {
      type: 'latency_spike',
      label: 'Latency Routing Flap',
      desc: 'RTT jumps to 320ms, extreme jitter delay',
      icon: Clock,
      color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    },
  ];

  return (
    <div className="p-5 rounded-xl bg-white border border-slate-200 shadow-sm flex-1 flex flex-col">
      <div className="flex flex-col gap-4 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Fault Injection Simulator
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Trigger deterministic network degradation scenarios to test predictive models and RCA.
          </p>
        </div>

        {/* Target Device Dropdown */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs text-slate-600 font-bold">Target Node:</label>
          <select
            value={currentTargetId}
            onChange={(e) => onSelectDeviceId(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 text-xs font-mono focus:outline-none focus:border-nms-primary focus:ring-1 focus:ring-nms-primary"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3 mt-4 flex-1 content-start">
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
              <div className="text-[11px] opacity-80 leading-snug">{s.desc}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
