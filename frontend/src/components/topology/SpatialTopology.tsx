import React from 'react';
import { Device, Link } from '../../types/topology';
import { Server, Router, Network, Globe, ShieldAlert } from 'lucide-react';

interface SpatialTopologyProps {
  devices: Device[];
  links: Link[];
  selectedDeviceId: string | null;
  onSelectDevice: (deviceId: string) => void;
  rootCauseDevices?: string[];
  symptomDevices?: string[];
}

export const SpatialTopology: React.FC<SpatialTopologyProps> = ({
  devices,
  links,
  selectedDeviceId,
  onSelectDevice,
  rootCauseDevices = [],
  symptomDevices = [],
}) => {
  const deviceMap = React.useMemo(() => {
    const map = new Map<string, Device>();
    devices.forEach((d) => map.set(d.id, d));
    return map;
  }, [devices]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'gateway':
        return <Globe className="w-5 h-5 text-nms-primary" />;
      case 'router':
        return <Router className="w-5 h-5 text-nms-info" />;
      case 'switch':
        return <Network className="w-5 h-5 text-slate-500" />;
      case 'server':
        return <Server className="w-5 h-5 text-slate-700" />;
      default:
        return <Network className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div
      className="relative w-full h-full bg-slate-50 overflow-x-auto overflow-y-hidden select-none rounded-b-lg"
      aria-label="Interactive network topology. Drag horizontally on smaller screens to inspect every node."
    >
      <div className="relative min-w-[972px] h-full min-h-[600px] pr-[72px]">
        {/* Grid Matrix */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#CBD5E1 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        {/* SVG Canvas for Links */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 972 600" preserveAspectRatio="none">
          {links.map((link) => {
            const src = deviceMap.get(link.source_device_id);
            const tgt = deviceMap.get(link.target_device_id);
            if (!src || !tgt) return null;

            const isCriticalLink = src.status === 'critical' || tgt.status === 'critical' || link.status === 'degraded';
            const isCongested = link.status === 'congested' || src.status === 'degraded';

            // Coordinates
            const x1 = src.pos_x;
            const y1 = src.pos_y;
            const x2 = tgt.pos_x;
            const y2 = tgt.pos_y;
            const pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
            const strokeColor = isCriticalLink ? '#DC2626' : isCongested ? '#D97706' : '#94A3B8';

            return (
              <g key={link.id}>
                <path
                  d={pathD}
                  fill="none"
                  stroke={strokeColor}
                  strokeWidth="2"
                  strokeOpacity="0.8"
                  strokeDasharray={link.status === 'down' ? '6 6' : 'none'}
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        <div className="absolute inset-0">
          {devices.map((device) => {
            const isSelected = selectedDeviceId === device.id;
            const isRootCause = rootCauseDevices.includes(device.id);
            const isSymptom = symptomDevices.includes(device.id);
            const isCritical = device.status === 'critical';

            // Leave a card-width gutter on the right so nodes at the canvas edge are not clipped.
            const pctX = (device.pos_x / 972) * 100;
            const pctY = (device.pos_y / 600) * 100;

            return (
              <div
                key={device.id}
                onClick={() => onSelectDevice(device.id)}
                style={{
                  left: `${pctX}%`,
                  top: `${pctY}%`,
                  position: 'absolute',
                  transform: 'translate(-50%, -50%)',
                }}
                className={`cursor-pointer select-none transition-all duration-200 z-20 group ${
                  isSelected ? 'scale-105 z-40' : 'hover:scale-105'
                }`}
              >
                {/* Root Cause Tag */}
                {isRootCause && (
                  <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center space-x-1 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded border border-red-300 whitespace-nowrap z-40 shadow-sm">
                    <ShieldAlert className="w-3 h-3 text-red-600" />
                    <span>ROOT CAUSE</span>
                  </div>
                )}

                {/* Symptom Tag */}
                {isSymptom && !isRootCause && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center space-x-1 bg-amber-50 text-amber-700 text-[9px] font-semibold px-2 py-0.5 rounded border border-amber-200 whitespace-nowrap z-40 shadow-sm">
                    <span>SYMPTOM</span>
                  </div>
                )}

                {/* Node Card */}
                <div
                  className={`w-36 p-3 rounded-lg bg-white border shadow-sm transition-all ${
                    isCritical
                      ? 'border-red-400 ring-2 ring-red-400/20'
                      : isSelected
                      ? 'border-nms-primary ring-2 ring-nms-primary/20'
                      : 'border-slate-300 hover:border-nms-primary/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-1.5 rounded bg-slate-50 border border-slate-200">
                      {getDeviceIcon(device.type)}
                    </div>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        device.status === 'healthy'
                          ? 'bg-green-500'
                          : device.status === 'degraded'
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                    />
                  </div>

                  <div className="text-xs font-bold text-slate-800 truncate" title={device.name}>
                    {device.name}
                  </div>
                  <div className="text-[10px] font-mono text-slate-500 truncate">
                    {device.ip_address}
                  </div>

                  <div className="mt-2 pt-1 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono">
                    <span className="text-slate-500 uppercase">{device.type}</span>
                    <span
                      className={`font-semibold capitalize ${
                        device.status === 'healthy'
                          ? 'text-green-600'
                          : device.status === 'degraded'
                          ? 'text-amber-600'
                          : 'text-red-600'
                      }`}
                    >
                      {device.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
