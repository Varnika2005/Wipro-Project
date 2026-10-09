import React from 'react';
import { EvaluationReport } from '../../types/ml';
import { CheckCircle2, Cpu, BarChart2, RefreshCw } from 'lucide-react';

interface ModelEvaluationViewProps {
  evaluation: EvaluationReport | null;
  onRetrain: () => void;
  isTraining: boolean;
}

export const ModelEvaluationView: React.FC<ModelEvaluationViewProps> = ({
  evaluation,
  onRetrain,
  isTraining,
}) => {
  if (!evaluation) {
    return (
      <div className="p-8 text-center bg-noc-surface rounded-xl border border-noc-border text-slate-400">
        Loading model evaluation report...
      </div>
    );
  }

  const {
    model_id,
    algorithm,
    accuracy,
    macro_precision,
    macro_recall,
    macro_f1,
    total_test_samples,
    labels,
    confusion_matrix,
    per_class_metrics,
    trained_at,
  } = evaluation;

  return (
    <div className="space-y-6">
      {/* Top Banner & Retrain Action */}
      <div className="p-5 rounded-xl bg-noc-surface border border-noc-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-noc-cyan" />
            <h2 className="text-base font-bold text-white">Model Evaluation Hub (Held-Out Test Set)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Verified scikit-learn classifier <span className="font-mono text-cyan-300">({algorithm})</span> evaluated on 20% unseen test partition.
          </p>
          <p className="text-[11px] text-slate-500 font-mono mt-1">Artifact: {model_id} | Trained: {new Date(trained_at).toLocaleString()}</p>
        </div>

        <button
          onClick={onRetrain}
          disabled={isTraining}
          className="flex items-center space-x-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold shadow-glow-cyan transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTraining ? 'animate-spin' : ''}`} />
          <span>{isTraining ? 'Training In Progress...' : 'Retrain Classifier (80/20 Split)'}</span>
        </button>
      </div>

      {/* Aggregate Metric KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-noc-card border border-noc-border text-center">
          <div className="text-xs text-slate-400 font-medium">Test Accuracy</div>
          <div className="text-2xl font-black text-cyan-400 mt-1">{(accuracy * 100).toFixed(2)}%</div>
          <div className="text-[10px] text-slate-500 font-mono">Held-Out Correctness</div>
        </div>

        <div className="p-4 rounded-xl bg-noc-card border border-noc-border text-center">
          <div className="text-xs text-slate-400 font-medium">Macro Precision</div>
          <div className="text-2xl font-black text-blue-400 mt-1">{(macro_precision * 100).toFixed(2)}%</div>
          <div className="text-[10px] text-slate-500 font-mono">Low False-Alarm Rate</div>
        </div>

        <div className="p-4 rounded-xl bg-noc-card border border-noc-border text-center">
          <div className="text-xs text-slate-400 font-medium">Macro Recall</div>
          <div className="text-2xl font-black text-purple-400 mt-1">{(macro_recall * 100).toFixed(2)}%</div>
          <div className="text-[10px] text-slate-500 font-mono">Fault Sensitivity</div>
        </div>

        <div className="p-4 rounded-xl bg-noc-card border border-noc-border text-center">
          <div className="text-xs text-slate-400 font-medium">Macro F1 Score</div>
          <div className="text-2xl font-black text-emerald-400 mt-1">{(macro_f1 * 100).toFixed(2)}%</div>
          <div className="text-[10px] text-slate-500 font-mono">Harmonic Quality</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Heatmap */}
        <div className="p-5 rounded-xl bg-noc-surface border border-noc-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Confusion Matrix (True vs. Predicted)
            </h3>
            <span className="text-[10px] text-slate-500 font-mono">Total Test: {total_test_samples} Samples</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-[10px] text-slate-500 font-mono text-left">Actual \ Pred</th>
                  {labels.map((lbl) => (
                    <th key={lbl} className="p-2 text-[10px] font-mono text-slate-400 capitalize max-w-[70px] truncate">
                      {lbl.replace('_', ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {confusion_matrix.map((row, rIdx) => {
                  const actualLabel = labels[rIdx];
                  const rowSum = row.reduce((a, b) => a + b, 0);

                  return (
                    <tr key={actualLabel} className="border-t border-noc-border/50">
                      <td className="p-2 text-[10px] font-mono text-slate-400 text-left capitalize truncate">
                        {actualLabel.replace('_', ' ')}
                      </td>
                      {row.map((val, cIdx) => {
                        const isDiagonal = rIdx === cIdx;
                        const cellPct = rowSum > 0 ? (val / rowSum) * 100 : 0;

                        return (
                          <td
                            key={cIdx}
                            className={`p-2.5 text-xs font-mono font-bold transition-all ${
                              isDiagonal
                                ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
                                : val > 0
                                ? 'bg-rose-950/40 text-rose-400'
                                : 'text-slate-600'
                            }`}
                          >
                            <div>{val}</div>
                            {isDiagonal && <div className="text-[9px] text-cyan-400/80 font-normal">{cellPct.toFixed(0)}%</div>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Per-Class Performance Table */}
        <div className="p-5 rounded-xl bg-noc-surface border border-noc-border">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
            Per-Class Performance Metrics
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-noc-border text-slate-400 font-mono text-[10px] uppercase">
                  <th className="pb-2">Fault Category</th>
                  <th className="pb-2 text-right">Precision</th>
                  <th className="pb-2 text-right">Recall</th>
                  <th className="pb-2 text-right">F1 Score</th>
                  <th className="pb-2 text-right">Support</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-noc-border/50">
                {Object.entries(per_class_metrics).map(([cat, rawMetric]) => {
                  const m = rawMetric as { precision: number; recall: number; f1_score: number; support: number };
                  return (
                    <tr key={cat} className="hover:bg-noc-card/50">
                      <td className="py-2.5 font-medium text-slate-200 capitalize">
                        {cat.replace('_', ' ')}
                      </td>
                      <td className="py-2.5 text-right font-mono text-cyan-400">
                        {(m.precision * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 text-right font-mono text-blue-400">
                        {(m.recall * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 text-right font-mono text-emerald-400 font-bold">
                        {(m.f1_score * 100).toFixed(1)}%
                      </td>
                      <td className="py-2.5 text-right font-mono text-slate-500">
                        {m.support}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
