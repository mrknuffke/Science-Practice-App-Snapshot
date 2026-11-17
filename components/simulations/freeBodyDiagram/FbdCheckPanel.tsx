import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Eye, EyeOff, HelpCircle, ChevronRight, Activity } from 'lucide-react';
import { FbdScenario, FbdVerifyResult, FbdForce } from '../../../types';

interface FbdCheckPanelProps {
  forces: FbdForce[];
  scenario: FbdScenario;
  verifyResult: FbdVerifyResult | null;
  onCheck: () => void;
  showSolution: boolean;
  onToggleSolution: () => void;
}

export const FbdCheckPanel: React.FC<FbdCheckPanelProps> = ({
  forces,
  scenario,
  verifyResult,
  onCheck,
  showSolution,
  onToggleSolution,
}) => {
  const [hintTier, setHintTier] = useState<number>(0);
  const expectedCount = scenario.expectedForces.length;
  const placed = forces.length;
  const hints = scenario.hints || (scenario.hint ? [scenario.hint] : []);

  const handleNextHint = () => {
    setHintTier(prev => Math.min(hints.length, prev + 1));
  };

  const isCompleteSuccess =
    verifyResult &&
    verifyResult.correct.length === expectedCount &&
    verifyResult.missing.length === 0 &&
    verifyResult.extra.length === 0 &&
    verifyResult.misdirected.length === 0 &&
    verifyResult.netForceSatisfied !== false;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Practice Tools</h3>
        <span className="text-xs font-bold text-slate-500">
          {placed} / {expectedCount} forces placed
        </span>
      </div>

      {scenario.targetAcceleration && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] text-slate-700 flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
          <span><strong>Target State:</strong> {scenario.targetAcceleration.description}</span>
        </div>
      )}

      {/* 3-Tiered Hint Ladder */}
      {hints.length > 0 && (
        <div className="space-y-1.5">
          {hintTier === 0 ? (
            <button
              onClick={handleNextHint}
              className="w-full flex items-center justify-between px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold border border-amber-200 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                Need a hint? (1 of {hints.length})
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-600" />
            </button>
          ) : (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">
                  Hint Level {hintTier} of {hints.length}
                </span>
                {hintTier < hints.length && (
                  <button
                    onClick={handleNextHint}
                    className="text-[10px] font-bold text-amber-800 hover:underline flex items-center gap-0.5"
                  >
                    Deeper Hint <ChevronRight className="w-3 h-3 inline" />
                  </button>
                )}
              </div>
              <div className="space-y-1.5 text-xs text-amber-900">
                {hints.slice(0, hintTier).map((h, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="font-bold text-amber-700 text-[10px] bg-amber-200/60 rounded px-1 mt-0.5">
                      {i + 1}
                    </span>
                    <p className="leading-snug">{h}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onCheck}
          disabled={forces.length === 0}
          className="flex-1 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          Check My FBD
        </button>
        <button
          onClick={onToggleSolution}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-black border transition-all ${
            showSolution
              ? 'bg-blue-100 border-blue-400 text-blue-700'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {showSolution ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showSolution ? 'Hide Solution' : 'Solution'}
        </button>
      </div>

      {verifyResult && (
        <div className="space-y-2">
          {verifyResult.correct.length > 0 && (
            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-black text-emerald-700">Correct Forces ({verifyResult.correct.length})</p>
                <p className="text-[10px] text-emerald-600">{verifyResult.correct.map(f => f.label).join(', ')}</p>
              </div>
            </div>
          )}

          {verifyResult.missing.length > 0 && (
            <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              <XCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-black text-rose-700">Missing ({verifyResult.missing.length})</p>
                <p className="text-[10px] text-rose-600">{verifyResult.missing.join(', ')}</p>
              </div>
            </div>
          )}

          {verifyResult.misdirected.length > 0 && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-black text-amber-700">Wrong direction ({verifyResult.misdirected.length})</p>
                <p className="text-[10px] text-amber-600">{verifyResult.misdirected.map(f => f.label).join(', ')}</p>
              </div>
            </div>
          )}

          {verifyResult.extra.length > 0 && (
            <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <XCircle className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-black text-slate-600">Extra Forces ({verifyResult.extra.length})</p>
                <p className="text-[10px] text-slate-500">{verifyResult.extra.map(f => f.label).join(', ')}</p>
              </div>
            </div>
          )}

          {/* Net force & acceleration state feedback */}
          {verifyResult.netForceFeedback && (
            <div
              className={`flex items-start gap-2 border rounded-xl px-3 py-2 ${
                verifyResult.netForceSatisfied
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-amber-50 border-amber-300 text-amber-900'
              }`}
            >
              {verifyResult.netForceSatisfied ? (
                <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              )}
              <div>
                <p className="text-xs font-black">
                  {verifyResult.netForceSatisfied ? 'Acceleration State Verified' : 'Net Force Balance Required'}
                </p>
                <p className="text-[11px] leading-snug">{verifyResult.netForceFeedback}</p>
              </div>
            </div>
          )}

          {isCompleteSuccess && (
            <div className="flex items-center gap-2 bg-emerald-100 border border-emerald-400 rounded-xl px-3 py-2">
              <CheckCircle className="w-5 h-5 text-emerald-700" />
              <p className="text-xs font-black text-emerald-800">
                Your FBD checks out. Every force and the net acceleration are correct.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
