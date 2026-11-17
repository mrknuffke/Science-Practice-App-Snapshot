import React, { useState, useMemo, useRef, useCallback } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ZAxis, type TooltipContentProps } from 'recharts';
import { Info } from 'lucide-react';
import { Element, PERIODIC_TABLE_ELEMENTS, CATEGORY_COLORS } from './periodicTableData';
import type { ElementCategory } from './periodicTableData';

type AxisProperty =
  | 'atomicNumber'
  | 'atomicMass'
  | 'electronegativity'
  | 'ionizationEnergy'
  | 'atomicRadius'
  | 'density'
  | 'meltingPoint'
  | 'boilingPoint'
  | 'metallicCharacter'
  | 'nonMetallicCharacter'
  | 'metalReactivity'
  | 'nonMetalReactivity';

type ColorMode = 'category' | 'state' | 'group' | 'period';

const PROPERTY_LABELS: Record<AxisProperty, string> = {
  atomicNumber: 'Atomic Number',
  atomicMass: 'Atomic Mass (u)',
  electronegativity: 'Electronegativity (Pauling)',
  ionizationEnergy: 'Ionization Energy (kJ/mol)',
  atomicRadius: 'Atomic Radius (pm)',
  density: 'Density (g/cm³)',
  meltingPoint: 'Melting Point (K)',
  boilingPoint: 'Boiling Point (K)',
  metallicCharacter: 'Metallic Character (Index 0-100)',
  nonMetallicCharacter: 'Non-Metallic Character (Index 0-100)',
  metalReactivity: 'Metal Reactivity (Index 0-100)',
  nonMetalReactivity: 'Non-Metal Reactivity (Index 0-100)',
};

const INDEX_PROPERTY_EXPLANATIONS: Partial<Record<AxisProperty, { title: string; explanation: string; why: string }>> = {
  metallicCharacter: {
    title: 'Metallic Character Index (0-100)',
    explanation: 'Quantifies an atom\'s tendency to lose electrons (electropositivity). Scaled from 0 (lowest, Fluorine/Helium) to 100 (highest, Francium/Cesium) based on electronegativity and ionization energy.',
    why: 'Metallic character increases down a group (valence electrons are farther from the nucleus and shielded) and decreases across a period (increasing effective nuclear charge holds electrons more tightly).'
  },
  nonMetallicCharacter: {
    title: 'Non-Metallic Character Index (0-100)',
    explanation: 'Quantifies an atom\'s tendency to gain electrons and form negative ions or covalent bonds. Scaled from 0 (Francium/Cesium & noble gases) to 100 (Fluorine) based on electronegativity and ionization energy.',
    why: 'Non-metallic character increases up a group and to the right across a period, peaking at Fluorine and the upper halogens (strongest pull on additional valence electrons).'
  },
  metalReactivity: {
    title: 'Metal Reactivity Index (0-100)',
    explanation: 'Quantifies chemical reactivity for metals based on ionization energy and the canonical chemical Activity Series. Group 1 alkali metals are highest (Fr 100 > Cs > Rb > K > Na > Li), followed by Group 2, active transition metals, down to noble metals (Au, Pt).',
    why: 'Only metals have defined metal reactivity; non-metals and noble gases are omitted (see the Excluded count in the legend). Metals react by losing electrons, so lower ionization energy directly increases reactivity.'
  },
  nonMetalReactivity: {
    title: 'Non-Metal Reactivity Index (0-100)',
    explanation: 'Quantifies chemical reactivity for non-metals. Halogens are highest (F 100 > Cl > Br > I), followed by reactive chalcogens (O, S), pnictogens (N, P), and C/H. Noble gases (chemically inert) and metals are omitted.',
    why: 'Only reactive non-metals are plotted (metals and noble gases are omitted). Non-metals react by gaining/sharing electrons, so higher electronegativity and smaller atomic size increase reactivity.'
  }
};

const STATE_COLORS: Record<string, string> = {
  solid: '#3B82F6',
  liquid: '#F59E0B',
  gas: '#EF4444',
  unknown: '#94a3b8',
};

