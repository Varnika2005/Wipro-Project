import React from 'react';
import { Device, Link } from '../../types/topology';
import { Server, Router, Network, Globe, AlertCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface NetworkTopologyProps {
  devices: Device[];
  links: Link[];
  selectedDeviceId: string | null;
  onSelectDevice: (deviceId: string) => void;
  rootCauseDevices?: string[];
  symptomDevices?: string[];
}

export const NetworkTopology: React.FC<NetworkTopologyProps> = ({
  devices,
  links,
  selectedDeviceId,
  onSelectDevice,
  rootCauseDevices = [],
  symptomDevices = [],
}) => {
  // Device lookup map
  const deviceMap = React.useMemo(() => {
    const map = new Map<string, Device>();
    devices.forEach((d) => map.set(d.id, d));
    return map;
  }, [devices]);

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'gateway':
        return <Globe className="w-4 h-4 text-cyan-400" />;
      case 'router':
        return <Router className="w-4 h-4 text-blue-400" />;
      case 'switch':
        return <Network className="w-4 h-4 text-emerald-400" />;
      case 'server':
        return <Server className="w-4 h-4 text-purple-400" />;
      default:
        return <Network className="w-4 h-4 text-slate-400" />;
    }
  };

  const getNodeBorderColor = (status: string, isRootCause: boolean) => {
    if (isRootCause) return 'border-rose-500 ring-2 ring-rose-500/50 shadow-glow-rose animate-pulse';
    switch (status) {
      case 'critical':
        return 'border-rose-500 shadow-glow-rose';
      case 'degraded':
        return 'border-amber-500';
      case 'offline':
        return 'border-slate-600 opacity-60';
      default:
        return 'border-noc-border hover:border-noc-cyan/50';
    }
  };

  const getLinkColor = (status: string, sourceDev?: Device, targetDev?: Device) => {
    const isSourceCritical = sourceDev?.status === 'critical';
    const isTargetCritical = targetDev?.status === 'critical';
    if (isSourceCritical || isTargetCritical || status === 'degraded') return '#f43f5e';
    if (status === 'congested' || sourceDev?.status === 'degraded' || targetDev?.status === 'degraded') return '#f59e0b';
    return '#06b6d4';
  };

  return (
    <div className="relative w-full h-[620px] bg-noc-bg/90 rounded-xl border border-noc-border overflow-hidden select-none">
      {/* Topology Background Grid */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#334155 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Tier Labels on Left */}
      <div className="absolute left-4 top-4 flex flex-col space-y-24 pointer-events-none z-10 text-[11px] font-mono uppercase tracking-wider text-slate-500">
        <div className="flex items-center space-x-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /><span>Edge Tier</span></div>
        <div className="flex items-center space-x-1.5"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" /><span>Core Mesh Tier</span></div>
        <div className="flex items-center space-x-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /><span>Distribution Tier</span></div>
        <div className="flex items-center space-x-1.5"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" /><span>Access & DC Tier</span></div>
      </div>

      {/* SVG Canvas for Links & Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '950px' }}>
        <defs>
          <linearGradient id="linkPulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {links.map((link) => {
          const src = deviceMap.get(link.source_device_id);
          const tgt = deviceMap.get(link.target_device_id);
          if (!src || !tgt) return null;

          const strokeColor = getLinkColor(link.status, src, tgt);
          const isSevered = link.status === 'down';

          return (
            <g key={link.id}>
              {/* Glow backdrop line */}
              <line
                x1={src.pos_x + 60}
                y1={src.pos_y + 24}
                x2={tgt.pos_x + 60}
                y2={tgt.pos_y + 24}
                stroke={strokeColor}
                strokeWidth={strokeColor === '#f43f5e' ? '4' : '2'}
                strokeOpacity={strokeColor === '#f43f5e' ? '0.4' : '0.15'}
              />
              {/* Main connection line */}
              <line
                x1={src.pos_x + 60}
                y1={src.pos_y + 24}
                x2={tgt.pos_x + 60}
                y2={tgt.pos_y + 24}
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeDasharray={isSevered ? '4 4' : 'none'}
                strokeOpacity="0.8"
              />
              {/* Traffic packet pulse dot */}
              {!isSevered && (
                <circle r="2.5" fill={strokeColor} opacity="0.9">
                  <animateMotion
                    path={`M ${src.pos_x + 60} ${src.pos_y + 24} L ${tgt.pos_x + 60} ${tgt.pos_y + 24}`}
                    dur={`${Math.max(1.5, link.baseline_latency_ms * 0.8)}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Interactive Device Nodes */}
      <div className="absolute inset-0" style={{ minWidth: '950px' }}>
        {devices.map((device) => {
          const isSelected = selectedDeviceId === device.id;
          const isRootCause = rootCauseDevices.includes(device.id);
          const isSymptom = symptomDevices.includes(device.id);

          return (
            <div
              key={device.id}
              onClick={() => onSelectDevice(device.id)}
              style={{
                left: `${device.pos_x}px`,
                top: `${device.pos_y}px`,
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
              }}
              className={`cursor-pointer transition-all duration-200 z-20 group ${
                isSelected ? 'scale-105 z-30' : 'hover:scale-102'
              }`}
            >
              {/* Root Cause Alarm Beacon */}
              {isRootCause && (
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex items-center space-x-1 bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border border-rose-300 whitespace-nowrap animate-bounce z-40">
                  <ShieldAlert className="w-3 h-3" />
                  <span>ROOT CAUSE</span>
                </div>
              )}

              {/* Symptom Badge */}
              {isSymptom && !isRootCause && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center space-x-1 bg-amber-600/90 text-white text-[9px] font-semibold px-1.5 py-0.2 rounded-full border border-amber-400 whitespace-nowrap z-40">
                  <span>CASCADING SYMPTOM</span>
                </div>
              )}

              {/* Device Card Body */}
              <div
                className={`w-[130px] p-2.5 rounded-lg bg-noc-surface border backdrop-blur-sm transition-all ${getNodeBorderColor(
                  device.status,
                  isRootCause
                )} ${isSelected ? 'ring-2 ring-noc-cyan bg-noc-hover' : ''}`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-1 rounded bg-noc-card border border-noc-border">
                    {getDeviceIcon(device.type)}
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      device.status === 'healthy'
                        ? 'bg-emerald-400 shadow-glow-emerald'
                        : device.status === 'degraded'
                        ? 'bg-amber-400'
                        : 'bg-rose-500 animate-ping'
                    }`}
                  />
                </div>

                <div className="text-[11px] font-semibold text-slate-100 truncate">
                  {device.name}
                </div>
                <div className="text-[9px] font-mono text-slate-400 truncate">
                  {device.ip_address}
                </div>

                <div className="mt-2 pt-1.5 border-t border-noc-border/60 flex items-center justify-between text-[9px]">
                  <span className="text-slate-400 uppercase font-mono">{device.type}</span>
                  <span
                    className={`font-semibold capitalize ${
                      device.status === 'healthy'
                        ? 'text-emerald-400'
                        : device.status === 'degraded'
                        ? 'text-amber-400'
                        : 'text-rose-400'
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
  );
};
