import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Droplets, Play, Pause, RotateCcw, Trophy } from 'lucide-react';
import SimulationHeader from '../shared/SimulationHeader';
import AboutPanel from '../shared/AboutPanel';
import ChallengeDeck from '../shared/ChallengeDeck';
import OsmometerDiagram from './OsmometerDiagram';
import MembraneWindow from './MembraneWindow';
import HeightGraph, { HeightPoint } from './HeightGraph';
import TugOfWar from './TugOfWar';
import { OsmosisState, TubeWidth, MembraneKind, initialState, readout, step } from './osmosisEngine';
import { OSMOSIS_CHALLENGES, OsmosisSetup, OsmosisRunState } from './osmosisChallenges';
import { OSMOSIS_ABOUT } from './osmosisAbout';

interface OsmosisViewProps {
  onBack: () => void;
}

interface PreviousRun {
  points: HeightPoint[];
  setup: OsmosisSetup;
}

const GRADIENT = 'from-sky-500 to-emerald-600';
const SPEEDS = [1, 5, 20] as const;
const TUBES: TubeWidth[] = ['narrow', 'medium', 'wide'];
const LOG_EVERY_S = 0.5;
const MAX_POINTS = 600;

const PRESETS: Array<{ label: string; setup: Partial<OsmosisSetup> }> = [
  { label: 'Sugar bag in water', setup: { bagConc: 0.8, beakerConc: 0 } },
  { label: 'Water bag in sugar', setup: { bagConc: 0, beakerConc: 0.6 } },
  { label: 'Same on both sides', setup: { bagConc: 0.5, beakerConc: 0.5 } },
];

const describeSetup = (s: OsmosisSetup) =>
  `bag ${s.bagConc.toFixed(2)} M, beaker ${s.beakerConc.toFixed(2)} M, ${s.tube} tube${s.membrane === 'leaky' ? ', leaky' : ''}`;

const pill = (active: boolean) =>
  `min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
    active
      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
      : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
  }`;

const Readout: React.FC<{ label: string; value: string; note?: string }> = ({ label, value, note }) => (
  <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3">
    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
    <div className="font-mono font-bold text-lg text-slate-800 dark:text-slate-100">{value}</div>
    {note && <div className="text-[11px] text-slate-500 dark:text-slate-400">{note}</div>}
  </div>
);

