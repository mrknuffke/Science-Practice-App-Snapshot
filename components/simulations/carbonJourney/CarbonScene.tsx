import React from 'react';
import TrackedAtom from './TrackedAtom';

interface CarbonSceneProps {
  stage: number;
  /** Animation clock in seconds. Frozen at 0 when the student prefers reduced motion. */
  t: number;
}

const FLOOR_Y = 322;
const HOLDFAST = { x: 130, y: FLOOR_Y };
const URCHIN = { x: 440, y: 304 };

const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
const pingPong = (t: number, period: number) => {
  const f = (t / period) % 2;
  return f < 1 ? f : 2 - f;
};

/** Where the tracked atom sits (or travels) at each stage. */
function atomPosition(stage: number, t: number, float: { x: number; y: number }): { x: number; y: number } {
  switch (stage) {
    case 0: {
      const f = pingPong(t, 2.5);
      return { x: lerp(320, float.x + 70, f), y: lerp(140, float.y + 40, f) };
    }
    case 1:
      return { x: float.x + 66, y: float.y + 42 };
    case 2: {
      const f = pingPong(t, 2.5);
      return { x: lerp(360, URCHIN.x - 6, f), y: lerp(314, URCHIN.y + 10, f) };
    }
    case 3:
      return { x: URCHIN.x, y: URCHIN.y };
    case 4: {
      const f = (t / 4) % 1;
      return { x: lerp(URCHIN.x + 20, 300, f), y: lerp(URCHIN.y - 30, 140, f) };
    }
    default:
      return { x: 300, y: 140 };
  }
}

const HeatWaves: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g stroke="#ef4444" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.85}>
    {[0, 12, 24].map(dx => (
      <path key={dx} d={`M ${x + dx} ${y} q 4 -6 0 -12 q -4 -6 0 -12`} />
    ))}
    <text x={x + 34} y={y - 10} fontSize={12} fill="#ef4444" stroke="none" fontWeight={700}>heat</text>
  </g>
);

