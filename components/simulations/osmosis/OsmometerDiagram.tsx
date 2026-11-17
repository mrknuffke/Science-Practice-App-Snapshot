import React from 'react';
import { MAX_HEIGHT_MM, MIN_HEIGHT_MM, TubeWidth } from './osmosisEngine';

interface OsmometerDiagramProps {
  heightMm: number;
  bagConc: number;
  beakerConc: number;
  rateMmPerMin: number;
  tube: TubeWidth;
  leaky: boolean;
}

const SURFACE_Y = 210;
const SCALE = 1.15; // px per mm
const TUBE_X = 160;
const TUBE_TOP = 44;
const BAG_TOP = 348;
const TUBE_PX: Record<TubeWidth, number> = { narrow: 6, medium: 10, wide: 15 };

const yOf = (mm: number) => SURFACE_Y - mm * SCALE;

const sugarFill = (conc: number) => `rgba(245, 158, 11, ${0.12 + Math.min(1, conc) * 0.5})`;

const FlowArrow: React.FC<{ x: number; y: number; dir: 1 | -1; opacity: number }> = ({ x, y, dir, opacity }) => (
  <g opacity={opacity} transform={`translate(${x} ${y}) scale(${dir} 1)`}>
    <line x1={-12} y1={0} x2={8} y2={0} stroke="#0284c7" strokeWidth={2.5} strokeLinecap="round" />
    <path d="M 8 0 L 2 -5 M 8 0 L 2 5" stroke="#0284c7" strokeWidth={2.5} strokeLinecap="round" fill="none" />
  </g>
);

