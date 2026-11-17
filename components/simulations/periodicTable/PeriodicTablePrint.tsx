import React, { useState } from 'react';
import { Element, PERIODIC_TABLE_ELEMENTS, CATEGORY_COLORS } from './periodicTableData';

type PrintDetail =
  | 'none'
  | 'atomicMass'
  | 'electronegativity'
  | 'ionizationEnergy'
  | 'atomicRadius'
  | 'metallicCharacter'
  | 'nonMetallicCharacter'
  | 'metalReactivity'
  | 'nonMetalReactivity'
  | 'density'
  | 'electronConfigNoble'
  | 'electronConfigFull'
  | 'oxidationStates';

const DETAIL_LABELS: Record<PrintDetail, string> = {
  none: 'None',
  atomicMass: 'Atomic Mass',
  electronegativity: 'Electronegativity',
  ionizationEnergy: 'Ionization Energy',
  atomicRadius: 'Atomic Radius',
  metallicCharacter: 'Metallic Character (0-100)',
  nonMetallicCharacter: 'Non-Metallic Char. (0-100)',
  metalReactivity: 'Metal Reactivity (0-100)',
  nonMetalReactivity: 'Non-Metal Reactivity (0-100)',
  density: 'Density',
  electronConfigNoble: 'Electron Config (Noble)',
  electronConfigFull: 'Electron Config',
  oxidationStates: 'Oxidation States',
};

const getElementDetailValue = (element: Element, detail: PrintDetail) => {
  if (detail === 'none') return '';
  if (detail === 'electronConfigNoble') return element.electronConfiguration || '';
  if (detail === 'electronConfigFull') return element.electronConfiguration || '';
  if (detail === 'oxidationStates' && element.oxidationStates) return element.oxidationStates.join(', ');
  
  const val = element[detail as keyof Element];
  if (val === null || val === undefined) return '-';
  if (typeof val === 'number') {
    if (detail === 'atomicMass') return val.toFixed(3);
    if (detail.includes('Character') || detail.includes('Reactivity')) return `${val.toFixed(1)}`;
    return val.toFixed(2);
  }
  return String(val);
};

