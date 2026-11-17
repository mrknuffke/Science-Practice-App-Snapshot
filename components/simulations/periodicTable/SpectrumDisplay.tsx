import React from 'react';
import { Element } from './periodicTableData';
import { getEmissionLines, wavelengthToColor, VISIBLE_MIN, VISIBLE_MAX } from './spectraData';

interface SpectrumDisplayProps {
  element: Element;
}

const VIEWBOX_W = 360;
const VIEWBOX_H = 190;
const PAD_LEFT = 12;
const PAD_RIGHT = 12;
const PLOT_W = VIEWBOX_W - PAD_LEFT - PAD_RIGHT;
const STRIP_H = 28;
const EMISSION_Y = 26;
const ABSORPTION_Y = EMISSION_Y + STRIP_H + 26;
const AXIS_Y = ABSORPTION_Y + STRIP_H + 18;

const wavelengthToX = (nm: number): number =>
  PAD_LEFT + ((nm - VISIBLE_MIN) / (VISIBLE_MAX - VISIBLE_MIN)) * PLOT_W;

const AXIS_TICKS = [400, 450, 500, 550, 600, 650, 700];
const GRADIENT_ID_PREFIX = 'spectrum-absorption-gradient';

export const SpectrumDisplay: React.FC<SpectrumDisplayProps> = ({ element }) => {
  const lines = getEmissionLines(element.atomicNumber);
  const gradientId = `${GRADIENT_ID_PREFIX}-${element.atomicNumber}`;

  // Build gradient stops by sampling the visible spectrum every ~5 nm
  const gradientStops: { offset: number; color: string }[] = [];
  for (let nm = VISIBLE_MIN; nm <= VISIBLE_MAX; nm += 5) {
    gradientStops.push({
      offset: (nm - VISIBLE_MIN) / (VISIBLE_MAX - VISIBLE_MIN),
      color: wavelengthToColor(nm),
    });
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-slate-900 rounded-xl p-6 shadow-inner text-center" style={{ width: '100%', minHeight: 190 }}>
        <p className="text-sm text-slate-300 font-semibold">
          No visible-light emission lines on record for {element.name}.
        </p>
        <p className="text-xs text-slate-500 mt-2 max-w-xs">
          Spectra for synthetic or extremely short-lived elements are not well characterized in the visible range.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-slate-900 rounded-xl p-4 shadow-inner" style={{ width: '100%' }}>
      <svg width="100%" viewBox={`0 0 ${VIEWBOX_W} ${VIEWBOX_H}`} role="img" aria-label={`Visible emission and absorption spectrum of ${element.name}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            {gradientStops.map((stop, i) => (
              <stop key={i} offset={stop.offset} stopColor={stop.color} />
            ))}
          </linearGradient>
        </defs>

        {/* Emission label */}
        <text x={PAD_LEFT} y={EMISSION_Y - 8} fontSize="9" fontWeight="bold" fill="#94a3b8" className="font-sans">
          EMISSION
        </text>

        {/* Emission strip: black background with bright lines */}
        <rect x={PAD_LEFT} y={EMISSION_Y} width={PLOT_W} height={STRIP_H} fill="#000" stroke="#475569" strokeWidth="1" />
        {lines.map((line, i) => (
          <g key={`emission-${i}`}>
            <title>{`${line.wavelength.toFixed(1)} nm`}</title>
            <line
              x1={wavelengthToX(line.wavelength)}
              x2={wavelengthToX(line.wavelength)}
              y1={EMISSION_Y}
              y2={EMISSION_Y + STRIP_H}
              stroke={wavelengthToColor(line.wavelength)}
              strokeWidth={1.75}
              opacity={0.45 + 0.55 * (line.intensity ?? 1)}
            />
          </g>
        ))}

        {/* Absorption label */}
        <text x={PAD_LEFT} y={ABSORPTION_Y - 8} fontSize="9" fontWeight="bold" fill="#94a3b8" className="font-sans">
          ABSORPTION
        </text>

        {/* Absorption strip: rainbow background with dark lines */}
        <rect x={PAD_LEFT} y={ABSORPTION_Y} width={PLOT_W} height={STRIP_H} fill={`url(#${gradientId})`} stroke="#475569" strokeWidth="1" />
        {lines.map((line, i) => (
          <g key={`absorption-${i}`}>
            <title>{`${line.wavelength.toFixed(1)} nm`}</title>
            <line
              x1={wavelengthToX(line.wavelength)}
              x2={wavelengthToX(line.wavelength)}
              y1={ABSORPTION_Y}
              y2={ABSORPTION_Y + STRIP_H}
              stroke="#000"
              strokeWidth={2}
            />
          </g>
        ))}

        {/* Shared wavelength axis */}
        <line x1={PAD_LEFT} x2={PAD_LEFT + PLOT_W} y1={AXIS_Y} y2={AXIS_Y} stroke="#64748b" strokeWidth="1" />
        {AXIS_TICKS.map((nm) => (
          <g key={`tick-${nm}`}>
            <line x1={wavelengthToX(nm)} x2={wavelengthToX(nm)} y1={AXIS_Y} y2={AXIS_Y + 4} stroke="#64748b" strokeWidth="1" />
            <text x={wavelengthToX(nm)} y={AXIS_Y + 15} fontSize="8" fill="#94a3b8" textAnchor="middle" className="font-mono">
              {nm}
            </text>
          </g>
        ))}
        <text x={VIEWBOX_W / 2} y={VIEWBOX_H - 4} fontSize="8.5" fill="#64748b" textAnchor="middle" className="font-sans">
          Wavelength (nm)
        </text>
      </svg>
      <div className="mt-2 text-[10px] text-slate-500 text-center leading-snug">
        Strongest visible-range lines, 380 to 700 nm (NIST Atomic Spectra Database).
      </div>
    </div>
  );
};

export default SpectrumDisplay;
