import React from 'react';
import TrackedAtom from './TrackedAtom';

interface CloseUpProps {
  t: number;
}

const TEXT = 'fill-slate-700 dark:fill-slate-200';
const MUTED = 'fill-slate-500 dark:fill-slate-400';

const lerp = (a: number, b: number, f: number) => a + (b - a) * f;
const loop = (t: number, period: number) => (t / period) % 1;

const Pill: React.FC<{ x: number; y: number; text: string; colour?: string; w?: number }> = ({ x, y, text, colour = '#0ea5e9', w = 64 }) => (
  <g>
    <rect x={x - w / 2} y={y - 12} width={w} height={24} rx={12} fill={colour} opacity={0.18} stroke={colour} />
    <text x={x} y={y + 5} textAnchor="middle" fontSize={13} fontWeight={700} className={TEXT}>{text}</text>
  </g>
);

const Arrow: React.FC<{ x1: number; y1: number; x2: number; y2: number; colour?: string }> = ({ x1, y1, x2, y2, colour = '#64748b' }) => {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const h = 8;
  return (
    <g stroke={colour} strokeWidth={2.5} fill="none" strokeLinecap="round">
      <line x1={x1} y1={y1} x2={x2} y2={y2} />
      <path d={`M ${x2} ${y2} L ${x2 - h * Math.cos(a - 0.5)} ${y2 - h * Math.sin(a - 0.5)} M ${x2} ${y2} L ${x2 - h * Math.cos(a + 0.5)} ${y2 - h * Math.sin(a + 0.5)}`} />
    </g>
  );
};

/**
 * Glucose ring drawn correctly: five carbons and one oxygen in the ring, with
 * carbon 6 outside it. The original drew six carbons in the ring.
 */
const GlucoseRing: React.FC<{ cx: number; cy: number; s?: number; t: number; tracked?: boolean }> = ({ cx, cy, s = 34, t, tracked = true }) => {
  const names = ['O', 'C', 'C', 'C', 'C', 'C'];
  const pts = names.map((_, i) => {
    const a = ((-60 + i * 60) * Math.PI) / 180;
    return { x: cx + Math.cos(a) * s, y: cy + Math.sin(a) * s };
  });
  const c5 = pts[5];
  const c6 = { x: c5.x, y: c5.y - s * 0.9 };
  return (
    <g>
      <polygon points={pts.map(p => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#64748b" strokeWidth={2.5} />
      <line x1={c5.x} y1={c5.y} x2={c6.x} y2={c6.y} stroke="#64748b" strokeWidth={2.5} />
      {[...pts, c6].map((p, i) => {
        const isO = i === 0;
        if (tracked && i === 3) return null;
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={9} fill={isO ? '#ef4444' : '#475569'} />
            <text x={p.x} y={p.y + 4} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fff">{isO ? 'O' : 'C'}</text>
          </g>
        );
      })}
      {tracked && <TrackedAtom x={pts[3].x} y={pts[3].y} t={t} r={9} label={null} />}
    </g>
  );
};

const Frame: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <svg viewBox="0 0 600 360" className="w-full h-auto" role="img" aria-label={label}>
    <rect width={600} height={360} rx={16} className="fill-slate-50 dark:fill-slate-900" />
    {children}
  </svg>
);

const SeawaterCloseUp: React.FC<CloseUpProps> = ({ t }) => {
  const f = loop(t, 4);
  const crossing = f < 0.5;
  const ax = crossing ? lerp(110, 330, f * 2) : lerp(330, 470, (f - 0.5) * 2);
  return (
    <Frame label="Close-up: bicarbonate in seawater enters a kelp cell and an enzyme turns it into CO2 for the chloroplast.">
      <rect x={0} y={0} width={290} height={360} rx={16} fill="#0ea5e9" opacity={0.12} />
      <rect x={290} y={20} width={14} height={320} rx={6} fill="#a16207" opacity={0.7} />
      <text x={140} y={40} textAnchor="middle" fontSize={14} fontWeight={800} className={TEXT}>seawater</text>
      <text x={450} y={40} textAnchor="middle" fontSize={14} fontWeight={800} className={TEXT}>inside a kelp cell</text>
      <text x={297} y={355} textAnchor="middle" fontSize={11} className={MUTED}>cell wall and membrane</text>
      {[[60, 110], [200, 90], [80, 250], [220, 280], [150, 190]].map(([x, y], i) => (
        <Pill key={i} x={x} y={y} text={i === 4 ? 'CO₂' : 'HCO₃⁻'} />
      ))}
      <ellipse cx={400} cy={250} rx={50} ry={26} fill="#a855f7" opacity={0.2} stroke="#a855f7" />
      <text x={400} y={246} textAnchor="middle" fontSize={11} fontWeight={700} className={TEXT}>enzyme</text>
      <text x={400} y={261} textAnchor="middle" fontSize={11} className={MUTED}>HCO₃⁻ → CO₂</text>
      <ellipse cx={500} cy={150} rx={70} ry={40} fill="#22c55e" opacity={0.2} stroke="#16a34a" strokeWidth={2} />
      <text x={500} y={155} textAnchor="middle" fontSize={13} fontWeight={700} className={TEXT}>chloroplast</text>
      <TrackedAtom x={ax} y={crossing ? 190 : lerp(190, 160, (f - 0.5) * 2)} t={t} label={crossing ? 'in HCO₃⁻' : 'now in CO₂'} />
    </Frame>
  );
};

