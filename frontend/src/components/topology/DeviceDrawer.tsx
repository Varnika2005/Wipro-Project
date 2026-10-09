import React from 'react';
import { Device } from '../../types/topology';
import { Alarm } from '../../types/rca';
import { TelemetryMetric } from '../../types/telemetry';
import { X, Server, ShieldAlert, Cpu, HardDrive, Wifi, Bell, Play } from 'lucide-react';

interface DeviceDrawerProps {
  device: Device | null;
  onClose: () => void;
  alarms: Alarm[];
  latestTelemetry: TelemetryMetric | null;
  onOpenPrediction: (deviceId: string) => void;
  onOpenRemediation: (deviceId: string) => void;
}

export const DeviceDrawer: React.FC<DeviceDrawerProps> = ({
  device,
  onClose,
  alarms,
  latestTelemetry,
  onOpenPrediction,
  onOpenRemediation,
}) => {
  if (!device) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-noc-surface border-l border-noc-border shadow-2xl z-50 p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-noc-border">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-noc-card border border-noc-border rounded-lg">
              <Server className="w-5 h-5 text-noc-cyan" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{device.name}</h3>
              <div className="text-[11px] font-mono text-cyan-400">{device.id}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-noc-hover text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status & Network Specs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-noc-card border border-noc-border">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Operational State</div>
            <div
              className={`text-xs font-bold capitalize mt-0.5 ${
                device.status === 'healthy'
                  ? 'text-emerald-400'
                  : device.status === 'degraded'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {device.status}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-noc-card border border-noc-border">
            <div className="text-[10px] text-slate-400 font-mono uppercase">IP Address</div>
            <div className="text-xs font-mono text-slate-200 mt-0.5">{device.ip_address}</div>
          </div>

          <div className="p-3 rounded-lg bg-noc-card border border-noc-border">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Topology Tier</div>
            <div className="text-xs font-medium text-slate-200 uppercase mt-0.5">{device.tier}</div>
          </div>

          <div className="p-3 rounded-lg bg-noc-card border border-noc-border">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Trunk Capacity</div>
            <div className="text-xs font-mono text-slate-200 mt-0.5">{device.max_bandwidth_mbps / 1000} Gbps</div>
          </div>
        </div>

        {/* Latest Telemetry Gauges */}
        {latestTelemetry && (
          <div className="p-4 rounded-xl bg-noc-card border border-noc-border space-y-3">
            <div className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Live Telemetry Gauges
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">CPU Load</span>
                  <span className="font-mono text-cyan-400">{latestTelemetry.cpu_utilization_pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 rounded-full"
                    style={{ width: `${latestTelemetry.cpu_utilization_pct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Memory Load</span>
                  <span className="font-mono text-purple-400">{latestTelemetry.memory_utilization_pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full"
                    style={{ width: `${latestTelemetry.memory_utilization_pct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Bandwidth Saturation</span>
                  <span className="font-mono text-blue-400">{latestTelemetry.bandwidth_utilization_pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full"
                    style={{ width: `${latestTelemetry.bandwidth_utilization_pct}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                <div>Latency: <span className="text-amber-400 font-bold">{latestTelemetry.latency_ms} ms</span></div>
                <div>Loss: <span className="text-rose-400 font-bold">{latestTelemetry.packet_loss_rate_pct}%</span></div>
                <div>Temp: <span className="text-slate-200">{latestTelemetry.device_temperature_c} °C</span></div>
                <div>Errors: <span className="text-emerald-400">{latestTelemetry.interface_error_rate}/s</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Active Alarms on this Node */}
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            <Bell className="w-3.5 h-3.5 text-rose-400" />
            <span>Active Alarms ({alarms.filter((a) => a.status === 'active').length})</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {alarms.filter((a) => a.status === 'active').length === 0 ? (
              <div className="text-xs text-slate-500 italic p-3 bg-noc-card rounded-lg text-center">
                Zero active alarms on this device.
              </div>
            ) : (
              alarms
                .filter((a) => a.status === 'active')
                .map((alm) => (
                  <div
                    key={alm.id}
                    className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-900/40 text-xs space-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-300 uppercase text-[10px]">{alm.severity}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(alm.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-slate-300 text-[11px]">{alm.message}</div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="pt-4 border-t border-noc-border space-y-2">
        <button
          onClick={() => onOpenPrediction(device.id)}
          className="w-full py-2 bg-noc-cyan hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg shadow-glow-cyan transition-all"
        >
          Inspect AI Prediction & Risk
        </button>
        <button
          onClick={() => onOpenRemediation(device.id)}
          className="w-full py-2 bg-noc-hover hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-noc-border transition-colors"
        >
          Open Remediation Sandbox
        </button>
      </div>
    </div>
  );
};
