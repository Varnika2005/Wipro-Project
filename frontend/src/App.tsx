import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/common/Header';
import { HealthOverview } from './components/dashboard/HealthOverview';
import { SpatialTopology } from './components/topology/SpatialTopology';
import { DeviceDrawer } from './components/topology/DeviceDrawer';
import { TelemetryTrends } from './components/dashboard/TelemetryTrends';
import { ScenarioControl } from './components/simulation/ScenarioControl';
import { SpatialHoloVisor } from './components/ml/SpatialHoloVisor';
import { ModelEvaluationView } from './components/ml/ModelEvaluationView';
import { AlarmCorrelationTree } from './components/rca/AlarmCorrelationTree';
import { RemediationSandbox } from './components/simulation/RemediationSandbox';
import { GatekeeperModal } from './components/auth/GatekeeperModal';

import { topologyApi, DeviceDetailResponse } from './api/topologyApi';
import { telemetryApi } from './api/telemetryApi';
import { mlApi } from './api/mlApi';
import { rcaApi } from './api/rcaApi';
import { authApi, UserProfile } from './api/authApi';
import { setAuthListeners } from './api/client';

import { Device, Link, TopologySummary } from './types/topology';
import { TelemetryMetric, ScenarioType } from './types/telemetry';
import { PredictionResult, EvaluationReport } from './types/ml';
import { RCAResponse } from './types/rca';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'ml' | 'rca' | 'sandbox'>('overview');
  const [devices, setDevices] = useState<Device[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [summary, setSummary] = useState<TopologySummary | null>(null);

  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>('rtr-core-01');
  const [selectedDeviceDetails, setSelectedDeviceDetails] = useState<DeviceDetailResponse | null>(null);
  const [deviceHistory, setDeviceHistory] = useState<TelemetryMetric[]>([]);

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationReport | null>(null);
  const [rcaData, setRcaData] = useState<RCAResponse | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isGatekeeperOpen, setIsGatekeeperOpen] = useState<boolean>(false);
  const [elevationRequiredRole, setElevationRequiredRole] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Configure Global Auth Listeners for silent refresh & 403 elevation prompts
  useEffect(() => {
    setAuthListeners(
      // On 401 when silent refresh fails
      () => {
        setCurrentUser(null);
        setIsGatekeeperOpen(true);
      },
      // On 403 when RBAC role elevation is required
      (detail) => {
        setElevationRequiredRole(detail);
        setIsGatekeeperOpen(true);
      }
    );
  }, []);

  // Check current session on mount or authenticate default Admin
  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await authApi.getMe();
        setCurrentUser(user);
      } catch (err) {
        // Auto-authenticate as default Admin for seamless initial boot
        try {
          const user = await authApi.login('admin', 'Admin@NetSentinel2026!');
          setCurrentUser(user);
        } catch {
          setIsGatekeeperOpen(true);
        }
      }
    };
    checkSession();
  }, []);

  // Load Topology
  const fetchTopology = useCallback(async () => {
    try {
      const data = await topologyApi.getTopology();
      setDevices(data.devices);
      setLinks(data.links);
      setSummary(data.summary);
    } catch (err) {
      console.error('Failed to fetch topology:', err);
    }
  }, []);

  // Load RCA
  const fetchRCA = useCallback(async () => {
    try {
      const data = await rcaApi.correlateAlarms();
      setRcaData(data);
    } catch (err) {
      console.error('Failed to fetch RCA:', err);
    }
  }, []);

  // Load ML Evaluation
  const fetchEvaluation = useCallback(async () => {
    try {
      const data = await mlApi.getEvaluation();
      setEvaluation(data);
    } catch (err) {
      console.error('Failed to fetch evaluation:', err);
    }
  }, []);

  // Load details & history for selected device
  const fetchDeviceData = useCallback(async (deviceId: string) => {
    try {
      const details = await topologyApi.getDeviceDetails(deviceId);
      setSelectedDeviceDetails(details);

      const history = await telemetryApi.getHistory(deviceId, 30);
      setDeviceHistory(history.metrics);

      // Fetch ML prediction
      const pred = await mlApi.predictByDevice(deviceId);
      setPrediction(pred);
    } catch (err) {
      console.error(`Failed to fetch data for ${deviceId}:`, err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchTopology();
    fetchRCA();
    fetchEvaluation();
  }, [fetchTopology, fetchRCA, fetchEvaluation]);

  // Sync selected device
  useEffect(() => {
    if (selectedDeviceId) {
      fetchDeviceData(selectedDeviceId);
    }
  }, [selectedDeviceId, fetchDeviceData]);

  // Auto-refresh interval (every 8s)
  useEffect(() => {
    const timer = setInterval(() => {
      fetchTopology();
      fetchRCA();
      if (selectedDeviceId) {
        fetchDeviceData(selectedDeviceId);
      }
    }, 8000);
    return () => clearInterval(timer);
  }, [fetchTopology, fetchRCA, selectedDeviceId, fetchDeviceData]);

  // Handle Scenario Injection
  const handleInjectScenario = async (scenario: ScenarioType, targetId: string) => {
    setIsLoading(true);
    try {
      await telemetryApi.injectScenario(scenario, targetId, 60);
      await fetchTopology();
      await fetchRCA();
      await fetchDeviceData(targetId);
      setSelectedDeviceId(targetId);
    } catch (err: any) {
      alert(`Simulation injection failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Simulation Reset
  const handleReset = async () => {
    setIsResetting(true);
    try {
      await telemetryApi.resetSimulation();
      await fetchTopology();
      await fetchRCA();
      if (selectedDeviceId) {
        await fetchDeviceData(selectedDeviceId);
      }
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  // Handle Retrain
  const handleRetrain = async () => {
    setIsTraining(true);
    try {
      const rep = await mlApi.trainModel('random_forest');
      setEvaluation(rep);
      if (selectedDeviceId) {
        await fetchDeviceData(selectedDeviceId);
      }
    } catch (err: any) {
      alert(`Training failed: ${err.message}`);
    } finally {
      setIsTraining(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
      setCurrentUser(null);
      setIsGatekeeperOpen(true);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const selectedDevice = devices.find((d) => d.id === selectedDeviceId) || null;

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col font-sans relative selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Cosmic Atmosphere */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-900/[0.08] rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-900/[0.06] rounded-full blur-[180px]" />
      </div>

      <Header
        summary={summary}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onReset={handleReset}
        isResetting={isResetting}
        currentUser={currentUser}
        onOpenGatekeeper={() => setIsGatekeeperOpen(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 p-6 space-y-6 max-w-7xl mx-auto w-full z-10">
        {/* KPI Health Overview Banner */}
        <HealthOverview summary={summary} />

        {/* Tab 1: Spatial Topology & Monitoring Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Network Topology Map */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    Antigravity Spatial Topography Canvas
                  </h2>
                  <p className="text-xs text-slate-400">
                    Weightless levitation physics, kinetic fiber beams, and gravitational failure distortion fields.
                  </p>
                </div>
                {selectedDeviceId && (
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="px-3.5 py-1.5 spatial-glass rounded-xl text-xs font-mono text-cyan-300 hover:text-white border border-cyan-500/30 hover:border-cyan-400 shadow-glow-cyan transition-all"
                  >
                    Inspect Node Visor ({selectedDeviceId})
                  </button>
                )}
              </div>

              <SpatialTopology
                devices={devices}
                links={links}
                selectedDeviceId={selectedDeviceId}
                onSelectDevice={(id) => {
                  setSelectedDeviceId(id);
                  setIsDrawerOpen(true);
                }}
                rootCauseDevices={rcaData?.root_cause_devices || []}
                symptomDevices={rcaData?.cascading_symptoms?.map((s) => s.device_id) || []}
              />
            </div>

            {/* Scenario Injection Control Panel */}
            <ScenarioControl
              devices={devices}
              selectedDeviceId={selectedDeviceId}
              onSelectDeviceId={(id) => setSelectedDeviceId(id)}
              onInject={handleInjectScenario}
              onReset={handleReset}
              isLoading={isLoading}
            />

            {/* Real-time Telemetry Trends */}
            <div className="space-y-2">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Interface Flux & Historical Telemetry ({selectedDevice?.name || selectedDeviceId})
              </h2>
              <TelemetryTrends
                metrics={deviceHistory}
                deviceName={selectedDevice?.name || selectedDeviceId || 'Selected Node'}
              />
            </div>
          </div>
        )}

        {/* Tab 2: AI Fault Predictor & Model Evaluation Hub */}
        {activeTab === 'ml' && (
          <div className="space-y-6">
            <SpatialHoloVisor
              prediction={prediction}
              deviceName={selectedDevice?.name || selectedDeviceId || 'Device'}
            />

            <ModelEvaluationView
              evaluation={evaluation}
              onRetrain={handleRetrain}
              isTraining={isTraining}
            />
          </div>
        )}

        {/* Tab 3: RCA & Alarm Correlation */}
        {activeTab === 'rca' && (
          <AlarmCorrelationTree
            rcaData={rcaData}
            onSelectDevice={(id) => {
              setSelectedDeviceId(id);
              setActiveTab('overview');
              setIsDrawerOpen(true);
            }}
          />
        )}

        {/* Tab 4: Remediation Sandbox */}
        {activeTab === 'sandbox' && (
          <RemediationSandbox
            devices={devices}
            selectedDeviceId={selectedDeviceId}
            onRemediationApplied={async () => {
              await fetchTopology();
              await fetchRCA();
              if (selectedDeviceId) {
                await fetchDeviceData(selectedDeviceId);
              }
            }}
          />
        )}
      </main>

      {/* Side Slide-Out Device Drawer */}
      {isDrawerOpen && (
        <DeviceDrawer
          device={selectedDevice}
          onClose={() => setIsDrawerOpen(false)}
          alarms={selectedDeviceDetails?.recent_alarms || []}
          latestTelemetry={selectedDeviceDetails?.latest_telemetry || null}
          onOpenPrediction={() => {
            setIsDrawerOpen(false);
            setActiveTab('ml');
          }}
          onOpenRemediation={() => {
            setIsDrawerOpen(false);
            setActiveTab('sandbox');
          }}
        />
      )}

      {/* Gatekeeper Spatial Authentication Modal */}
      <GatekeeperModal
        isOpen={isGatekeeperOpen}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsGatekeeperOpen(false);
          setElevationRequiredRole(null);
        }}
        onClose={currentUser ? () => setIsGatekeeperOpen(false) : undefined}
        requiredRole={elevationRequiredRole}
      />
    </div>
  );
};

export default App;