const PhotosynthesisCloseUp: React.FC<CloseUpProps> = ({ t }) => (
  <Frame label="Close-up of a chloroplast. Light splits water and charges ATP and NADPH. The Calvin cycle uses them to build CO2 into glucose.">
    <ellipse cx={300} cy={190} rx={285} ry={150} fill="#22c55e" opacity={0.12} stroke="#16a34a" strokeWidth={2} />
    <text x={300} y={30} textAnchor="middle" fontSize={14} fontWeight={800} className={TEXT}>inside the chloroplast</text>
    {/* Light reactions */}
    <Arrow x1={40} y1={40} x2={100} y2={110} colour="#eab308" />
    <text x={30} y={34} fontSize={12} fontWeight={700} fill="#ca8a04">light</text>
    {[0, 1, 2, 3].map(i => (
      <rect key={i} x={80} y={120 + i * 16} width={90} height={12} rx={6} fill="#16a34a" opacity={0.6} />
    ))}
    <text x={125} y={208} textAnchor="middle" fontSize={12} fontWeight={700} className={TEXT}>H₂O is split</text>
    <Arrow x1={125} y1={216} x2={125} y2={250} colour="#ef4444" />
    <text x={125} y={268} textAnchor="middle" fontSize={12} fontWeight={700} fill="#ef4444">O₂ leaves</text>
    <Arrow x1={175} y1={150} x2={255} y2={150} colour="#eab308" />
    <text x={215} y={140} textAnchor="middle" fontSize={11} fontWeight={700} fill="#ca8a04">ATP, NADPH</text>
    {/* Calvin cycle */}
    <circle cx={330} cy={170} r={62} fill="none" stroke="#16a34a" strokeWidth={4} strokeDasharray="10 6" />
    <text x={330} y={166} textAnchor="middle" fontSize={13} fontWeight={800} className={TEXT}>Calvin</text>
    <text x={330} y={182} textAnchor="middle" fontSize={13} fontWeight={800} className={TEXT}>cycle</text>
    <Pill x={330} y={78} text="CO₂ in" colour="#0ea5e9" w={70} />
    <Arrow x1={330} y1={90} x2={330} y2={106} colour="#0ea5e9" />
    <Arrow x1={392} y1={180} x2={440} y2={200} colour="#16a34a" />
    <GlucoseRing cx={500} cy={220} t={t} />
    <text x={500} y={292} textAnchor="middle" fontSize={13} fontWeight={800} className={TEXT}>glucose</text>
    <text x={500} y={310} textAnchor="middle" fontSize={11} className={MUTED}>ring: 5 C + 1 O</text>
  </Frame>
);

