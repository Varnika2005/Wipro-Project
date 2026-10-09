import React from 'react';
import { motion } from 'framer-motion';
import { Device, Link } from '../../types/topology';
import { Server, Router, Network, Globe, ShieldAlert, Radio } from 'lucide-react';

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

  // Identify any critical failure sinkhole device (gravitational event horizon)
  const failureSinkholeDevice = React.useMemo(() => {
    return devices.find(
      (d) => rootCauseDevices.includes(d.id) || d.status === 'critical'
    );
  }, [devices, rootCauseDevices]);

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

  return (
    <div className="relative w-full h-[640px] bg-spatial-void rounded-2xl border border-white/[0.08] overflow-hidden select-none shadow-2xl">
      {/* Cosmic Nebula Void Atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-600/[0.06] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[420px] h-[420px] bg-purple-600/[0.05] rounded-full blur-[140px]" />
        {failureSinkholeDevice && (
          <div
            className="absolute w-[450px] h-[450px] bg-rose-600/[0.12] rounded-full blur-[100px] transition-all duration-700 pointer-events-none"
            style={{
              left: `${failureSinkholeDevice.pos_x - 225}px`,
              top: `${failureSinkholeDevice.pos_y - 225}px`,
            }}
          />
        )}
      </div>

      {/* Grid Constellation Matrix */}
      <div
        className="absolute inset-0 opacity-[0.14] pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Tier Orbital Altitude Labels */}
      <div className="absolute left-6 top-6 flex flex-col space-y-24 pointer-events-none z-10 text-[10px] font-mono tracking-widest text-slate-500 uppercase">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          <span>Altitude 01: Edge Orbital Gateway</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_#3b82f6]" />
          <span>Altitude 02: Core Mesh Meshwork</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" />
          <span>Altitude 03: Distribution Fabric</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_#8b5cf6]" />
          <span>Altitude 04: Compute & Datacenter Clustered Nodes</span>
        </div>
      </div>

      {/* SVG Canvas for Curving Fiber-Optic Beams & Gravitational Warp Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ minWidth: '950px' }}>
        <defs>
          <linearGradient id="fiberGlowCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="fiberGlowCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#FB7185" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        {links.map((link) => {
          const src = deviceMap.get(link.source_device_id);
          const tgt = deviceMap.get(link.target_device_id);
          if (!src || !tgt) return null;

          const isCriticalLink =
            src.status === 'critical' || tgt.status === 'critical' || link.status === 'degraded';
          const isCongested = link.status === 'congested' || src.status === 'degraded';

          // Coordinates
          const x1 = src.pos_x;
          const y1 = src.pos_y;
          const x2 = tgt.pos_x;
          const y2 = tgt.pos_y;

          // Gravitational warp calculation:
          // If a failure sinkhole exists, links warp with gravitational curvature towards it!
          let pathD = `M ${x1} ${y1} L ${x2} ${y2}`;
          if (failureSinkholeDevice) {
            const sinkX = failureSinkholeDevice.pos_x;
            const sinkY = failureSinkholeDevice.pos_y;
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;
            // Gravitational pull offset toward sinkhole
            const pullFactor = 0.22;
            const warpX = midX + (sinkX - midX) * pullFactor;
            const warpY = midY + (sinkY - midY) * pullFactor;
            pathD = `M ${x1} ${y1} Q ${warpX} ${warpY} ${x2} ${y2}`;
          }

          const strokeColor = isCriticalLink ? '#F43F5E' : isCongested ? '#F59E0B' : '#06B6D4';

          return (
            <g key={link.id}>
              {/* Diffuse refraction glow under beam */}
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth={isCriticalLink ? '5' : '2.5'}
                strokeOpacity={isCriticalLink ? '0.45' : '0.18'}
              />
              {/* Sharp fiber optic core */}
              <path
                d={pathD}
                fill="none"
                stroke={strokeColor}
                strokeWidth="1.5"
                strokeOpacity="0.85"
                strokeDasharray={link.status === 'down' ? '5 5' : 'none'}
              />

              {/* Kinetic Packet Pulse Stream */}
              {link.status !== 'down' && (
                <circle r={isCriticalLink ? '3.5' : '2.5'} fill={strokeColor} opacity="0.95">
                  <animateMotion
                    path={pathD}
                    dur={`${Math.max(1.2, link.baseline_latency_ms * 0.7)}s`}
                    repeatCount="indefinite"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Interactive Micro-Levitating Nodes */}
      <div className="absolute inset-0" style={{ minWidth: '950px' }}>
        {devices.map((device, index) => {
          const isSelected = selectedDeviceId === device.id;
          const isRootCause = rootCauseDevices.includes(device.id);
          const isSymptom = symptomDevices.includes(device.id);
          const isCritical = device.status === 'critical';

          // Floating levitation physics offset per node index
          const levitationDuration = 3.5 + (index % 4) * 0.5;
          const levitationOffset = 5 + (index % 3) * 2;

          return (
            <motion.div
              key={device.id}
              onClick={() => onSelectDevice(device.id)}
              style={{
                left: `${device.pos_x}px`,
                top: `${device.pos_y}px`,
                position: 'absolute',
                transform: 'translate(-50%, -50%)',
              }}
              animate={{
                y: isCritical ? [0, -3, 0] : [-levitationOffset, levitationOffset, -levitationOffset],
              }}
              transition={{
                duration: isCritical ? 1.0 : levitationDuration,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className={`cursor-pointer select-none transition-all duration-300 z-20 group ${
                isSelected ? 'scale-105 z-40' : 'hover:scale-102'
              }`}
            >
              {/* Gravitational Sinkhole Shockwave Rings (radiating outward) */}
              {isCritical && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
                  <div className="absolute w-24 h-24 rounded-full border border-rose-500/70 gravitational-ring-1" />
                  <div className="absolute w-24 h-24 rounded-full border border-rose-500/50 gravitational-ring-2" />
                  <div className="absolute w-24 h-24 rounded-full border border-rose-500/30 gravitational-ring-3" />
                </div>
              )}

              {/* Spatial Holographic Root Cause Pill */}
              {isRootCause && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center space-x-1.5 bg-gradient-to-r from-rose-600 to-rose-700 text-white text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full shadow-glow-crimson border border-rose-400 whitespace-nowrap z-40 animate-pulse">
                  <ShieldAlert className="w-3 h-3 text-rose-200" />
                  <span>GRAVITATIONAL SINKHOLE (RCA)</span>
                </div>
              )}

              {/* Cascading Symptom Tag */}
              {isSymptom && !isRootCause && (
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center space-x-1 bg-amber-950/80 text-amber-300 text-[8px] font-mono font-semibold px-2 py-0.5 rounded-full border border-amber-500/40 whitespace-nowrap z-40">
                  <span>ORBITAL PULL</span>
                </div>
              )}

              {/* Translucent Glass Node Card Body */}
              <div
                className={`w-[136px] p-3 rounded-xl transition-all spatial-glass ${
                  isCritical
                    ? 'spatial-glass-crimson border-rose-500 ring-2 ring-rose-500/40 shadow-glow-crimson'
                    : isSelected
                    ? 'spatial-glass-cyan border-cyan-400 ring-2 ring-cyan-400/40 shadow-glow-cyan'
                    : 'border-white/[0.08] hover:border-cyan-500/40 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-1 rounded-lg bg-black/40 border border-white/[0.06]">
                    {getDeviceIcon(device.type)}
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      device.status === 'healthy'
                        ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                        : device.status === 'degraded'
                        ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]'
                        : 'bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-ping'
                    }`}
                  />
                </div>

                <div className="text-[11px] font-bold text-white tracking-wide truncate">
                  {device.name}
                </div>
                <div className="text-[9px] font-mono text-cyan-300/80 truncate">
                  {device.ip_address}
                </div>

                <div className="mt-2 pt-1.5 border-t border-white/[0.06] flex items-center justify-between text-[9px] font-mono">
                  <span className="text-slate-400 uppercase">{device.type}</span>
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
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
