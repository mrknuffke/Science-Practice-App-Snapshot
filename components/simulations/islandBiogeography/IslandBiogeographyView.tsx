import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bird, Play, Pause, RotateCcw, StepForward, Mountain, Waves, ClipboardList } from 'lucide-react';
import SimulationHeader from '../shared/SimulationHeader';
import AboutPanel from '../shared/AboutPanel';
import IslandMap from './IslandMap';
import SpeciesGrid from './SpeciesGrid';
import { CountGraph, RateCurves } from './IslandGraphs';
import { ISLAND_ABOUT } from './islandAbout';
import {
  AREA_MAX, AREA_MIN, AVERAGE_YEARS, DIST_MAX, DIST_MIN, KRAKATOA, POOL, SURTSEY, TICK_YEARS,
  IslandState, countOf, emptyIsland, joinedIsland, recentAverage, tick, volcano,
} from './islandEngine';

interface IslandBiogeographyViewProps {
  onBack: () => void;
}

interface RecordRow {
  island: string;
  area: number;
  distance: number;
  years: number;
  now: number;
  average: number;
}

const GRADIENT = 'from-sky-500 to-emerald-600';
const SPEEDS = [1, 5, 20] as const;
const YEARS_PER_SECOND = 5;   // at 1×
const STEP_YEARS = 10;
const MAX_ROWS = 8;

const PRESETS = [
  { label: `${KRAKATOA.label} (${KRAKATOA.area} km², ${KRAKATOA.distance} km)`, name: KRAKATOA.label, area: KRAKATOA.area, distance: KRAKATOA.distance },
  { label: `${SURTSEY.label} (${SURTSEY.area} km², ${SURTSEY.distance} km)`, name: SURTSEY.label, area: SURTSEY.area, distance: SURTSEY.distance },
];

// Log sliders: 0 to 100 maps across the whole range, so small values get room.
const toSlider = (v: number, lo: number, hi: number) => (Math.log(v / lo) / Math.log(hi / lo)) * 100;
const fromSlider = (p: number, lo: number, hi: number) => {
  const v = lo * Math.pow(hi / lo, p / 100);
  return v < 10 ? Number(v.toFixed(1)) : Math.round(v);
};
const fmt = (v: number) => (v < 10 ? v.toFixed(1) : String(Math.round(v)));

const pill = (active: boolean) =>
  `min-h-[44px] px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
    active
      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
      : 'bg-slate-50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
  }`;
const ghost =
  'min-h-[44px] px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm font-bold flex items-center gap-1.5 disabled:opacity-50';

const Readout: React.FC<{ label: string; value: string; note?: string }> = ({ label, value, note }) => (
  <div className="rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-3">
    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</div>
    <div className="font-mono font-bold text-lg text-slate-800 dark:text-slate-100">{value}</div>
    {note && <div className="text-[11px] text-slate-500 dark:text-slate-400">{note}</div>}
  </div>
);

