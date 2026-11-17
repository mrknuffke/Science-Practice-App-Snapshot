import React from 'react';

interface TrackedAtomProps {
  x: number;
  y: number;
  t: number;
  r?: number;
  label?: string | null;
}

/** The gold carbon atom the student follows. Same look in every view. */
const TrackedAtom: React.FC<TrackedAtomProps> = ({ x, y, t, r = 10, label = 'your carbon atom' }) => {
  const pulse = 1 + Math.sin(t * 4) * 0.15;
  return (
    <g>
      <circle cx={x} cy={y} r={(r + 7) * pulse} fill="none" stroke="#f59e0b" strokeWidth={2} opacity={0.7} />
      <circle cx={x} cy={y} r={r} fill="#fbbf24" stroke="#b45309" strokeWidth={2} />
      <text x={x} y={y + 4} textAnchor="middle" fontSize={r * 1.1} fontWeight={800} fill="#1c1917">C</text>
      {label && (
        <g>
          <rect x={x - 70} y={y - r - 32} width={140} height={24} rx={12} fill="#1c1917" opacity={0.85} />
          <text x={x} y={y - r - 15} textAnchor="middle" fontSize={14} fontWeight={700} fill="#fde68a">{label}</text>
        </g>
      )}
    </g>
  );
};

export default TrackedAtom;