export const PeriodicTablePrint: React.FC = () => {
  const [detail1, setDetail1] = useState<PrintDetail>('atomicMass');
  const [detail2, setDetail2] = useState<PrintDetail>('electronConfigNoble');
  const [colorMode, setColorMode] = useState<'color' | 'grayscale' | 'bw'>('color');

  const printDocument = () => {
    window.print();
  };

  const getBorderColor = (category: string) => {
    if (colorMode === 'bw') return '#1e293b';
    if (colorMode === 'grayscale') return '#94a3b8';
    return CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#1e293b';
  };

  const PrintCell = ({ element }: { element: Element }) => {
    const isLanthanide = element.atomicNumber >= 57 && element.atomicNumber <= 71;
    const isActinide = element.atomicNumber >= 89 && element.atomicNumber <= 103;

    const gridCol = isLanthanide ? element.atomicNumber - 53 : isActinide ? element.atomicNumber - 85 : (element.group ? element.group + 1 : 'auto');
    const gridRow = isLanthanide ? 10 : isActinide ? 11 : element.period + 1;

    return (
      <div 
        className="bg-white flex flex-col justify-between p-0.5 relative overflow-hidden"
        style={{
          gridColumn: gridCol,
          gridRow: gridRow,
          border: `1.5px solid ${getBorderColor(element.category)}`,
        }}
      >
        <div className="flex justify-between items-start w-full leading-none mb-0.5">
          <span className="text-[9px] font-bold text-slate-900">{element.atomicNumber}</span>
          <span className="text-[7px] text-slate-800 text-right truncate pl-1">
            {detail1 !== 'none' && getElementDetailValue(element, detail1)}
          </span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center min-h-0">
          <div className="text-lg font-black text-center text-slate-900 leading-none">{element.symbol}</div>
          <div className="text-[6.5px] font-bold text-center text-slate-700 leading-none truncate w-full mt-0.5">{element.name}</div>
        </div>
        {detail2 !== 'none' && (
           <div className="text-[6px] text-slate-600 text-center leading-tight truncate w-full mt-0.5">
             {getElementDetailValue(element, detail2)}
           </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <style>{`
        @media print {
          @page { size: landscape; margin: 0.5cm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          /* Hide standard layout wrappers if they intervene during print */
          header, nav { display: none !important; }
        }
      `}</style>
      
      {/* Settings Panel - Hidden during print */}
      <div className="print:hidden bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-start gap-4">
        <h2 className="text-xl font-black text-slate-800">Print Customizer</h2>
        <div className="flex flex-col md:flex-row gap-4 w-full items-end">
          <div className="flex-1 space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase">Top Right Detail</label>
            <select value={detail1} onChange={e => setDetail1(e.target.value as PrintDetail)} className="w-full p-2 text-sm font-semibold text-slate-800 rounded-lg border border-slate-300 bg-slate-50">
              {Object.entries(DETAIL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase">Bottom Detail</label>
            <select value={detail2} onChange={e => setDetail2(e.target.value as PrintDetail)} className="w-full p-2 text-sm font-semibold text-slate-800 rounded-lg border border-slate-300 bg-slate-50">
              {Object.entries(DETAIL_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </div>
          <div className="flex-1 space-y-1.5">
            <label className="block text-xs font-bold text-slate-500 uppercase">Color Scheme</label>
            <select value={colorMode} onChange={e => setColorMode(e.target.value as typeof colorMode)} className="w-full p-2 text-sm font-semibold text-slate-800 rounded-lg border border-slate-300 bg-slate-50">
              <option value="color">Full Color (Thick Borders)</option>
              <option value="grayscale">Grayscale (Thick Borders)</option>
              <option value="bw">Black & White</option>
            </select>
          </div>
          <div>
            <button onClick={printDocument} className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-lg shadow-md transition-all flex items-center gap-2 h-[38px]">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print A4 Page
            </button>
          </div>
        </div>
      </div>

      {/* Printable Area */}
      <div className="print:fixed print:inset-0 print:m-0 print:p-0 print:z-[9999] bg-white print:bg-white flex justify-center w-full overflow-hidden border border-slate-200 print:border-none shadow-xl print:shadow-none p-4 rounded-xl print:rounded-none min-h-[500px]">
        
        {/* Fill scaling container relative to page/vw */}
        <div className="w-full max-w-[1100px] h-full print:h-[100vh] flex flex-col bg-white print:p-0 p-2">
          
          <div className="flex justify-between items-end mb-2 print:mb-4">
             <h1 className="text-2xl print:text-3xl font-black text-slate-900 tracking-tight">Periodic Table of the Elements</h1>
             <div className="text-[10px] print:text-xs font-bold text-slate-500">
               {detail1 !== 'none' ? `${DETAIL_LABELS[detail1]} (Top Right) ` : ''} 
               {detail1 !== 'none' && detail2 !== 'none' ? ' | ' : ''} 
               {detail2 !== 'none' ? `${DETAIL_LABELS[detail2]} (Bottom)` : ''}
             </div>
          </div>

          <div
            className="grid gap-[2px] w-full flex-1 min-h-[450px]"
            style={{
              gridTemplateColumns: 'minmax(16px, 20px) repeat(18, minmax(0, 1fr))',
              gridTemplateRows: 'minmax(16px, 20px) repeat(7, minmax(0, 1fr)) minmax(8px, 12px) repeat(2, minmax(0, 1fr))',
            }}
          >
            {/* Group Headers */}
            {Array.from({ length: 18 }, (_, i) => i + 1).map(gNum => (
              <div key={`pg-${gNum}`} className="flex items-end justify-center pb-0.5 text-[9px] print:text-[11px] font-black text-slate-800" style={{ gridColumn: gNum + 1, gridRow: 1 }}>{gNum}</div>
            ))}
            
            {/* Period Headers */}
            {Array.from({ length: 7 }, (_, i) => i + 1).map(pNum => (
              <div key={`pp-${pNum}`} className="flex items-center justify-end pr-1.5 text-[9px] print:text-[11px] font-black text-slate-800" style={{ gridColumn: 1, gridRow: pNum + 1 }}>{pNum}</div>
            ))}

            {/* Categories Legend inside empty gap */}
            <div style={{ gridColumn: '4 / 12', gridRow: '2 / 4' }} className="flex items-center pl-4">
               <div className="grid grid-cols-3 gap-x-4 gap-y-1">
                 {Object.entries(CATEGORY_COLORS).map(([cat, _color]) => (
                   <div key={`leg-${cat}`} className="flex items-center gap-1.5">
                     <div className="w-2.5 h-2.5 border-[1.5px] border-slate-800" style={{ borderColor: getBorderColor(cat) }}></div>
                     <span className="text-[8px] print:text-[10px] font-bold text-slate-800 capitalize leading-tight">{cat}</span>
                   </div>
                 ))}
               </div>
            </div>

            {/* F-block Placeholders */}
            <div className="flex items-center justify-center text-[9px] font-bold text-slate-400 border-[1.5px] border-dashed border-slate-300" style={{ gridColumn: 4, gridRow: 7 }}>57-71</div>
            <div className="flex items-center justify-center text-[9px] font-bold text-slate-400 border-[1.5px] border-dashed border-slate-300" style={{ gridColumn: 4, gridRow: 8 }}>89-103</div>

            {/* Elements */}
            {PERIODIC_TABLE_ELEMENTS.map(el => <PrintCell key={el.atomicNumber} element={el} />)}
          </div>
        </div>

      </div>
    </div>
  );
};
