import React from 'react';
import { AREA_MAX, AREA_MIN, DIST_MAX, DIST_MIN, IslandState, POOL } from './islandEngine';

interface IslandMapProps {
  state: IslandState;
  area: number;
  distance: number;
  /** Sim years an arrival ring or a loss mark stays visible. */
  flashYears: number;
}

/** One hue per mainland species, shared with the species grid. */
export const speciesColor = (k: number) => `hsl(${Math.round((k * 360 * 7) / POOL) % 360} 70% 48%)`;

const W = 600;
const H = 300;
const COAST = 70;

// Stretched (log) scales, so a 1 km island and a 500 km island both fit.
const islandX = (d: number) => 120 + (Math.log(d / DIST_MIN) / Math.log(DIST_MAX / DIST_MIN)) * 330;
const islandR = (a: number) => 14 + (Math.log(a / AREA_MIN) / Math.log(AREA_MAX / AREA_MIN)) * 58;

/** Spread POOL fixed spots over the island disc (sunflower pattern). */
const spot = (k: number, r: number) => {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const rr = r * 0.82 * Math.sqrt((k + 0.5) / POOL);
  return { dx: rr * Math.cos(k * golden), dy: rr * Math.sin(k * golden) };
};

const IslandMap: React.FC<IslandMapProps> = ({ state, area, distance, flashYears }) => {
  const cx = islandX(distance);
  const cy = H / 2;
  const r = islandR(area);
  const dot = Math.max(2.5, Math.min(5, r / 9));
  const recent = (k: number, kind: 'arrived' | 'lost') => {
    const ev = state.lastEvent[k];
    return ev !== null && ev.kind === kind && state.years - ev.at <= flashYears;
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`Map: an island of ${area} square kilometres, ${distance} kilometres from the mainland, holding ${state.present.filter(Boolean).length} bird species`}>
      <rect x={0} y={0} width={W} height={H} rx={18} className="fill-sky-100 dark:fill-sky-950" />
      {/* mainland */}
      <path d={`M0 0 H${COAST - 10} Q${COAST + 8} ${H * 0.3} ${COAST - 4} ${H * 0.5} Q${COAST - 16} ${H * 0.75} ${COAST} ${H} H0 Z`} className="fill-emerald-600 dark:fill-emerald-700" />
      <text x={COAST + 14} y={26} className="fill-emerald-800 dark:fill-emerald-300 text-[13px] font-bold">← Mainland</text>
      <text x={COAST + 14} y={44} className="fill-slate-600 dark:fill-slate-300 text-[11px]">{POOL} bird species live here</text>

      {/* distance bar */}
      <line x1={COAST} y1={H - 26} x2={cx - r} y2={H - 26} className="stroke-slate-500 dark:stroke-slate-400" strokeWidth={1.5} strokeDasharray="5 4" />
      <text x={(COAST + cx - r) / 2} y={H - 32} textAnchor="middle" className="fill-slate-600 dark:fill-slate-300 text-[12px] font-semibold">
        {distance < 10 ? distance.toFixed(1) : Math.round(distance)} km
      </text>

      {/* island */}
      <circle cx={cx} cy={cy} r={r} className="fill-amber-200 dark:fill-amber-800 stroke-amber-500 dark:stroke-amber-600" strokeWidth={2} />
      <circle cx={cx} cy={cy} r={r * 0.78} className="fill-emerald-400/70 dark:fill-emerald-600/70" />
      <text x={cx} y={cy - r - 10} textAnchor="middle" className="fill-slate-700 dark:fill-slate-200 text-[12px] font-bold">
        {area < 10 ? area.toFixed(1) : Math.round(area)} km²
      </text>

      {state.present.map((on, k) => {
        const { dx, dy } = spot(k, r);
        const x = cx + dx;
        const y = cy + dy;
        if (on) {
          return (
            <g key={k}>
              <circle cx={x} cy={y} r={dot} fill={speciesColor(k)} />
              {recent(k, 'arrived') && <circle cx={x} cy={y} r={dot + 3} fill="none" className="stroke-slate-900 dark:stroke-white" strokeWidth={1.5} />}
            </g>
          );
        }
        if (recent(k, 'lost')) {
          return (
            <g key={k} className="stroke-slate-600 dark:stroke-slate-300" strokeWidth={1.5}>
              <line x1={x - dot} y1={y - dot} x2={x + dot} y2={y + dot} />
              <line x1={x - dot} y1={y + dot} x2={x + dot} y2={y - dot} />
            </g>
          );
        }
        return null;
      })}

      <text x={W - 12} y={H - 10} textAnchor="end" className="fill-slate-500 dark:fill-slate-400 text-[11px]">
        Not to scale: size and distance are stretched to fit
      </text>
    </svg>
  );
};

export default IslandMap;
