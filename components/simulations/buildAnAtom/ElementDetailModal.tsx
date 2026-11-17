import React, { useState } from 'react';
import { Atom, Sparkles } from 'lucide-react';
import { Element, CATEGORY_COLORS } from '../periodicTable/periodicTableData';
import { BohrModelAtom } from '../periodicTable/BohrModelAtom';
import { LewisDotDiagram } from '../periodicTable/LewisDotDiagram';
import SpectrumDisplay from '../periodicTable/SpectrumDisplay';
import { getIsotopeInfo } from './isotopeData';
import { useDialog } from '../../../hooks/useDialog';

interface ElementDetailModalProps {
  element: Element;
  /** Mass number (A = protons + neutrons) of the currently built isotope, if any. */
  massNumber?: number;
  onClose: () => void;
}

const GROUP_NAMES: Record<number, string> = {
  1: 'Alkali Metals',
  2: 'Alkaline Earth Metals',
  13: 'Boron Family',
  14: 'Carbon Family',
  15: 'Pnictogens (Nitrogen Family)',
  16: 'Chalcogens (Oxygen Family)',
  17: 'Halogens',
  18: 'Noble Gases',
};

const PropertyRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{label}</span>
    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 text-right">{value}</span>
  </div>
);

/**
 * Element detail popup for the Build an Atom sandbox (mirrors the Periodic Table
 * interactive's element modal (property list + Bohr / Lewis / Spectra tabs),
 * reusing the same visual components and data.
 */
const ElementDetailModal: React.FC<ElementDetailModalProps> = ({ element, massNumber, onClose }) => {
  const [modelType, setModelType] = useState<'bohr' | 'lewis' | 'spectra'>('bohr');
  const isotope = massNumber ? getIsotopeInfo(element.atomicNumber, massNumber) : null;

  const dialog = useDialog({ onClose, label: `${element.name} details` });

  const groupLabel = element.group ? GROUP_NAMES[element.group] || `Group ${element.group}` : 'N/A (F-block)';

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        {...dialog}
        className="bg-white dark:bg-[#1A1D26] rounded-3xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto border border-slate-150 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: CATEGORY_COLORS[element.category] }}
            >
              <div className="text-center">
                <div className="text-xs font-bold text-slate-900">{element.atomicNumber}</div>
                <div className="text-3xl font-black text-slate-900">{element.symbol}</div>
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">{element.name}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">{element.category}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl font-semibold text-slate-700 dark:text-slate-200 transition-all"
          >
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Properties */}
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-3">Properties</h3>
            <div className="space-y-1">
              <PropertyRow label="Atomic Mass" value={`${element.atomicMass.toFixed(3)} u`} />
              <PropertyRow label="State at STP" value={element.state} />
              <PropertyRow label="Period" value={element.period.toString()} />
              <PropertyRow label="Group" value={groupLabel} />
              <PropertyRow label="Electron Configuration" value={element.electronConfiguration} />
              <PropertyRow label="Electronegativity" value={element.electronegativity?.toFixed(2) ?? 'N/A'} />
              <PropertyRow label="Ionization Energy" value={element.ionizationEnergy ? `${element.ionizationEnergy} kJ/mol` : 'N/A'} />
              <PropertyRow label="Atomic Radius" value={element.atomicRadius ? `${element.atomicRadius} pm` : 'N/A'} />
              <PropertyRow label="Metallic Character" value={element.metallicCharacter !== null ? `${element.metallicCharacter} / 100` : 'N/A'} />
              <PropertyRow label="Non-Metallic Character" value={element.nonMetallicCharacter !== null ? `${element.nonMetallicCharacter} / 100` : 'N/A'} />
              <PropertyRow label="Metal Reactivity" value={element.metalReactivity !== null ? `${element.metalReactivity} / 100` : 'N/A (Non-metal)'} />
              <PropertyRow label="Non-Metal Reactivity" value={element.nonMetalReactivity !== null ? `${element.nonMetalReactivity} / 100` : 'N/A (Metal / Inert)'} />
              <PropertyRow label="Melting Point" value={element.meltingPoint ? `${element.meltingPoint} K` : 'N/A'} />
              <PropertyRow label="Boiling Point" value={element.boilingPoint ? `${element.boilingPoint} K` : 'N/A'} />

              {isotope && (
                <div className="mt-4 rounded-xl border border-violet-100 dark:border-violet-900/40 bg-violet-50/60 dark:bg-violet-950/20 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-violet-700 dark:text-violet-300">
                      Isotope {element.symbol}-{isotope.massNumber}
                    </span>
                    <span className="text-sm font-black text-violet-800 dark:text-violet-200">
                      {isotope.abundance !== null ? `${isotope.abundance}%` : 'N/A'}
                    </span>
                  </div>
                  <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400 mt-1 leading-snug">
                    {isotope.abundance !== null
                      ? `Natural (terrestrial) abundance of this isotope.`
                      : `Not naturally occurring in meaningful amounts (radioactive, synthetic, or trace).`}
                  </p>
                </div>
              )}

              <div className="pt-4">
                <a
                  href={`https://en.wikipedia.org/wiki/${element.name}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block py-2 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold rounded-lg text-center text-xs transition-colors border border-blue-200 dark:border-blue-900/50"
                >
                  Wikipedia Page
                </a>
              </div>
            </div>
          </div>

          {/* Visual model tabs */}
          <div className="flex flex-col">
            <div className="flex w-full bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-4 shadow-inner">
              {(['bohr', 'lewis', 'spectra'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setModelType(m)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all capitalize ${
                    modelType === m
                      ? 'bg-white dark:bg-slate-900 shadow-sm text-slate-900 dark:text-slate-100'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  {m === 'bohr' ? 'Bohr Model' : m === 'lewis' ? 'Lewis Dot' : 'Spectra'}
                </button>
              ))}
            </div>
            <div className="flex-grow rounded-2xl p-6 flex flex-col items-center justify-center relative shadow-inner bg-slate-900 min-h-[300px]">
              {modelType === 'bohr' && (
                <>
                  <h3 className="absolute top-4 left-4 text-sm font-bold text-slate-400 z-10 flex items-center gap-2">
                    <Atom className="w-4 h-4" /> Electron Shells
                  </h3>
                  <BohrModelAtom element={element} size={260} />
                </>
              )}
              {modelType === 'lewis' && (
                <>
                  <h3 className="absolute top-4 left-4 text-sm font-bold text-slate-400 z-10 flex items-center gap-2">
                    <Atom className="w-4 h-4" /> Valence Electrons
                  </h3>
                  <LewisDotDiagram element={element} size={220} />
                </>
              )}
              {modelType === 'spectra' && (
                <>
                  <h3 className="absolute top-4 left-4 text-sm font-bold text-slate-400 z-10 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Visible Spectrum
                  </h3>
                  <div className="w-full pt-8">
                    <SpectrumDisplay element={element} />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElementDetailModal;