const CarbonScene: React.FC<CarbonSceneProps> = ({ stage, t }) => {
  const sway = Math.sin(t * 0.9) * 10;
  const float = { x: 175 + sway, y: 52 };
  const atom = atomPosition(stage, t, float);

  const blades = [0, 1, 2, 3, 4, 5].map(i => {
    const len = 150 + i * 12;
    const drop = 20 + i * 22;
    const wave = Math.sin(t * 1.2 + i) * 8;
    return `M ${float.x + 6} ${float.y + 4} C ${float.x + len * 0.35} ${float.y + drop * 0.2 + wave}, ${float.x + len * 0.7} ${float.y + drop * 0.8 - wave}, ${float.x + len} ${float.y + drop + wave}`;
  });

  return (
    <svg viewBox="0 0 600 360" className="w-full h-auto" role="img" aria-label="A bull kelp forest with a purple sea urchin on the sea floor. A gold dot marks your carbon atom.">
      <defs>
        <linearGradient id="cj-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#38bdf8" />
          <stop offset="0.55" stopColor="#0369a1" />
          <stop offset="1" stopColor="#0c4a6e" />
        </linearGradient>
        <marker id="cj-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#f97316" />
        </marker>
      </defs>
      <rect width={600} height={360} fill="url(#cj-sea)" />
      {/* Sunlight */}
      <g fill="#fde68a" opacity={0.18}>
        <polygon points="40,0 110,0 250,320 170,320" />
        <polygon points="200,0 250,0 380,320 320,320" />
      </g>
      <path d={`M 0 14 Q 75 ${8 + sway * 0.3} 150 14 T 300 14 T 450 14 T 600 14`} stroke="#e0f2fe" strokeWidth={2} fill="none" opacity={0.8} />
      <circle cx={560} cy={-6} r={34} fill="#fde047" opacity={0.9} />

      {/* Sea floor */}
      <path d={`M 0 ${FLOOR_Y} Q 150 ${FLOOR_Y - 10} 300 ${FLOOR_Y + 4} T 600 ${FLOOR_Y - 4} L 600 360 L 0 360 Z`} fill="#44403c" />

      {/* Bull kelp: holdfast, one long stipe, a gas-filled float, blades streaming from the float */}
      <ellipse cx={HOLDFAST.x} cy={HOLDFAST.y} rx={16} ry={6} fill="#713f12" />
      <path d={`M ${HOLDFAST.x} ${HOLDFAST.y} Q ${HOLDFAST.x + 30 + sway * 0.5} 190 ${float.x} ${float.y + 8}`} stroke="#854d0e" strokeWidth={5} fill="none" strokeLinecap="round" />
      {blades.map((d, i) => (
        <path key={i} d={d} stroke={i % 2 ? '#a16207' : '#ca8a04'} strokeWidth={13} fill="none" strokeLinecap="round" opacity={0.75} />
      ))}
      <circle cx={float.x} cy={float.y} r={12} fill="#92400e" stroke="#78350f" strokeWidth={2} />
      <text x={HOLDFAST.x} y={FLOOR_Y + 26} textAnchor="middle" fontSize={16} fontWeight={700} fill="#fef3c7">bull kelp (producer)</text>

      {/* Drift kelp on the floor, food for the urchin */}
      {stage >= 2 && <path d={`M 340 ${FLOOR_Y - 4} q 20 -8 50 -2`} stroke="#a16207" strokeWidth={7} strokeLinecap="round" fill="none" />}

      {/* Purple sea urchin */}
      <g>
        {Array.from({ length: 30 }, (_, i) => {
          const a = (i / 30) * Math.PI * 2;
          const l = 26 + Math.sin(t * 2 + i) * 2;
          return <line key={i} x1={URCHIN.x} y1={URCHIN.y} x2={URCHIN.x + Math.cos(a) * l} y2={URCHIN.y + Math.sin(a) * l * 0.8} stroke="#7e22ce" strokeWidth={2.5} strokeLinecap="round" />;
        })}
        <ellipse cx={URCHIN.x} cy={URCHIN.y} rx={18} ry={14} fill="#581c87" />
      </g>
      <text x={URCHIN.x} y={FLOOR_Y + 26} textAnchor="middle" fontSize={16} fontWeight={700} fill="#f3e8ff">purple sea urchin (consumer)</text>

      {(stage === 3 || stage === 5) && <HeatWaves x={URCHIN.x + 30} y={URCHIN.y - 30} />}

      {/* Stage 5: path back toward the kelp */}
      {stage === 4 && (
        <path d={`M ${URCHIN.x + 20} ${URCHIN.y - 30} Q 400 140 ${float.x + 70} ${float.y + 40}`} stroke="#fbbf24" strokeWidth={2} strokeDasharray="6 5" fill="none" opacity={0.8} />
      )}

      {/* Stage 6: matter loop and energy line */}
      {stage === 5 && (
        <g>
          <path d={`M ${float.x + 70} ${float.y + 40} Q 380 120 ${URCHIN.x - 10} ${URCHIN.y - 20} Q 330 230 300 140 Q 280 100 ${float.x + 74} ${float.y + 46}`} stroke="#fbbf24" strokeWidth={3} strokeDasharray="8 6" fill="none" />
          <text x={330} y={220} fontSize={13} fontWeight={800} fill="#fde68a">carbon: a loop</text>
          <path d={`M 540 30 L ${float.x + 30} ${float.y + 10}`} stroke="#f97316" strokeWidth={3} markerEnd="url(#cj-arrow)" />
          <text x={380} y={40} fontSize={13} fontWeight={800} fill="#fed7aa">energy in: sunlight</text>
          <text x={URCHIN.x + 64} y={URCHIN.y - 58} fontSize={13} fontWeight={800} fill="#fecaca">energy out</text>
        </g>
      )}

      <TrackedAtom x={atom.x} y={atom.y} t={t} />
    </svg>
  );
};

export default CarbonScene;