const OsmometerDiagram: React.FC<OsmometerDiagramProps> = ({
  heightMm,
  bagConc,
  beakerConc,
  rateMmPerMin,
  tube,
  leaky,
}) => {
  const tubeW = TUBE_PX[tube];
  const meniscusY = yOf(heightMm);
  const flowing = Math.abs(rateMmPerMin) > 0.05;
  const arrowOpacity = flowing ? Math.min(1, 0.35 + Math.abs(rateMmPerMin) / 20) : 0;
  // Arrows point toward the bag when water moves in (+), away when it moves out (−).
  const inward = rateMmPerMin > 0;

  const ticks: number[] = [];
  for (let mm = Math.ceil(MIN_HEIGHT_MM / 10) * 10; mm <= MAX_HEIGHT_MM; mm += 10) ticks.push(mm);

  const flowWord = !flowing ? 'not moving' : inward ? 'rising' : 'falling';

  return (
    <svg
      viewBox="0 0 320 440"
      className="w-full h-full max-h-[480px] text-slate-500 dark:text-slate-400"
      role="img"
      aria-label={`Osmometer. The liquid in the tube is ${Math.abs(heightMm).toFixed(0)} millimetres ${
        heightMm >= 0 ? 'above' : 'below'
      } the beaker surface and is ${flowWord}.`}
    >
      {/* Beaker solution */}
      <rect x={62} y={SURFACE_Y} width={196} height={212} fill={sugarFill(beakerConc)} />
      <rect x={62} y={SURFACE_Y} width={196} height={212} fill="rgba(56, 189, 248, 0.18)" />
      <line x1={62} y1={SURFACE_Y} x2={258} y2={SURFACE_Y} stroke="#38bdf8" strokeWidth={1.5} />

      {/* Bag of dialysis tubing */}
      <path
        d={`M 124 ${BAG_TOP} C 112 380, 116 412, 160 414 C 204 412, 208 380, 196 ${BAG_TOP} Z`}
        fill={sugarFill(bagConc)}
        stroke="#d97706"
        strokeWidth={2.5}
        strokeDasharray={leaky ? '5 3' : '2 2'}
      />
      <rect x={140} y={BAG_TOP - 8} width={40} height={10} rx={3} fill="#ef4444" stroke="#991b1b" />

      {/* Flow arrows at the bag wall */}
      {flowing && (
        <>
          <FlowArrow x={inward ? 102 : 96} y={385} dir={inward ? 1 : -1} opacity={arrowOpacity} />
          <FlowArrow x={inward ? 218 : 224} y={385} dir={inward ? -1 : 1} opacity={arrowOpacity} />
        </>
      )}

      {/* Liquid column in the tube */}
      <rect
        x={TUBE_X - tubeW / 2 + 1}
        y={meniscusY}
        width={tubeW - 2}
        height={Math.max(0, BAG_TOP - meniscusY)}
        fill={sugarFill(bagConc)}
      />
      <rect
        x={TUBE_X - tubeW / 2 + 1}
        y={meniscusY}
        width={tubeW - 2}
        height={Math.max(0, BAG_TOP - meniscusY)}
        fill="rgba(56, 189, 248, 0.25)"
      />
      <path
        d={`M ${TUBE_X - tubeW / 2 + 1} ${meniscusY - 1} Q ${TUBE_X} ${meniscusY + 3} ${TUBE_X + tubeW / 2 - 1} ${meniscusY - 1}`}
        stroke="#0369a1"
        strokeWidth={1.5}
        fill="none"
      />

      {/* Tube glass */}
      <line x1={TUBE_X - tubeW / 2} y1={TUBE_TOP} x2={TUBE_X - tubeW / 2} y2={BAG_TOP} stroke="currentColor" strokeWidth={1.5} />
      <line x1={TUBE_X + tubeW / 2} y1={TUBE_TOP} x2={TUBE_X + tubeW / 2} y2={BAG_TOP} stroke="currentColor" strokeWidth={1.5} />

      {/* Ruler */}
      <g>
        <rect x={98} y={yOf(MAX_HEIGHT_MM) - 6} width={30} height={(MAX_HEIGHT_MM - MIN_HEIGHT_MM) * SCALE + 12} rx={3} className="fill-white/70 dark:fill-slate-800/80" stroke="currentColor" strokeWidth={0.75} />
        {ticks.map(mm => {
          const major = mm % 50 === 0;
          return (
            <g key={mm}>
              <line x1={128 - (major ? 10 : 5)} y1={yOf(mm)} x2={128} y2={yOf(mm)} stroke="currentColor" strokeWidth={major ? 1.2 : 0.7} />
              {major && (
                <text x={115} y={yOf(mm) + 3} textAnchor="end" fontSize={8} className="fill-current" fontFamily="Fira Code, monospace">
                  {mm}
                </text>
              )}
            </g>
          );
        })}
        <text x={113} y={yOf(MAX_HEIGHT_MM) - 10} textAnchor="middle" fontSize={8} className="fill-current">mm</text>
      </g>

      {/* Start line */}
      <line x1={TUBE_X + tubeW / 2 + 2} y1={SURFACE_Y} x2={TUBE_X + 40} y2={SURFACE_Y} stroke="#ef4444" strokeWidth={1} strokeDasharray="3 2" />
      <text x={TUBE_X + 42} y={SURFACE_Y + 3} fontSize={8} fill="#ef4444">start (0)</text>

      {/* Height label */}
      <g transform={`translate(${TUBE_X + tubeW / 2 + 6} ${meniscusY})`}>
        <rect x={0} y={-9} width={58} height={18} rx={4} className="fill-white dark:fill-slate-800" stroke="#0284c7" />
        <text x={29} y={4} textAnchor="middle" fontSize={10} fontWeight={700} fill="#0284c7" fontFamily="Fira Code, monospace">
          {heightMm >= 0 ? '+' : ''}
          {heightMm.toFixed(1)} mm
        </text>
      </g>

      {/* Beaker glass */}
      <path d="M 52 176 L 60 182 L 60 418 Q 60 426 68 426 L 252 426 Q 260 426 260 418 L 260 182 L 268 176" stroke="currentColor" strokeWidth={2.5} fill="none" />

      {/* Labels */}
      <text x={160} y={398} textAnchor="middle" fontSize={9} fontWeight={700} fill="#92400e">bag</text>
      <text x={238} y={410} textAnchor="end" fontSize={9} className="fill-current">beaker</text>
    </svg>
  );
};

export default OsmometerDiagram;
