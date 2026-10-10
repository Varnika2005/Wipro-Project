import React from 'react';
import { Device } from '../../types/topology';
import { Alarm } from '../../types/rca';
import { TelemetryMetric } from '../../types/telemetry';
import { X, Server, Bell } from 'lucide-react';

interface DeviceInspectorProps {
  device: Device | null;
  onClose: () => void;
  alarms: Alarm[];
  latestTelemetry: TelemetryMetric | null;
  onOpenPrediction: (deviceId: string) => void;
  onOpenRemediation: (deviceId: string) => void;
}

export const DeviceInspector: React.FC<DeviceInspectorProps> = ({
  device,
  onClose,
  alarms,
  latestTelemetry,
  onOpenPrediction,
  onOpenRemediation,
}) => {
  if (!device) return null;

  return (
    <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-xl p-5 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg">
              <Server className="w-5 h-5 text-nms-primary" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{device.name}</h3>
              <div className="text-[11px] font-mono text-slate-500">{device.id}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status & Network Specs */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-mono uppercase">Operational State</div>
            <div
              className={`text-xs font-bold capitalize mt-0.5 ${
                device.status === 'healthy'
                  ? 'text-green-600'
                  : device.status === 'degraded'
                  ? 'text-amber-600'
                  : 'text-red-600'
              }`}
            >
              {device.status}
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-mono uppercase">IP Address</div>
            <div className="text-xs font-mono text-slate-700 mt-0.5">{device.ip_address}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-mono uppercase">Topology Tier</div>
            <div className="text-xs font-medium text-slate-700 uppercase mt-0.5">{device.tier}</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
            <div className="text-[10px] text-slate-500 font-mono uppercase">Trunk Capacity</div>
            <div className="text-xs font-mono text-slate-700 mt-0.5">{device.max_bandwidth_mbps / 1000} Gbps</div>
          </div>
        </div>

        {/* Latest Telemetry Gauges */}
        {latestTelemetry && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Live Telemetry Gauges
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600">CPU Load</span>
                  <span className="font-mono text-slate-800 font-bold">{latestTelemetry.cpu_utilization_pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${latestTelemetry.cpu_utilization_pct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600">Memory Load</span>
                  <span className="font-mono text-slate-800 font-bold">{latestTelemetry.memory_utilization_pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full"
                    style={{ width: `${latestTelemetry.memory_utilization_pct}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-600">Bandwidth Saturation</span>
                  <span className="font-mono text-slate-800 font-bold">{latestTelemetry.bandwidth_utilization_pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full"
                    style={{ width: `${latestTelemetry.bandwidth_utilization_pct}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-600">
                <div>Latency: <span className="text-amber-600 font-bold">{latestTelemetry.latency_ms} ms</span></div>
                <div>Loss: <span className="text-red-600 font-bold">{latestTelemetry.packet_loss_rate_pct}%</span></div>
                <div>Temp: <span className="text-slate-800 font-bold">{latestTelemetry.device_temperature_c} °C</span></div>
                <div>Errors: <span className="text-green-600 font-bold">{latestTelemetry.interface_error_rate}/s</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Active Alarms on this Node */}
        <div>
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            <Bell className="w-3.5 h-3.5 text-red-500" />
            <span>Active Alarms ({alarms.filter((a) => a.status === 'active').length})</span>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {alarms.filter((a) => a.status === 'active').length === 0 ? (
              <div className="text-xs text-slate-500 italic p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
                Zero active alarms on this device.
              </div>
            ) : (
              alarms
                .filter((a) => a.status === 'active')
                .map((alm) => (
                  <div
                    key={alm.id}
                    className="p-2.5 rounded-lg bg-red-50 border border-red-100 text-xs space-y-0.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-red-700 uppercase text-[10px]">{alm.severity}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(alm.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-slate-700 text-[11px]">{alm.message}</div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions Footer */}
      <div className="pt-4 border-t border-slate-100 space-y-2">
        <button
          onClick={() => onOpenPrediction(device.id)}
          className="w-full py-2 bg-nms-primary hover:bg-nms-primaryHover text-white text-xs font-bold rounded-lg transition-all"
        >
          View Model Predictions
        </button>
        <button
          onClick={() => onOpenRemediation(device.id)}
          className="w-full py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
        >
          Simulate Remediation
        </button>
      </div>
    </div>
  );
};
