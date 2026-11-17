import React, { useEffect, useState } from 'react';
import { Recycle, ChevronLeft, ChevronRight, CheckCircle, Trees, Microscope } from 'lucide-react';
import SimulationHeader from '../shared/SimulationHeader';
import AboutPanel from '../shared/AboutPanel';
import CarbonScene from './CarbonScene';
import { CLOSE_UPS } from './CarbonCloseUps';
import EquationCard from './EquationCard';
import StageCheckCard from './StageCheckCard';
import { STAGES } from './carbonJourneyData';
import { CARBON_JOURNEY_ABOUT } from './carbonJourneyAbout';

interface CarbonJourneyViewProps {
  onBack: () => void;
}

const GRADIENT = 'from-emerald-500 to-amber-500';

/** Seconds since mount, for the scene animations. Stays at 0 under reduced motion. */
function useAnimationClock(): number {
  const [t, setT] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setT((now - start) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

const toggle = (active: boolean) =>
  `min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
    active ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
  }`;

export const CarbonJourneyView: React.FC<CarbonJourneyViewProps> = ({ onBack }) => {
  const [showAbout, setShowAbout] = useState(false);
  const [stageIdx, setStageIdx] = useState(0);
  const [view, setView] = useState<'forest' | 'closeup'>('forest');
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const t = useAnimationClock();

  const stage = STAGES[stageIdx];
  const CloseUp = CLOSE_UPS[stageIdx];
  const last = stageIdx === STAGES.length - 1;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-3 sm:p-6 md:p-8 max-w-full overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        <SimulationHeader title="Tracking a Carbon Atom" icon={Recycle} onBack={onBack} gradient={GRADIENT} onOpenAbout={() => setShowAbout(true)} />
        <AboutPanel isOpen={showAbout} onClose={() => setShowAbout(false)} content={CARBON_JOURNEY_ABOUT} gradient={GRADIENT} />

        {/* Stage stepper */}
        <nav aria-label="Stages" className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {STAGES.map((s, i) => {
            const active = i === stageIdx;
            return (
              <button
                key={s.id}
                onClick={() => setStageIdx(i)}
                aria-current={active ? 'step' : undefined}
                className={`min-h-[44px] p-2 rounded-2xl border text-left transition-all ${
                  active
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <span>Stage {i + 1}</span>
                  {solved.has(s.id) && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" aria-label="check solved" />}
                </div>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{s.short}</div>
              </button>
            );
          })}
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Visual */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-3 sm:p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-1 bg-slate-50 dark:bg-slate-900/60 p-1 rounded-2xl" role="group" aria-label="View">
                  <button onClick={() => setView('forest')} className={toggle(view === 'forest')} aria-pressed={view === 'forest'}>
                    <Trees className="w-3.5 h-3.5" /> Kelp forest
                  </button>
                  <button onClick={() => setView('closeup')} className={toggle(view === 'closeup')} aria-pressed={view === 'closeup'}>
                    <Microscope className="w-3.5 h-3.5" /> Close-up
                  </button>
                </div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stage.where}</span>
              </div>
              <div className="rounded-2xl overflow-hidden">
                {view === 'forest' ? <CarbonScene stage={stageIdx} t={t} /> : <CloseUp t={t} />}
              </div>
              <div className="flex items-center justify-between gap-2">
                <button
                  onClick={() => setStageIdx(i => Math.max(0, i - 1))}
                  disabled={stageIdx === 0}
                  className="min-h-[44px] px-4 rounded-xl bg-slate-100 dark:bg-slate-700 text-sm font-bold flex items-center gap-1 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {solved.size} of {STAGES.length} checks solved
                </span>
                <button
                  onClick={() => setStageIdx(i => (last ? 0 : i + 1))}
                  className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-1"
                >
                  {last ? 'Follow it again' : 'Next stage'} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Matter and energy ledgers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-amber-300 dark:border-amber-700 p-4 space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">Matter: the atom</h3>
                <dl className="text-sm space-y-1.5">
                  <div>
                    <dt className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Molecule</dt>
                    <dd className="font-semibold">{stage.molecule}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Carbon is</dt>
                    <dd className="font-semibold">
                      {stage.carbonForm === 'organic'
                        ? 'Organic: part of a sugar built by a living thing'
                        : stage.carbonForm === 'organic-to-inorganic'
                          ? 'Organic in glucose, then inorganic in CO₂'
                          : 'Inorganic: part of CO₂ or bicarbonate'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Carbon atoms made or destroyed</dt>
                    <dd className="font-semibold">None</dd>
                  </div>
                </dl>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-3xl border-2 border-orange-300 dark:border-orange-700 p-4 space-y-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-orange-700 dark:text-orange-400">Energy: this step</h3>
                <dl className="text-sm space-y-1.5">
                  <div>
                    <dt className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Comes from</dt>
                    <dd className="font-semibold">{stage.energyIn}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Ends up as</dt>
                    <dd className="font-semibold">{stage.energyOut}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>

          {/* Story and check */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Stage {stageIdx + 1} of {STAGES.length}
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">{stage.title}</h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              {stage.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {stage.equation && <EquationCard equation={stage.equation} />}
            <StageCheckCard
              key={stage.id}
              check={stage.check}
              onAnswered={correct => {
                if (correct) setSolved(prev => new Set(prev).add(stage.id));
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarbonJourneyView;
