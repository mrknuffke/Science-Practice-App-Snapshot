/**
 * CreatureIcon: a made-up cartoony "Zygote Bug"
 * Three color variants driven by the `color` prop.
 */

import React from 'react';
import { Genotype, GENOTYPE_COLORS } from './hwConstants';

interface CreatureIconProps {
  genotype: Genotype;
  size?: number;
}

const CreatureIcon: React.FC<CreatureIconProps> = ({ genotype, size = 28 }) => {
  const fill = GENOTYPE_COLORS[genotype];

  // Derive a darker shade for outlines/details by darkening
  const darkFill = fill; // We'll use stroke for outline contrast

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label={`${genotype} organism`}
    >
      {/* ── Antennae ── */}
      {/* Left antenna */}
      <path
        d="M11 10 Q8 5 7 3"
        stroke={fill}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left antenna tip dot */}
      <circle cx="7" cy="3" r="1.5" fill={fill} />
      {/* Right antenna */}
      <path
        d="M21 10 Q24 5 25 3"
        stroke={fill}
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right antenna tip dot */}
      <circle cx="25" cy="3" r="1.5" fill={fill} />

      {/* ── Body (oval) ── */}
      <ellipse
        cx="16"
        cy="19"
        rx="10"
        ry="9"
        fill={fill}
        stroke="white"
        strokeWidth="1.5"
      />

      {/* ── Head (smaller circle, overlapping top of body) ── */}
      <circle
        cx="16"
        cy="11"
        r="6"
        fill={fill}
        stroke="white"
        strokeWidth="1.5"
      />

      {/* ── Eyes (white circles with dark pupils) ── */}
      {/* Left eye */}
      <circle cx="13.5" cy="10" r="2" fill="white" />
      <circle cx="13.8" cy="10.2" r="1" fill="#1e293b" />
      {/* Right eye */}
      <circle cx="18.5" cy="10" r="2" fill="white" />
      <circle cx="18.8" cy="10.2" r="1" fill="#1e293b" />

      {/* ── Smile ── */}
      <path
        d="M13.5 13.5 Q16 15.5 18.5 13.5"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Legs (3 per side, from body) ── */}
      {/* Left side */}
      <line x1="6" y1="16" x2="4" y2="14" stroke={darkFill} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="6" y1="19" x2="3.5" y2="19" stroke={darkFill} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="6" y1="22" x2="4" y2="24" stroke={darkFill} strokeWidth="1.4" strokeLinecap="round" />
      {/* Right side */}
      <line x1="26" y1="16" x2="28" y2="14" stroke={darkFill} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="26" y1="19" x2="28.5" y2="19" stroke={darkFill} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="26" y1="22" x2="28" y2="24" stroke={darkFill} strokeWidth="1.4" strokeLinecap="round" />

      {/* ── Wing spots (subtle pattern to distinguish body) ── */}
      <circle cx="13" cy="20" r="1.5" fill="white" fillOpacity="0.25" />
      <circle cx="19" cy="20" r="1.5" fill="white" fillOpacity="0.25" />
    </svg>
  );
};

export default CreatureIcon;