const DigestionCloseUp: React.FC<CloseUpProps> = ({ t }) => {
  const f = loop(t, 4);
  const gy = lerp(120, 290, Math.min(1, f * 1.4));
  return (
    <Frame label="Close-up of the urchin gut. Enzymes cut laminarin into glucose, using water. Glucose crosses the gut wall into the body fluid.">
      <rect x={0} y={0} width={600} height={195} rx={16} fill="#a16207" opacity={0.08} />
      <rect x={0} y={195} width={600} height={18} fill="#c084fc" opacity={0.5} />
      <text x={20} y={30} fontSize={14} fontWeight={800} className={TEXT}>inside the gut</text>
      <text x={20} y={240} fontSize={14} fontWeight={800} className={TEXT}>urchin body fluid</text>
      <text x={580} y={208} textAnchor="end" fontSize={11} className={MUTED}>gut wall</text>
      {/* Laminarin chain */}
      {[0, 1, 2, 3].map(i => (
        <g key={i}>
          <polygon
            points={Array.from({ length: 6 }, (_, k) => {
              const a = ((-60 + k * 60) * Math.PI) / 180;
              return `${70 + i * 70 + Math.cos(a) * 22},${90 + Math.sin(a) * 22}`;
            }).join(' ')}
            fill="#a16207"
            opacity={0.25}
            stroke="#a16207"
            strokeWidth={2}
          />
          {i < 3 && <line x1={92 + i * 70} y1={90} x2={118 + i * 70} y2={90} stroke="#a16207" strokeWidth={3} />}
        </g>
      ))}
      <text x={175} y={140} textAnchor="middle" fontSize={12} fontWeight={700} className={TEXT}>laminarin (chain of glucose units)</text>
      <Pill x={430} y={70} text="+ H₂O" colour="#0ea5e9" w={70} />
      <ellipse cx={430} cy={120} rx={46} ry={20} fill="#a855f7" opacity={0.2} stroke="#a855f7" />
      <text x={430} y={125} textAnchor="middle" fontSize={11} fontWeight={700} className={TEXT}>enzyme cuts</text>
      <GlucoseRing cx={520} cy={gy} s={22} t={t} />
    </Frame>
  );
};

/**
 * Energy levels for respiration. Breaking bonds takes energy in (up arrow);
 * forming the stronger bonds of CO₂ and H₂O releases more (bigger down arrow).
 */
const RespirationCloseUp: React.FC<CloseUpProps> = ({ t }) => (
  <Frame label="Energy diagram for respiration. Breaking bonds takes energy in. Forming stronger bonds in CO2 and water releases more. The difference goes to ATP and heat.">
    <text x={300} y={28} textAnchor="middle" fontSize={14} fontWeight={800} className={TEXT}>Where the energy comes from</text>
    <line x1={50} y1={50} x2={50} y2={330} stroke="#94a3b8" strokeWidth={1.5} />
    <text x={40} y={190} fontSize={12} fontWeight={700} className={MUTED} transform="rotate(-90 40 190)" textAnchor="middle">chemical energy</text>
    {/* Levels */}
    <line x1={70} y1={70} x2={560} y2={70} stroke="#94a3b8" strokeDasharray="5 4" />
    <text x={315} y={62} textAnchor="middle" fontSize={11} className={MUTED}>all bonds broken (cells never get here in one step)</text>
    <line x1={70} y1={150} x2={190} y2={150} stroke="#0f766e" strokeWidth={5} />
    <text x={130} y={140} textAnchor="middle" fontSize={13} fontWeight={800} className={TEXT}>glucose + 6 O₂</text>
    <line x1={400} y1={290} x2={560} y2={290} stroke="#0f766e" strokeWidth={5} />
    <text x={480} y={280} textAnchor="middle" fontSize={13} fontWeight={800} className={TEXT}>6 CO₂ + 6 H₂O</text>
    <Arrow x1={210} y1={148} x2={210} y2={76} colour="#2563eb" />
    <text x={222} y={112} fontSize={12} fontWeight={700} fill="#2563eb">breaking bonds:</text>
    <text x={222} y={127} fontSize={12} fontWeight={700} fill="#2563eb">energy IN</text>
    <Arrow x1={370} y1={74} x2={370} y2={286} colour="#dc2626" />
    <text x={382} y={160} fontSize={12} fontWeight={700} fill="#dc2626">forming stronger</text>
    <text x={382} y={175} fontSize={12} fontWeight={700} fill="#dc2626">bonds: more OUT</text>
    {/* Net */}
    <line x1={190} y1={150} x2={400} y2={290} stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" />
    <rect x={70} y={250} width={250} height={64} rx={12} fill="#f59e0b" opacity={0.15} stroke="#f59e0b" />
    <text x={195} y={274} textAnchor="middle" fontSize={13} fontWeight={800} className={TEXT}>net energy released</text>
    <text x={195} y={296} textAnchor="middle" fontSize={12} fontWeight={700} className={TEXT}>about ⅓ to ATP, about ⅔ to heat</text>
    <TrackedAtom x={520} y={318} t={t} r={8} label={null} />
    <text x={505} y={322} textAnchor="end" fontSize={11} fontWeight={700} className={TEXT}>your atom, in CO₂</text>
  </Frame>
);

