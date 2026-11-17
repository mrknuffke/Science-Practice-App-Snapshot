import React, { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { FbdForce, FbdScenario, FbdAiFeedback } from '../../../types';
import { getFbdFeedback } from '../../../services/ai/fbd';

interface FbdAiFeedbackPanelProps {
  forces: FbdForce[];
  scenario: FbdScenario;
}

export const FbdAiFeedbackPanel: React.FC<FbdAiFeedbackPanelProps> = ({ forces, scenario }) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FbdAiFeedback | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRequest = async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const result = await getFbdFeedback(scenario, forces);
      setFeedback(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not get AI feedback. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-2xl border border-violet-200 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-violet-600" />
        <h3 className="text-xs font-black text-violet-700 uppercase tracking-widest">AI Physics Tutor</h3>
      </div>

      <p className="text-xs text-violet-700">
        Get detailed feedback on your FBD from an AI physics tutor. Requires sign-in.
      </p>

      <button
        onClick={handleRequest}
        disabled={loading || forces.length === 0}
        className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing FBD...</>
        ) : (
          <><Sparkles className="w-4 h-4" /> Get AI Feedback</>
        )}
      </button>

      {error && (
        <p className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">{error}</p>
      )}

      {feedback && (
        <div className="space-y-3 text-xs">
          <div className="bg-white rounded-xl px-3 py-2 border border-violet-200">
            <p className="font-black text-violet-700 mb-1">Overall</p>
            <p className="text-slate-700">{feedback.overallVerdict}</p>
          </div>

          {feedback.strengths.length > 0 && (
            <div className="bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-200">
              <p className="font-black text-emerald-700 mb-1">✓ Strengths</p>
              <ul className="space-y-0.5">
                {feedback.strengths.map((s, i) => (
                  <li key={i} className="text-emerald-800">• {s}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback.issues.length > 0 && (
            <div className="bg-amber-50 rounded-xl px-3 py-2 border border-amber-200">
              <p className="font-black text-amber-700 mb-1">⚠ Issues</p>
              <ul className="space-y-0.5">
                {feedback.issues.map((s, i) => (
                  <li key={i} className="text-amber-800">• {s}</li>
                ))}
              </ul>
            </div>
          )}

          {feedback.teachingPoints.length > 0 && (
            <div className="bg-blue-50 rounded-xl px-3 py-2 border border-blue-200">
              <p className="font-black text-blue-700 mb-1">📚 Physics Notes</p>
              <ul className="space-y-0.5">
                {feedback.teachingPoints.map((s, i) => (
                  <li key={i} className="text-blue-800">• {s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
