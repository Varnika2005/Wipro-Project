import { apiClient } from './client';
import { PredictionResult, EvaluationReport } from '../types/ml';
import { TelemetryFeatures } from '../types/telemetry';

export const mlApi = {
  predictByDevice: async (deviceId: string): Promise<PredictionResult> => {
    const res = await apiClient.post<PredictionResult>('/ml/predict', { device_id: deviceId });
    return res.data;
  },

  predictByMetrics: async (metrics: TelemetryFeatures): Promise<PredictionResult> => {
    const res = await apiClient.post<PredictionResult>('/ml/predict', { metrics });
    return res.data;
  },

  getEvaluation: async (): Promise<EvaluationReport> => {
    const res = await apiClient.get<EvaluationReport>('/ml/evaluation');
    return res.data;
  },

  trainModel: async (modelType: string = 'random_forest'): Promise<EvaluationReport> => {
    const res = await apiClient.post<EvaluationReport>('/ml/train', {
      model_type: modelType,
      samples_per_class: 400,
      test_split: 0.2,
      random_seed: 42,
    });
    return res.data;
  },
};