const ReturnCloseUp: React.FC<CloseUpProps> = ({ t }) => {
  const f = loop(t, 4);
  const crossing = f < 0.55;
  return (
    <Frame label="Close-up of a tube foot wall. CO2 diffuses from high concentration inside to low concentration in seawater, where it becomes bicarbonate.">
      <rect x={0} y={0} width={280} height={360} rx={16} fill="#a855f7" opacity={0.1} />
      <rect x={280} y={20} width={14} height={320} rx={6} fill="#a855f7" opacity={0.5} />
      <text x={140} y={36} textAnchor="middle" fontSize={14} fontWeight={800} className={TEXT}>inside the tube foot</text>
      <text x={450} y={36} textAnchor="middle" fontSize={14} fontWeight={800} className={TEXT}>seawater</text>
      <text x={287} y={355} textAnchor="middle" fontSize={11} className={MUTED}>thin wall</text>
      {[[60, 90], [180, 80], [100, 150], [220, 170], [60, 230], [170, 260], [230, 300], [90, 310]].map(([x, y], i) => (
        <Pill key={i} x={x} y={y} text="CO₂" w={52} />
      ))}
      {[[420, 120], [520, 260]].map(([x, y], i) => (
        <Pill key={i} x={x} y={y} text="CO₂" w={52} />
      ))}
      <text x={140} y={340} textAnchor="middle" fontSize={11} fontWeight={700} className={MUTED}>high CO₂</text>
      <text x={450} y={340} textAnchor="middle" fontSize={11} fontWeight={700} className={MUTED}>low CO₂</text>
      <text x={450} y={200} textAnchor="middle" fontSize={12} fontWeight={700} className={TEXT}>CO₂ + H₂O → HCO₃⁻ + H⁺</text>
      <TrackedAtom
        x={crossing ? lerp(150, 380, f / 0.55) : 450}
        y={crossing ? 200 - 40 : lerp(160, 240, (f - 0.55) / 0.45)}
        t={t}
        label={crossing ? 'in CO₂' : 'now in HCO₃⁻'}
      />
    </Frame>
  );
};

const Node: React.FC<{ x: number; y: number; title: string; sub: string }> = ({ x, y, title, sub }) => (
  <g>
    <rect x={x - 70} y={y - 26} width={140} height={52} rx={14} className="fill-white dark:fill-slate-800" stroke="#f59e0b" strokeWidth={2} />
    <text x={x} y={y - 4} textAnchor="middle" fontSize={13} fontWeight={800} className={TEXT}>{title}</text>
    <text x={x} y={y + 14} textAnchor="middle" fontSize={11} className={MUTED}>{sub}</text>
  </g>
);

const BigPictureCloseUp: React.FC<CloseUpProps> = () => (
  <Frame label="Summary diagram. Carbon moves in a loop from seawater to kelp to urchin and back. Energy moves one way, from sunlight to heat.">
    <text x={200} y={30} textAnchor="middle" fontSize={14} fontWeight={800} fill="#d97706">Matter: a loop</text>
    <Node x={200} y={80} title="seawater" sub="HCO₃⁻, CO₂" />
    <Node x={330} y={185} title="kelp" sub="glucose" />
    <Node x={200} y={290} title="urchin" sub="glucose → CO₂" />
    <Node x={70} y={185} title="tube feet" sub="CO₂ diffuses out" />
    <Arrow x1={260} y1={100} x2={318} y2={154} colour="#f59e0b" />
    <Arrow x1={318} y1={214} x2={262} y2={268} colour="#f59e0b" />
    <Arrow x1={140} y1={268} x2={84} y2={214} colour="#f59e0b" />
    <Arrow x1={84} y1={156} x2={140} y2={102} colour="#f59e0b" />
    <text x={500} y={30} textAnchor="middle" fontSize={14} fontWeight={800} fill="#dc2626">Energy: one way</text>
    {['sunlight', 'kelp', 'urchin', 'heat'].map((label, i) => (
      <g key={label}>
        <rect x={445} y={52 + i * 75} width={110} height={40} rx={12} fill={i === 3 ? '#dc2626' : '#f97316'} opacity={0.18} stroke={i === 3 ? '#dc2626' : '#f97316'} />
        <text x={500} y={77 + i * 75} textAnchor="middle" fontSize={13} fontWeight={800} className={TEXT}>{label}</text>
        {i < 3 && <Arrow x1={500} y1={94 + i * 75} x2={500} y2={124 + i * 75} colour="#f97316" />}
      </g>
    ))}
    <text x={500} y={350} textAnchor="middle" fontSize={11} className={MUTED}>heat leaves the forest for good</text>
  </Frame>
);

export const CLOSE_UPS: React.FC<CloseUpProps>[] = [
  SeawaterCloseUp,
  PhotosynthesisCloseUp,
  DigestionCloseUp,
  RespirationCloseUp,
  ReturnCloseUp,
  BigPictureCloseUp,
];