// 18 visually distinct group colors
const GROUP_COLORS: Record<number, string> = {
  1: '#EF4444', 2: '#F97316', 3: '#EAB308', 4: '#84CC16', 5: '#22C55E',
  6: '#10B981', 7: '#06B6D4', 8: '#3B82F6', 9: '#6366F1', 10: '#8B5CF6',
  11: '#A855F7', 12: '#EC4899', 13: '#F43F5E', 14: '#14B8A6', 15: '#64748B',
  16: '#78716C', 17: '#D946EF', 18: '#0EA5E9',
};

// 7 period colors (warm → cool progression)
const PERIOD_COLORS: Record<number, string> = {
  1: '#EF4444', 2: '#F97316', 3: '#EAB308', 4: '#22C55E',
  5: '#3B82F6', 6: '#8B5CF6', 7: '#EC4899',
};

interface PeriodicTableGraphProps {
  selectedCategories: string[];
  selectedGroups: number[];
  elementFilter?: string; // e.g. 'metals', 'nonmetals', 'all'
  filteredElements?: { atomicNumber: number }[];
}

export const PeriodicTableGraph: React.FC<PeriodicTableGraphProps> = ({ selectedCategories, selectedGroups, elementFilter = 'all', filteredElements }) => {
  const [xAxisProp, setXAxisProp] = useState<AxisProperty>('atomicNumber');
  const [yAxisProp, setYAxisProp] = useState<AxisProperty>('atomicRadius');
  const [colorBy, setColorBy] = useState<ColorMode>('category');
  const [filterState, setFilterState] = useState<'all' | 'solid' | 'liquid' | 'gas' | 'unknown'>('all');
  const [localGroups, setLocalGroups] = useState<number[]>([]);
  const [localPeriods, setLocalPeriods] = useState<number[]>([]);

  const printRef = useRef<HTMLDivElement>(null);

  const toggleGroup = (g: number) =>
    setLocalGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
  const togglePeriod = (p: number) =>
    setLocalPeriods(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);

  const activeIndexNotes = useMemo(() => {
    const notes: { key: string; title: string; explanation: string; why: string }[] = [];
    const xInfo = INDEX_PROPERTY_EXPLANATIONS[xAxisProp];
    const yInfo = INDEX_PROPERTY_EXPLANATIONS[yAxisProp];
    if (xInfo) notes.push({ key: xAxisProp, ...xInfo });
    if (yInfo && yAxisProp !== xAxisProp) notes.push({ key: yAxisProp, ...yInfo });
    return notes;
  }, [xAxisProp, yAxisProp]);

  const getElementColor = useCallback((el: Element): string => {
    switch (colorBy) {
      case 'category': return CATEGORY_COLORS[el.category as ElementCategory] || '#cbd5e1';
      case 'state': return STATE_COLORS[el.state] || '#94a3b8';
      case 'group': return el.group ? (GROUP_COLORS[el.group] || '#cbd5e1') : '#cbd5e1';
      case 'period': return PERIOD_COLORS[el.period] || '#cbd5e1';
    }
  }, [colorBy]);

  const processedData = useMemo(() => {
    const missingElements: { symbol: string; name: string }[] = [];
    const finalData = PERIODIC_TABLE_ELEMENTS
      .filter(el => {
        // Global filters
        if (selectedCategories.length > 0 && !selectedCategories.includes(el.category)) return false;
        if (selectedGroups.length > 0 && !(el.group !== null && selectedGroups.includes(el.group))) return false;
        // Legacy element filter from sidebar (metals/nonmetals/solids etc.)
        if (elementFilter && elementFilter !== 'all' && filteredElements) {
          if (!filteredElements.some(fe => fe.atomicNumber === el.atomicNumber)) return false;
        }
        // Local filters
        if (filterState !== 'all' && el.state !== filterState) return false;
        if (localGroups.length > 0 && (el.group === null || !localGroups.includes(el.group))) return false;
        if (localPeriods.length > 0 && !localPeriods.includes(el.period)) return false;
        // Data completeness: only filter out null/undefined, NOT zero
        const xVal = el[xAxisProp];
        const yVal = el[yAxisProp];
        if (xVal === null || xVal === undefined || yVal === null || yVal === undefined) {
          missingElements.push({ symbol: el.symbol, name: el.name });
          return false;
        }
        return true;
      })
      .map(el => ({
        ...el,
        x: el[xAxisProp] as number, // the filter above drops elements missing either value
        y: el[yAxisProp] as number,
        fillColor: getElementColor(el),
      }));
    return { data: finalData, missingElements };
  }, [xAxisProp, yAxisProp, getElementColor, filterState, localGroups, localPeriods, selectedCategories, selectedGroups, elementFilter, filteredElements]);

  const { data, missingElements } = processedData;
  const missingCount = missingElements.length;

  // Build legend items for current color mode
  const legendItems: { label: string; color: string }[] = useMemo(() => {
    if (colorBy === 'state') {
      const seen = new Set<string>(data.map(d => d.state));
      return Object.entries(STATE_COLORS)
        .filter(([s]) => seen.has(s))
        .map(([s, c]) => ({ label: s.charAt(0).toUpperCase() + s.slice(1), color: c }));
    } else if (colorBy === 'group') {
      const seen = new Set(data.map(d => d.group).filter(Boolean) as number[]);
      return Array.from(seen).sort((a, b) => a - b)
        .map(g => ({ label: `Group ${g}`, color: GROUP_COLORS[g] || '#cbd5e1' }));
    } else if (colorBy === 'period') {
      const seen = new Set(data.map(d => d.period));
      return Array.from(seen).sort((a, b) => a - b)
        .map(p => ({ label: `Period ${p}`, color: PERIOD_COLORS[p] || '#cbd5e1' }));
    } else {
      const seen = new Set(data.map(d => d.category));
      return Object.entries(CATEGORY_COLORS)
        .filter(([cat]) => seen.has(cat as ElementCategory))
        .map(([cat, c]) => ({ label: cat, color: c }));
    }
  }, [colorBy, data]);

  const handlePrint = () => {
    const title = `${PROPERTY_LABELS[yAxisProp]} vs ${PROPERTY_LABELS[xAxisProp]}`;
    const legendHtml = legendItems.map(item =>
      `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
        <div style="width:10px;height:10px;border-radius:50%;background:${item.color};flex-shrink:0;"></div>
        <span style="font-size:11px;font-family:sans-serif;text-transform:capitalize;">${item.label}</span>
      </div>`
    ).join('');
    const chartEl = printRef.current?.querySelector('.recharts-responsive-container');
    const svgEl = chartEl?.querySelector('svg');
    if (!svgEl) return;
    const svgClone = svgEl.cloneNode(true) as SVGElement;
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const svgString = new XMLSerializer().serializeToString(svgClone);
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) return;
    printWindow.document.write(`
      <!DOCTYPE html><html><head><title>${title}</title>
      <style>
        body { font-family: sans-serif; padding: 24px; display:flex; flex-direction:column; gap:16px; }
        h1 { font-size:18px; margin:0; }
        .layout { display:flex; gap:24px; align-items:flex-start; }
        .legend { min-width:160px; border:1px solid #e2e8f0; padding:12px; border-radius:8px; }
        .legend h2 { font-size:12px; text-transform:uppercase; color:#64748b; margin:0 0 10px 0; }
        @media print { body { padding:8px; } }
      </style></head><body>
      <h1>${title}</h1>
      <div class="layout">
        <div>${svgString}</div>
        <div class="legend">
          <h2>${colorBy === 'category' ? 'Category' : colorBy === 'state' ? 'State at STP' : colorBy === 'group' ? 'Group' : 'Period'}</h2>
          ${legendHtml}
          <p style="font-size:10px;color:#94a3b8;margin-top:12px;">${data.length} elements plotted${missingCount > 0 ? `, ${missingCount} excluded (no data)` : ''}</p>
        </div>
      </div>
      <script>window.onload=()=>{ window.print(); }</script>
      </body></html>`);
    printWindow.document.close();
  };

  const CustomTooltip = ({ active, payload }: Partial<TooltipContentProps<number, string>>) => {
    if (!active || !payload || !payload.length) return null;
    const p = payload[0].payload;
    return (
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '6px 10px', pointerEvents: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, fontWeight: 900, color: '#fff', fontSize: 13 }}>
          <span style={{ color: p.fillColor, fontWeight: 900 }}>{p.symbol}</span>
          <span>{p.name}</span>
          <span style={{ color: '#64748b', fontWeight: 400, fontSize: 11 }}>#{p.atomicNumber}</span>
        </div>
        <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>
          <div><span style={{ color: '#64748b' }}>{PROPERTY_LABELS[xAxisProp]}:</span> {p.x}</div>
          <div><span style={{ color: '#64748b' }}>{PROPERTY_LABELS[yAxisProp]}:</span> {p.y}</div>
          <div style={{ textTransform: 'capitalize' }}><span style={{ color: '#64748b' }}>Category:</span> {p.category}</div>
        </div>
      </div>
    );
  };

  const chipBase = "px-2 py-0.5 rounded text-[11px] font-bold border cursor-pointer transition-all select-none";
  const chipActive = "bg-violet-600 text-white border-violet-600 shadow-sm";
  const chipInactive = "bg-white text-slate-600 border-slate-300 hover:bg-slate-50";

  const COLOR_BY_OPTIONS: { value: ColorMode; label: string }[] = [
    { value: 'category', label: 'Category' },
    { value: 'state', label: 'State' },
    { value: 'group', label: 'Group' },
    { value: 'period', label: 'Period' },
  ];

  return (
    <div className="w-full flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 relative">

      {/* Top Controls Row */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">X-Axis</label>
          <select aria-label="X-Axis" value={xAxisProp} onChange={e => setXAxisProp(e.target.value as AxisProperty)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500">
            {Object.entries(PROPERTY_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Y-Axis</label>
          <select aria-label="Y-Axis" value={yAxisProp} onChange={e => setYAxisProp(e.target.value as AxisProperty)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500">
            {Object.entries(PROPERTY_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </select>
        </div>
        <div className="w-32">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">State</label>
          <select aria-label="State" value={filterState} onChange={e => setFilterState(e.target.value as typeof filterState)}
            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500">
            <option value="all">All</option>
            <option value="solid">Solid</option>
            <option value="liquid">Liquid</option>
            <option value="gas">Gas</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Color By</label>
          <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
            {COLOR_BY_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setColorBy(opt.value)}
                className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all whitespace-nowrap ${colorBy === opt.value ? 'bg-white shadow-sm text-violet-700' : 'text-slate-500 hover:text-slate-700'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-end">
          <button onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2h10z" />
            </svg>
            Print
          </button>
        </div>
      </div>

      {/* Explanatory Note Callout Banner for Trend Indices */}
      {activeIndexNotes.length > 0 && (
        <div className="flex flex-col gap-2.5 p-3.5 bg-gradient-to-r from-violet-50 via-purple-50 to-indigo-50/70 border border-violet-200 rounded-xl shadow-xs animate-in fade-in duration-200">
          {activeIndexNotes.map(note => (
            <div key={note.key} className="flex items-start gap-2.5 text-xs">
              <div className="w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                <Info className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-violet-900 flex items-center gap-2">
                  <span>{note.title}</span>
                  <span className="text-[9.5px] uppercase font-mono px-1.5 py-0.5 bg-violet-200/70 text-violet-800 rounded font-bold tracking-wider">Trend Index</span>
                </div>
                <p className="text-slate-700 mt-0.5 leading-relaxed">{note.explanation}</p>
                <p className="text-violet-800 font-medium mt-1 leading-relaxed"><strong className="text-violet-950">Why this trend exists:</strong> {note.why}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Group/Period Multi-Select Chips */}
      <div className="flex flex-col sm:flex-row gap-4 pb-3 border-b border-slate-100">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Groups</label>
            {localGroups.length > 0 && <button onClick={() => setLocalGroups([])} className="text-[10px] font-bold text-violet-600 hover:text-violet-800">Clear</button>}
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 18 }, (_, i) => i + 1).map(g => (
              <button key={`g${g}`} onClick={() => toggleGroup(g)} className={`${chipBase} ${localGroups.includes(g) ? chipActive : chipInactive}`}>{g}</button>
            ))}
          </div>
        </div>
        <div className="shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Periods</label>
            {localPeriods.length > 0 && <button onClick={() => setLocalPeriods([])} className="text-[10px] font-bold text-violet-600 hover:text-violet-800">Clear</button>}
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: 7 }, (_, i) => i + 1).map(p => (
              <button key={`p${p}`} onClick={() => togglePeriod(p)} className={`${chipBase} ${localPeriods.includes(p) ? chipActive : chipInactive}`}>{p}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart + Legend */}
      <div ref={printRef} className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 bg-slate-50 rounded-xl border border-slate-200 p-2 sm:p-4" style={{ minHeight: 440 }}>
          {data.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-slate-400 font-semibold flex-col gap-2" style={{ minHeight: 400 }}>
              <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              No valid data for these filters/axes
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={440}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 50, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" dataKey="x" name={PROPERTY_LABELS[xAxisProp]}
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  tickLine={{ stroke: '#cbd5e1' }} axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                  label={{ value: PROPERTY_LABELS[xAxisProp], position: 'insideBottom', offset: -25, fill: '#475569', fontSize: 12, fontWeight: 'bold' }} />
                <YAxis type="number" dataKey="y" name={PROPERTY_LABELS[yAxisProp]}
                  domain={['auto', 'auto']}
                  tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
                  tickLine={{ stroke: '#cbd5e1' }} axisLine={{ stroke: '#cbd5e1', strokeWidth: 2 }}
                  label={{ value: PROPERTY_LABELS[yAxisProp], angle: -90, position: 'insideLeft', offset: 10, fill: '#475569', fontSize: 12, fontWeight: 'bold', style: { textAnchor: 'middle' } }} />
                <ZAxis type="number" range={[50, 50]} />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }}
                  isAnimationActive={false}
                  allowEscapeViewBox={{ x: true, y: true }}
                />
                <Scatter data={data} shape="circle" isAnimationActive={false}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fillColor} stroke="#fff" strokeWidth={1.5} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend Panel */}
        <div className="lg:w-52 shrink-0">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h4 className="text-xs font-black text-slate-600 uppercase tracking-wider mb-3">
              {{ category: 'Category', state: 'State at STP', group: 'Group', period: 'Period' }[colorBy]}
            </h4>
            <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
              {legendItems.map(({ label, color }) => (
                <div key={label} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0 border border-white shadow-sm" style={{ backgroundColor: color }} />
                  <span className="text-[11px] font-semibold text-slate-700 capitalize leading-tight">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-200 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Plotted</span>
                <span className="font-bold text-slate-700">{data.length}</span>
              </div>
              {missingCount > 0 && (
                <div className="relative group">
                  <div className="flex justify-between text-xs cursor-help">
                    <span className="text-amber-600 underline decoration-dotted">No data ↗</span>
                    <span className="font-bold text-amber-700">{missingCount}</span>
                  </div>
                  {/* Hover popover listing missing elements */}
                  <div className="absolute bottom-full right-0 mb-1.5 w-52 bg-slate-800 text-white text-[10px] rounded-lg p-2.5 shadow-xl z-50
                    opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150">
                    <p className="font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[9px]">Missing {missingCount} element{missingCount !== 1 ? 's' : ''}:</p>
                    <div className="flex flex-wrap gap-1">
                      {missingElements.map(el => (
                        <span key={el.symbol}
                          className="px-1 py-0.5 bg-slate-700 rounded text-slate-200 font-bold"
                          title={el.name}>
                          {el.symbol}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {(localGroups.length > 0 || localPeriods.length > 0) && (
              <button onClick={() => { setLocalGroups([]); setLocalPeriods([]); }}
                className="mt-3 w-full py-1.5 text-[11px] font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 border border-violet-200 rounded-lg transition-all">
                Clear Local Filters
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
