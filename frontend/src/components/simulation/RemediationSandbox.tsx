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
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2 mb-2 border-b border-slate-100 pb-4">
          <Wrench className="w-5 h-5 text-nms-primary" />
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wider font-mono">Remediation Sandbox</h2>
        </div>
        <p className="text-sm text-slate-500 mb-6">
          Simulate corrective actions safely before applying to the operational infrastructure.
        </p>

        {/* Action Configuration Controls */}
        <div className="bg-slate-50 p-5 rounded-lg border border-slate-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Target Device</label>
              <select
                value={targetDevice}
                onChange={(e) => {
                  setTargetDevice(e.target.value);
                  setSimResult(null);
                }}
                className="w-full px-4 py-2.5 rounded bg-white border border-slate-300 text-slate-800 text-sm font-mono focus:outline-none focus:border-nms-primary focus:ring-1 focus:ring-nms-primary shadow-sm"
              >
                {devices.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.id}) - Status: {d.status}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide">Proposed Corrective Policy</label>
              <select
                value={actionType}
                onChange={(e) => {
                  setActionType(e.target.value);
                  setSimResult(null);
                }}
                className="w-full px-4 py-2.5 rounded bg-white border border-slate-300 text-slate-800 text-sm focus:outline-none focus:border-nms-primary focus:ring-1 focus:ring-nms-primary shadow-sm"
              >
                {policies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end">
          <button
            onClick={handleSimulate}
            disabled={isSimulating}
            className="flex items-center space-x-2 px-6 py-2.5 bg-nms-primary hover:bg-nms-primaryHover text-white font-bold rounded text-sm transition-all shadow-sm disabled:opacity-50"
          >
            <Play className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Evaluating...' : 'Simulate Policy'}</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {applyMessage && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 flex items-center space-x-3 text-xs text-green-700">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-green-600" />
          <span>{applyMessage}</span>
        </div>
      )}

      {/* Simulation Results Card */}
      {simResult && (
        <div className="p-6 rounded-xl bg-white border border-blue-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-800">Projected Impact Analysis</h3>
            </div>
            <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              SIMULATION RESULTS
            </span>
          </div>

          {/* Risk Score Delta */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-xs font-bold text-slate-600">Current Risk Index</div>
              <div className="text-3xl font-black text-red-600 mt-1">{simResult.current_risk_score}</div>
              <div className="text-[10px] text-slate-500">Unmitigated State</div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center flex flex-col items-center justify-center">
              <div className="text-xs font-bold text-green-600 flex items-center space-x-1">
                <ArrowDownRight className="w-4 h-4" />
                <span>-{simResult.risk_reduction_pct}% Risk Reduction</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-mono">
                Confidence: {(simResult.resolution_confidence * 100).toFixed(1)}%
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <div className="text-xs font-bold text-slate-600">Projected Risk Index</div>
              <div className="text-3xl font-black text-green-600 mt-1">{simResult.projected_risk_score}</div>
              <div className="text-[10px] font-bold uppercase text-green-700">
                Target Status: {simResult.projected_status}
              </div>
            </div>
          </div>

          {/* Rationale & Safety Analysis */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div>
              <span className="font-bold text-slate-700">Technical Rationale: </span>
              <span className="text-slate-600">{simResult.remediation_rationale}</span>
            </div>
            <div>
              <span className="font-bold text-slate-700">Safety Assessment: </span>
              <span className="text-slate-600">{simResult.safety_assessment}</span>
            </div>
          </div>

          {/* Commit Action */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-500">
              Satisfied with simulation projection? Apply changes to production.
            </span>
            <button
              onClick={handleApply}
              disabled={isApplying}
              className="flex items-center space-x-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-xs transition-all disabled:opacity-50"
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