export const IslandBiogeographyView: React.FC<IslandBiogeographyViewProps> = ({ onBack }) => {
  const [showAbout, setShowAbout] = useState(false);
  const [tab, setTab] = useState<'map' | 'curves'>('map');
  const [area, setArea] = useState(KRAKATOA.area);
  const [distance, setDistance] = useState(KRAKATOA.distance);
  const [island, setIsland] = useState<IslandState>(emptyIsland);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]>(1);
  const [watchList, setWatchList] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const [previous, setPrevious] = useState<{ points: IslandState['history']; label: string } | null>(null);
  const [rows, setRows] = useState<RecordRow[]>([]);

  const islandRef = useRef(island);
  const settingsRef = useRef({ area, distance });
  useEffect(() => { settingsRef.current = { area, distance }; }, [area, distance]);

  const presetName = PRESETS.find(p => p.area === area && p.distance === distance)?.name ?? 'Your island';

  const commit = useCallback((next: IslandState) => {
    islandRef.current = next;
    setIsland(next);
  }, []);

  const advance = useCallback((years: number) => {
    let st = islandRef.current;
    const n = Math.round(years / TICK_YEARS);
    for (let k = 0; k < n; k++) st = tick(st, settingsRef.current.area, settingsRef.current.distance, Math.random);
    commit(st);
  }, [commit]);

  // Animation loop: about YEARS_PER_SECOND × speed sim years each real second.
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    let owed = 0;
    const frame = (now: number) => {
      owed += Math.min(0.1, (now - last) / 1000) * YEARS_PER_SECOND * speed;
      last = now;
      const whole = Math.floor(owed / TICK_YEARS) * TICK_YEARS;
      if (whole > 0) {
        owed -= whole;
        advance(whole);
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [running, speed, advance]);

  const reset = useCallback(() => {
    const cur = islandRef.current;
    if (cur.history.length > 2) setPrevious({ points: cur.history, label: `Last run (${fmt(area)} km², ${fmt(distance)} km)` });
    setRunning(false);
    setNote(null);
    commit(emptyIsland());
  }, [area, distance, commit]);

  const pickPreset = (p: (typeof PRESETS)[number]) => {
    setArea(p.area);
    setDistance(p.distance);
    settingsRef.current = { area: p.area, distance: p.distance };
    reset();
  };

  const onVolcano = () => {
    commit(volcano(islandRef.current));
    setNote('A volcano wiped the island clean, as Krakatoa\'s eruption did in 1883. Every species must arrive again from the mainland.');
  };

  const onCutOff = () => {
    const cur = islandRef.current;
    const joined = joinedIsland(area, Math.random, cur.years);
    commit({ ...joined, history: [...cur.history, { t: cur.years, s: countOf(joined) }] });
    setNote(`The island was joined to the mainland and held ${countOf(joined)} species. Now the sea has cut it off at ${fmt(distance)} km. Watch what happens to the count.`);
  };

  const record = () => {
    const st = islandRef.current;
    const row: RecordRow = {
      island: presetName, area, distance,
      years: Math.round(st.years), now: countOf(st), average: Number(recentAverage(st).toFixed(1)),
    };
    setRows(r => [...r, row].slice(-MAX_ROWS));
  };

  const count = countOf(island);
  const atStart = island.years === 0;
  const flashYears = Math.max(2, YEARS_PER_SECOND * speed * 0.6);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-3 sm:p-6 md:p-8 max-w-full overflow-x-hidden">
      <div className="max-w-6xl w-full mx-auto space-y-6">
        <SimulationHeader title="Island Biogeography" icon={Bird} onBack={onBack} gradient={GRADIENT} onOpenAbout={() => setShowAbout(true)} />
        <AboutPanel isOpen={showAbout} onClose={() => setShowAbout(false)} content={ISLAND_ABOUT} gradient={GRADIENT} />

        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-12 lg:items-start">
          {/* Stage */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-4 space-y-3">
              <div className="flex gap-2" role="tablist" aria-label="View">
                <button role="tab" aria-selected={tab === 'map'} onClick={() => setTab('map')} className={pill(tab === 'map')}>Map</button>
                <button role="tab" aria-selected={tab === 'curves'} onClick={() => setTab('curves')} className={pill(tab === 'curves')}>Why it settles</button>
              </div>

              {tab === 'map' ? (
                <IslandMap state={island} area={area} distance={distance} flashYears={flashYears} />
              ) : (
                <div className="space-y-2">
                  <RateCurves area={area} distance={distance} current={count} />
                  <p className="text-sm text-slate-700 dark:text-slate-200">
                    The blue line falls: the fuller the island, the fewer mainland species are left to arrive. The orange line
                    rises: the more species live here, the more can die out. Where the lines cross, arrivals and losses are equal,
                    so the count stops changing.
                  </p>
                </div>
              )}

              {atStart && !running && (
                <p className="text-xs font-semibold text-center text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-2">
                  Predict first: how many of the {POOL} mainland species will this island hold once the count settles? Then press Play.
                </p>
              )}
              {note && (
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl p-2" role="status">
                  {note}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setRunning(r => !r)} className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold flex items-center gap-1.5">
                    {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {running ? 'Pause' : atStart ? 'Play' : 'Resume'}
                  </button>
                  <button onClick={() => advance(STEP_YEARS)} disabled={running} className={ghost}>
                    <StepForward className="w-4 h-4" /> {STEP_YEARS} years
                  </button>
                  <button onClick={reset} className={ghost}>
                    <RotateCcw className="w-4 h-4" /> Reset
                  </button>
                </div>
                <div className="flex items-center gap-1" role="group" aria-label="Simulation speed">
                  {SPEEDS.map(s => (
                    <button key={s} onClick={() => setSpeed(s)} className={pill(speed === s)} aria-pressed={speed === s}>{s}×</button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-slate-700">
                <span className="w-full text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 pt-2">Events</span>
                <button onClick={onVolcano} className={ghost}><Mountain className="w-4 h-4" /> Volcano</button>
                <button onClick={onCutOff} className={ghost}><Waves className="w-4 h-4" /> Cut off from the mainland</button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Readout label="Years" value={String(Math.round(island.years))} note={`${YEARS_PER_SECOND * speed} years per second`} />
              <Readout label="Species now" value={`${count} of ${POOL}`} />
              <Readout label="Arrivals" value={String(island.arrivals)} note="since the run began" />
              <Readout label="Local extinctions" value={String(island.losses)} note="since the run began" />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-5">
              <h3 className="text-sm font-bold mb-2">Bird species on the island over time</h3>
              <CountGraph current={island.history} previous={previous?.points ?? null} previousLabel={previous?.label ?? null} />
            </div>
          </div>

          {/* Controls and data */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-5">
              <div className="space-y-1.5">
                <div className="text-sm font-bold">Start from a real island</div>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map(p => (
                    <button key={p.name} onClick={() => pickPreset(p)} className={pill(presetName === p.name)} aria-pressed={presetName === p.name}>{p.label}</button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">A preset starts a new, empty island.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <label htmlFor="island-area">Island size</label>
                  <span className="font-mono text-amber-600 dark:text-amber-400">{fmt(area)} km²</span>
                </div>
                <input id="island-area" type="range" min={0} max={100} step={1} value={toSlider(area, AREA_MIN, AREA_MAX)}
                  onChange={e => setArea(fromSlider(Number(e.target.value), AREA_MIN, AREA_MAX))} className="w-full accent-amber-500" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <label htmlFor="island-distance">Distance from the mainland</label>
                  <span className="font-mono text-sky-600 dark:text-sky-400">{fmt(distance)} km</span>
                </div>
                <input id="island-distance" type="range" min={0} max={100} step={1} value={toSlider(distance, DIST_MIN, DIST_MAX)}
                  onChange={e => setDistance(fromSlider(Number(e.target.value), DIST_MIN, DIST_MAX))} className="w-full accent-sky-500" />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">You can move either slider mid-run. The count drifts to a new level.</p>
              </div>

              <label className="flex items-center gap-3 min-h-[44px] cursor-pointer">
                <input type="checkbox" checked={watchList} onChange={e => setWatchList(e.target.checked)} className="w-5 h-5 accent-emerald-600" />
                <span className="text-sm font-bold">Watch the list of species</span>
              </label>
              {watchList && <SpeciesGrid state={island} flashYears={flashYears} />}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-bold">Your data</h3>
                <button onClick={record} disabled={atStart} className={ghost}><ClipboardList className="w-4 h-4" /> Record</button>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Real islands wobble, so the table also shows the average count over the last {AVERAGE_YEARS} years. Run at least 150 years before you record.
              </p>
              {rows.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-left text-slate-500 dark:text-slate-400">
                        <th className="py-1 pr-2">Island</th><th className="py-1 pr-2 text-right">km²</th><th className="py-1 pr-2 text-right">km away</th>
                        <th className="py-1 pr-2 text-right">Years</th><th className="py-1 pr-2 text-right">Now</th><th className="py-1 text-right">Average</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      {rows.map((r, k) => (
                        <tr key={k} className="border-t border-slate-100 dark:border-slate-700">
                          <td className="py-1 pr-2 font-sans">{r.island}</td><td className="py-1 pr-2 text-right">{fmt(r.area)}</td>
                          <td className="py-1 pr-2 text-right">{fmt(r.distance)}</td><td className="py-1 pr-2 text-right">{r.years}</td>
                          <td className="py-1 pr-2 text-right">{r.now}</td><td className="py-1 text-right font-bold">{r.average}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IslandBiogeographyView;
