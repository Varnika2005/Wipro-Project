import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/common/Header';
import { HealthOverview } from './components/dashboard/HealthOverview';
import { SpatialTopology } from './components/topology/SpatialTopology';
import { DeviceInspector } from './components/topology/DeviceInspector';
import { ScenarioControl } from './components/simulation/ScenarioControl';
import { GatekeeperModal } from './components/auth/GatekeeperModal';

const TelemetryTrends = React.lazy(() => import('./components/dashboard/TelemetryTrends').then(m => ({ default: m.TelemetryTrends })));
const SpatialHoloVisor = React.lazy(() => import('./components/ml/SpatialHoloVisor').then(m => ({ default: m.SpatialHoloVisor })));
const ModelEvaluationView = React.lazy(() => import('./components/ml/ModelEvaluationView').then(m => ({ default: m.ModelEvaluationView })));
const AlarmCorrelationTree = React.lazy(() => import('./components/rca/AlarmCorrelationTree').then(m => ({ default: m.AlarmCorrelationTree })));
const RemediationSandbox = React.lazy(() => import('./components/simulation/RemediationSandbox').then(m => ({ default: m.RemediationSandbox })));
const HelpGuide = React.lazy(() => import('./components/common/HelpGuide').then(m => ({ default: m.HelpGuide })));

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
  const [devices, setDevices] = useState<Device[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [summary, setSummary] = useState<TopologySummary | null>(null);

  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
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
        setIsGatekeeperOpen(true);
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
      await telemetryApi.injectScenario(scenario, targetId);
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
      alert('Model retraining completed successfully.');
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

  type TabType = 'overview' | 'network' | 'predictions' | 'incidents' | 'remediation' | 'model' | 'help';
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <div className="min-h-screen bg-nms-background text-nms-text flex flex-col font-sans relative selection:bg-nms-primary/30 selection:text-nms-primaryHover">
      <Header
        summary={summary}
        onReset={handleReset}
        isResetting={isResetting}
        currentUser={currentUser}
        onOpenGatekeeper={() => setIsGatekeeperOpen(true)}
        onLogout={handleLogout}
      />

      {/* Navigation Tabs */}
      <div className="bg-nms-surface border-b border-nms-border px-4 md:px-6">
        <div className="max-w-7xl mx-auto flex space-x-1 overflow-x-auto">
          {(['overview', 'network', 'predictions', 'incidents', 'remediation', 'model', 'help'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'border-nms-primary text-nms-primary'
                  : 'border-transparent text-nms-textMuted hover:text-nms-text hover:border-nms-border'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full z-10 flex flex-col space-y-6">
        <React.Suspense fallback={<div className="p-12 text-center text-nms-textMuted font-mono border border-nms-border bg-white rounded">Loading module...</div>}>
        
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <HealthOverview summary={summary} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 nms-panel flex flex-col">
                <div className="nms-panel-header">
                  <h2 className="text-sm font-bold text-nms-text uppercase tracking-wider font-mono">
                    Network Topography Canvas
                  </h2>
                </div>
                <div className="flex-1 p-0 relative rounded-b-lg min-h-[500px]">
                  <SpatialTopology
                    devices={devices}
                    links={links}
                    selectedDeviceId={selectedDeviceId}
                    onSelectDevice={(id) => {
                      setSelectedDeviceId(id);
                      setActiveTab('network');
                    }}
                    rootCauseDevices={rcaData?.root_cause_devices || []}
                    symptomDevices={rcaData?.cascading_symptoms?.map((s) => s.device_id) || []}
                  />
                </div>
              </div>
              <div className="lg:col-span-1 space-y-6 flex flex-col">
                <ScenarioControl
                  devices={devices}
                  selectedDeviceId={null}
                  onSelectDeviceId={(id) => {
                    setSelectedDeviceId(id);
                    setActiveTab('network');
                  }}
                  onInject={handleInjectScenario}
                  onReset={handleReset}
                  isLoading={isLoading}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'network' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col space-y-6">
              <div className="nms-panel flex flex-col h-[600px]">
                <div className="nms-panel-header">
                  <h2 className="text-sm font-bold text-nms-text uppercase tracking-wider font-mono">
                    Interactive Topology
                  </h2>
                </div>
                <div className="flex-1 relative">
                   <SpatialTopology
                      devices={devices}
                      links={links}
                      selectedDeviceId={selectedDeviceId}
                      onSelectDevice={setSelectedDeviceId}
                      rootCauseDevices={rcaData?.root_cause_devices || []}
                      symptomDevices={rcaData?.cascading_symptoms?.map((s) => s.device_id) || []}
                    />
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 xl:col-span-3 flex flex-col space-y-6">
              {selectedDeviceId ? (
                <>
                  <div className="flex justify-between items-center nms-panel-header bg-white border border-nms-border rounded-lg">
                    <span className="text-xs font-mono font-bold text-nms-text">Target Node Context</span>
                    <button
                      onClick={() => setSelectedDeviceId(null)}
                      className="text-[10px] uppercase font-bold text-nms-textMuted hover:text-nms-text py-1 px-2 border border-nms-border rounded"
                    >
                      Clear
                    </button>
                  </div>
                  <DeviceInspector
                    device={selectedDevice}
                    onClose={() => setSelectedDeviceId(null)}
                    alarms={selectedDeviceDetails?.recent_alarms || []}
                    latestTelemetry={selectedDeviceDetails?.latest_telemetry || null}
                    onOpenPrediction={() => setActiveTab('predictions')}
                    onOpenRemediation={() => setActiveTab('remediation')}
                  />
                  <TelemetryTrends
                    metrics={deviceHistory}
                    deviceName={selectedDevice?.name || selectedDeviceId}
                  />
                </>
              ) : (
                <div className="nms-panel p-6 text-center text-nms-textMuted">
                  Select a device from the topology to view details.
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'predictions' && (
          <div className="max-w-7xl mx-auto w-full">
            {selectedDeviceId ? (
              <SpatialHoloVisor
                prediction={prediction}
                deviceName={selectedDevice?.name || selectedDeviceId}
              />
            ) : (
              <div className="nms-panel p-12 text-center text-nms-textMuted font-mono">
                Please select a target node in the Network tab to view predictions.
              </div>
            )}
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="max-w-7xl mx-auto w-full">
            <AlarmCorrelationTree
              rcaData={rcaData}
              onSelectDevice={(id) => {
                setSelectedDeviceId(id);
                setActiveTab('network');
              }}
            />
          </div>
        )}

        {activeTab === 'remediation' && (
          <div className="max-w-7xl mx-auto w-full">
            {selectedDeviceId ? (
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
            ) : (
              <div className="nms-panel p-12 text-center text-nms-textMuted font-mono">
                Please select a target node in the Network tab to simulate remediation.
              </div>
            )}
          </div>
        )}

        {activeTab === 'model' && (
          <div className="max-w-7xl mx-auto w-full">
            <ModelEvaluationView
              evaluation={evaluation}
              onRetrain={handleRetrain}
              isTraining={isTraining}
            />
          </div>
        )}

        {activeTab === 'help' && (
          <div className="w-full max-w-4xl mx-auto">
            <HelpGuide />
          </div>
        )}
        
        </React.Suspense>
      </main>

      {/* Gatekeeper Authentication Modal */}
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
