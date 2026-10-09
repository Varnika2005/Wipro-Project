import React, { useState } from 'react';
import { Device } from '../../types/topology';
import { RemediationSimulateResponse } from '../../types/remediation';
import { remediationApi } from '../../api/remediationApi';
import { Wrench, ShieldCheck, ArrowRight, Play, CheckCircle2, AlertTriangle, ArrowDownRight } from 'lucide-react';

interface RemediationSandboxProps {
  devices: Device[];
  selectedDeviceId: string | null;
  onRemediationApplied: () => void;
}

export const RemediationSandbox: React.FC<RemediationSandboxProps> = ({
  devices,
  selectedDeviceId,
  onRemediationApplied,
}) => {
  const [targetDevice, setTargetDevice] = useState<string>(selectedDeviceId || devices[0]?.id || 'rtr-core-01');
  const [actionType, setActionType] = useState<string>('restart_service');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<RemediationSimulateResponse | null>(null);
  const [applyMessage, setApplyMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (selectedDeviceId) {
      setTargetDevice(selectedDeviceId);
    }
  }, [selectedDeviceId]);

  const policies = [
    { id: 'restart_service', name: 'Restart Control Plane Daemon', desc: 'Gracefully reboots process & clears memory leaks' },
    { id: 'reroute_traffic', name: 'Reroute Non-Critical Traffic', desc: 'Diverts bulk traffic to secondary core trunk' },
    { id: 'throttle_rate', name: 'Apply QoS Token-Bucket Rate Limit', desc: 'Caps burst egress to eliminate tail drops' },
    { id: 'switch_backup_link', name: 'Failover to Standby Link', desc: 'Switches to dark fiber line to bypass CRC errors' },
    { id: 'cool_system', name: 'Boost Fan Speed & Airflow', desc: 'Thermal stabilization without traffic interruption' },
  ];

  const handleSimulate = async () => {
    setIsSimulating(true);
    setApplyMessage(null);
    try {
      const res = await remediationApi.simulate(targetDevice, actionType);
      setSimResult(res);
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const res = await remediationApi.apply(targetDevice, actionType);
      setApplyMessage(res.message);
      setSimResult(null);
      onRemediationApplied();
    } catch (err: any) {
      alert(`Failed to apply remediation: ${err.message}`);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-5 rounded-xl bg-noc-surface border border-noc-border">
        <div className="flex items-center space-x-2 mb-1">
          <Wrench className="w-5 h-5 text-noc-cyan" />
          <h2 className="text-base font-bold text-white">Safe Remediation Digital Twin Sandbox</h2>
        </div>
        <p className="text-xs text-slate-400">
          Simulate counterfactual corrective actions safely without altering real operational infrastructure.
        </p>

        {/* Action Configuration Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Target Device</label>
            <select
              value={targetDevice}
              onChange={(e) => {
                setTargetDevice(e.target.value);
                setSimResult(null);
              }}
              className="w-full px-3 py-2 rounded-lg bg-noc-card border border-noc-border text-slate-200 text-xs font-mono focus:outline-none focus:border-noc-cyan"
            >
              {devices.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.id}) - Status: {d.status}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Proposed Corrective Policy</label>
            <select
              value={actionType}
              onChange={(e) => {
                setActionType(e.target.value);
                setSimResult(null);
              }}
              className="w-full px-3 py-2 rounded-lg bg-noc-card border border-noc-border text-slate-200 text-xs focus:outline-none focus:border-noc-cyan"
            >
              {policies.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-5 flex items-center space-x-3">
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="flex items-center space-x-2 px-4 py-2 bg-noc-cyan hover:bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs shadow-glow-cyan transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Evaluating Model...' : 'Simulate Policy (Safe Digital Twin)'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {applyMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 flex items-center space-x-3 text-xs text-emerald-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-400" />
          <span>{applyMessage}</span>
        </div>
      )}

      {/* Simulation Results Card */}
      {simResult && (
        <div className="p-6 rounded-xl bg-noc-card border border-cyan-500/40 shadow-glow-cyan space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-noc-border">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-noc-cyan" />
              <h3 className="text-sm font-bold text-white">Projected Digital Twin Impact Analysis</h3>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-cyan-950 text-noc-cyan border border-cyan-800">
              NON-DESTRUCTIVE SIMULATION
            </span>
          </div>

          {/* Risk Score Delta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-noc-surface border border-noc-border text-center">
              <div className="text-xs text-slate-400">Current Risk Index</div>
              <div className="text-3xl font-black text-rose-400 mt-1">{simResult.current_risk_score}</div>
              <div className="text-[10px] text-slate-500">Unmitigated State</div>
            </div>

            <div className="p-4 rounded-xl bg-noc-surface border border-noc-border text-center flex flex-col items-center justify-center">
              <div className="text-xs font-semibold text-emerald-400 flex items-center space-x-1">
                <ArrowDownRight className="w-4 h-4" />
                <span>-{simResult.risk_reduction_pct}% Risk Reduction</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                Confidence: {(simResult.resolution_confidence * 100).toFixed(1)}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-noc-surface border border-noc-border text-center">
              <div className="text-xs text-slate-400">Projected Risk Index</div>
              <div className="text-3xl font-black text-emerald-400 mt-1">{simResult.projected_risk_score}</div>
              <div className="text-[10px] text-slate-500 font-semibold uppercase text-emerald-400">
                Target Status: {simResult.projected_status}
              </div>
            </div>
          </div>

          {/* Rationale & Safety Analysis */}
          <div className="p-4 rounded-xl bg-noc-surface border border-noc-border space-y-2 text-xs">
            <div>
              <span className="font-semibold text-cyan-300">Technical Rationale: </span>
              <span className="text-slate-300">{simResult.remediation_rationale}</span>
            </div>
            <div>
              <span className="font-semibold text-emerald-300">Safety Assessment: </span>
              <span className="text-slate-300">{simResult.safety_assessment}</span>
            </div>
          </div>

          {/* Commit Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Satisfied with simulation projection? Apply changes to production.
            </span>
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs shadow-glow-emerald transition-all disabled:opacity-50"
            >
              <CheckCircle2 className={`w-4 h-4 ${isApplying ? 'animate-spin' : ''}`} />
              <span>{isApplying ? 'Applying Action...' : 'Commit & Resolve Fault'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