export const OsmosisView: React.FC<OsmosisViewProps> = ({ onBack }) => {
  const [showAbout, setShowAbout] = useState(false);
  const [setup, setSetup] = useState<OsmosisSetup>({ bagConc: 0.8, beakerConc: 0, tube: 'medium', membrane: 'ideal' });
  const [model, setModel] = useState<OsmosisState>(() => initialState(0.8));
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [history, setHistory] = useState<HeightPoint[]>([{ t: 0, h: 0 }]);
  const [previous, setPrevious] = useState<PreviousRun | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeIdx, setChallengeIdx] = useState(0);

  const modelRef = useRef(model);
  const setupRef = useRef(setup);
  const historyRef = useRef(history);
  const peakRef = useRef(0);
  const lastLogRef = useRef(0);

  useEffect(() => {
    setupRef.current = setup;
  }, [setup]);

  const live = readout(model, setup);

  /** Begin a fresh run with the given setup. A run that went anywhere is kept for comparison. */
  const newRun = useCallback((next: OsmosisSetup) => {
    if (historyRef.current.length > 2) {
      setPrevious({ points: historyRef.current, setup: setupRef.current });
    }
    const fresh = initialState(next.bagConc);
    modelRef.current = fresh;
    historyRef.current = [{ t: 0, h: 0 }];
    peakRef.current = 0;
    lastLogRef.current = 0;
    setupRef.current = next;
    setSetup(next);
    setModel(fresh);
    setHistory(historyRef.current);
    setRunning(false);
    setResetKey(k => k + 1);
  }, []);

  // Animation loop: advance the model while running.
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    let lastPaint = 0;
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000) * speed;
      last = now;
      const next = step(modelRef.current, setupRef.current, dt);
      modelRef.current = next;
      peakRef.current = Math.max(peakRef.current, next.heightMm);
      if (next.time - lastLogRef.current >= LOG_EVERY_S) {
        lastLogRef.current = next.time;
        let pts = [...historyRef.current, { t: Number(next.time.toFixed(1)), h: Number(next.heightMm.toFixed(2)) }];
        if (pts.length > MAX_POINTS) pts = pts.filter((_, i) => i % 2 === 0 || i === pts.length - 1);
        historyRef.current = pts;
      }
      setModel(next);
      if (now - lastPaint > 250) {
        lastPaint = now;
        setHistory(historyRef.current);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      setHistory(historyRef.current);
    };
  }, [running, speed]);

  const applySetup = useCallback((s: OsmosisSetup) => newRun(s), [newRun]);

  const handleVerify = useCallback(() => {
    const run: OsmosisRunState = {
      setup: setupRef.current,
      heightMm: modelRef.current.heightMm,
      rateMmPerMin: readout(modelRef.current, setupRef.current).rateMmPerMin,
      peakMm: peakRef.current,
      elapsed: modelRef.current.time,
      previous: previous?.setup ?? null,
    };
    return OSMOSIS_CHALLENGES[challengeIdx].check(run);
  }, [challengeIdx, previous]);

  const atStart = model.time === 0;
  const flowSentence =
    Math.abs(live.rateMmPerMin) < 0.05
      ? 'No net water movement. Water still crosses both ways, in equal amounts.'
      : live.rateMmPerMin > 0
        ? 'More water is moving into the bag than out, so the column rises.'
        : 'More water is moving out of the bag than in, so the column falls.';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-3 sm:p-6 md:p-8 max-w-full overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        <SimulationHeader title="Osmosis Lab" icon={Droplets} onBack={onBack} gradient={GRADIENT} onOpenAbout={() => setShowAbout(true)} />

        <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <button onClick={() => setChallengeMode(false)} className={pill(!challengeMode)}>
            Explore
          </button>
          <button
            onClick={() => {
              setChallengeMode(true);
              applySetup(OSMOSIS_CHALLENGES[challengeIdx].start);
            }}
            className={`${pill(challengeMode)} flex items-center gap-1.5`}
          >
            <Trophy className="w-3.5 h-3.5" /> Challenges
          </button>
        </div>

        <AboutPanel isOpen={showAbout} onClose={() => setShowAbout(false)} content={OSMOSIS_ABOUT} gradient={GRADIENT} />

        {challengeMode && (
          <ChallengeDeck
            title="Osmosis Challenges"
            challenges={OSMOSIS_CHALLENGES}
            currentIndex={challengeIdx}
            onSelectIndex={idx => {
              setChallengeIdx(idx);
              applySetup(OSMOSIS_CHALLENGES[idx].start);
            }}
            onVerify={handleVerify}
            onApplySolution={() => applySetup(OSMOSIS_CHALLENGES[challengeIdx].solutionSetup)}
            solutionUnlockAfter={2}
            accentGradient={GRADIENT}
          />
        )}

        {/* Phones: apparatus, controls, close-up. Wide screens: close-up sits under the apparatus. */}
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start">
          <div className="contents lg:block lg:col-span-5 lg:space-y-6">
            <div className="order-1 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
              <div className="flex justify-center">
                <div className="w-full max-w-[360px] aspect-[320/440]">
                  <OsmometerDiagram
                    heightMm={model.heightMm}
                    bagConc={live.bagConc}
                    beakerConc={setup.beakerConc}
                    rateMmPerMin={running ? live.rateMmPerMin : 0}
                    tube={setup.tube}
                    leaky={setup.membrane === 'leaky'}
                  />
                </div>
              </div>
              {atStart && !running && (
                <p className="mt-2 text-xs font-semibold text-center text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-2">
                  Predict first: will the column rise, fall or stay put? Then press Start.
                </p>
              )}
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex gap-2">
                  <button
                    onClick={() => setRunning(r => !r)}
                    className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-1.5"
                  >
                    {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {running ? 'Pause' : atStart ? 'Start' : 'Resume'}
                  </button>
                  <button
                    onClick={() => newRun(setup)}
                    className="min-h-[44px] px-4 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                </div>
                <div className="flex items-center gap-1" role="group" aria-label="Simulation speed">
                  {SPEEDS.map(s => (
                    <button key={s} onClick={() => setSpeed(s)} className={pill(speed === s)} aria-pressed={speed === s}>
                      {s}×
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-2 text-xs font-mono text-slate-500 dark:text-slate-400 text-right">
                Time: {model.time.toFixed(0)} s
              </div>
            </div>
            <div className="order-3 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 space-y-2">
              <h3 className="text-sm font-bold">Close-up of the bag wall</h3>
              <MembraneWindow
                inputs={{ bagConc: live.bagConc, beakerConc: setup.beakerConc, heightMm: model.heightMm, membrane: setup.membrane }}
                running={running}
                resetKey={resetKey}
              />
            </div>
          </div>

          {/* Controls and data */}
          <div className="order-2 lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-5">
              <div className="flex flex-wrap gap-2">
                {PRESETS.map(p => (
                  <button key={p.label} onClick={() => newRun({ ...setup, ...p.setup })} className={pill(false)}>
                    {p.label}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <label htmlFor="bag-conc">Sugar in the bag</label>
                  <span className="font-mono text-amber-600 dark:text-amber-400">{setup.bagConc.toFixed(2)} M</span>
                </div>
                <input
                  id="bag-conc"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={setup.bagConc}
                  onChange={e => newRun({ ...setup, bagConc: Number(e.target.value) })}
                  className="w-full accent-amber-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Changing this starts a new run.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <label htmlFor="beaker-conc">Sugar in the beaker</label>
                  <span className="font-mono text-amber-600 dark:text-amber-400">{setup.beakerConc.toFixed(2)} M</span>
                </div>
                <input
                  id="beaker-conc"
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={setup.beakerConc}
                  onChange={e => setSetup(s => ({ ...s, beakerConc: Number(e.target.value) }))}
                  className="w-full accent-amber-500"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">You can change this mid-run, like moving the bag to a new beaker.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="text-sm font-bold">Tube</div>
                  <div className="flex gap-1.5" role="group" aria-label="Tube width">
                    {TUBES.map(t => (
                      <button key={t} onClick={() => newRun({ ...setup, tube: t })} className={`${pill(setup.tube === t)} capitalize flex-1`} aria-pressed={setup.tube === t}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="text-sm font-bold">Membrane</div>
                  <div className="flex gap-1.5" role="group" aria-label="Membrane type">
                    {(['ideal', 'leaky'] as MembraneKind[]).map(m => (
                      <button key={m} onClick={() => newRun({ ...setup, membrane: m })} className={`${pill(setup.membrane === m)} flex-1`} aria-pressed={setup.membrane === m}>
                        {m === 'ideal' ? 'Water only' : 'Leaky'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Readout label="Column height" value={`${model.heightMm >= 0 ? '+' : ''}${model.heightMm.toFixed(1)} mm`} note="from the start line" />
              <Readout
                label="Column speed"
                value={atStart ? 'n/a' : `${live.rateMmPerMin >= 0 ? '+' : ''}${live.rateMmPerMin.toFixed(1)}`}
                note={atStart ? 'press Start' : 'mm per minute'}
              />
              <Readout label="Sugar in bag" value={`${live.bagConc.toFixed(2)} M`} note={setup.membrane === 'leaky' ? 'drops as sugar leaks' : 'drops as water enters'} />
              <Readout label="Sugar in beaker" value={`${setup.beakerConc.toFixed(2)} M`} note="stays fixed (big beaker)" />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-3">
              <h3 className="text-sm font-bold">What decides the flow</h3>
              {atStart ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Make your prediction, then press Start to see what moves the water.</p>
              ) : (
                <>
                  <TugOfWar osmosisMm={live.osmosisDriveMm} columnMm={live.columnDriveMm} />
                  <p className="text-sm text-slate-700 dark:text-slate-200 font-medium">{flowSentence}</p>
                </>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
              <h3 className="text-sm font-bold mb-2">Column height over time</h3>
              <HeightGraph
                current={history}
                previous={previous?.points ?? null}
                previousLabel={previous ? `Last run (${describeSetup(previous.setup)})` : null}
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default OsmosisView;
