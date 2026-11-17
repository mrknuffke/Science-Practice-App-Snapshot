/**
 * Enhanced Interactive Periodic Table
 * Features inspired by periodex.co and ptable.com
 * - Temperature slider for state visualization
 * - Search and comparison modes
 * - Detailed property views
 * - Electron shell visualization
 * - Multiple view modes (standard, wide, electron shells)
 */

import React, { useState, useMemo } from 'react';
import { Sparkles, Search, Thermometer, Scale, Zap, ArrowLeft, Atom, HelpCircle, Trophy } from 'lucide-react';
import AboutPanel from '../shared/AboutPanel';
import ChallengeDeck from '../shared/ChallengeDeck';
import { PERIODIC_TABLE_ABOUT } from './periodicTableAbout';
import {
  PERIODIC_TABLE_CHALLENGES,
  verifyPeriodicTableChallenge,
  applyPeriodicTableChallengeSolution,
} from './periodicTableChallenges';
import type { CourseType } from '../../../types';
import { Element, ElementCategory, PERIODIC_TABLE_ELEMENTS, CATEGORY_COLORS } from './periodicTableData';
import { BohrModelAtom } from './BohrModelAtom';
import { LewisDotDiagram } from './LewisDotDiagram';
import { SpectrumDisplay } from './SpectrumDisplay';
import { PeriodicTableGraph } from './PeriodicTableGraph';
import { PeriodicTablePrint } from './PeriodicTablePrint';
import { useDialog } from '../../../hooks/useDialog';

interface PeriodicTableViewProps {
  course: CourseType;
  onBack: () => void;
}

type FilterType = 'all' | 'metals' | 'nonmetals' | 'metalloids' | 'solids' | 'liquids' | 'gases';
type ViewMode = 'standard' | 'temperature' | 'property' | 'graph' | 'print';
type PropertyMode =
  | 'none'
  | 'atomic_radius'
  | 'electronegativity'
  | 'ionization_energy'
  | 'metallic_character'
  | 'non_metallic_character'
  | 'metal_reactivity'
  | 'non_metal_reactivity'
  | 'electron_affinity'
  | 'density'
  | 'melting_point'
  | 'boiling_point';

const PeriodicTableView: React.FC<PeriodicTableViewProps> = ({ course: _course, onBack }) => {
  const [selectedElement, setSelectedElement] = useState<Element | null>(null);
  const elementDialog = useDialog({ onClose: () => { setSelectedElement(null); setComparisonElement(null); }, label: 'Element details', open: selectedElement !== null });
  const [hoveredElement, setHoveredElement] = useState<Element | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedCategories, setSelectedCategories] = useState<ElementCategory[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('standard');
  const [propertyMode, setPropertyMode] = useState<PropertyMode>('none');
  const [temperature, setTemperature] = useState(298); // Kelvin (25°C / 77°F)
  const [searchQuery, setSearchQuery] = useState('');
  const [_showLegend, _setShowLegend] = useState(true);
  const [selectedGroups, setSelectedGroups] = useState<number[]>([]);
  const [comparisonElement, setComparisonElement] = useState<Element | null>(null);
  const [modelType, setModelType] = useState<'bohr' | 'lewis' | 'spectra'>('bohr');
  const [showLanthanides, setShowLanthanides] = useState(true);
  const [showActinides, setShowActinides] = useState(true);
  const [electronConfigMode, setElectronConfigMode] = useState<'noble' | 'full'>('noble');
  const [showAbout, setShowAbout] = useState(false);
  const [challengeMode, setChallengeMode] = useState(false);
  const [challengeIdx, setChallengeIdx] = useState(0);

  const handleApplyChallenge = (idx: number) => {
    const ch = PERIODIC_TABLE_CHALLENGES[idx];
    if (!ch) return;
    const el = ch.start.atomicNumber
      ? PERIODIC_TABLE_ELEMENTS.find(e => e.atomicNumber === ch.start.atomicNumber) ?? null
      : null;
    setSelectedElement(el);
    setPropertyMode(ch.start.propertyMode);
    setViewMode(ch.start.viewMode);
    setTemperature(ch.start.temperature);
  };

  const handleVerifyChallenge = () => {
    const ch = PERIODIC_TABLE_CHALLENGES[challengeIdx];
    if (!ch) return { success: false, message: 'Select a challenge' };
    return verifyPeriodicTableChallenge(ch.id, {
      selectedElement,
      propertyMode,
      viewMode,
      temperature,
    });
  };

  const handleApplySolution = (idx: number) => {
    const ch = PERIODIC_TABLE_CHALLENGES[idx];
    if (!ch) return;
    applyPeriodicTableChallengeSolution(
      ch,
      setSelectedElement,
      setPropertyMode,
      setViewMode,
      setTemperature
    );
  };

  // Electron layout expander
  const expandElectronConfiguration = (shorthand: string): string => {
    const nobleGases = {
      '[He]': '1s²',
      '[Ne]': '1s² 2s² 2p⁶',
      '[Ar]': '1s² 2s² 2p⁶ 3s² 3p⁶',
      '[Kr]': '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰ 4p⁶',
      '[Xe]': '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰ 4p⁶ 5s² 4d¹⁰ 5p⁶',
      '[Rn]': '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰ 4p⁶ 5s² 4d¹⁰ 5p⁶ 6s² 4f¹⁴ 5d¹⁰ 6p⁶',
      '[Uuo]': '1s² 2s² 2p⁶ 3s² 3p⁶ 4s² 3d¹⁰ 4p⁶ 5s² 4d¹⁰ 5p⁶ 6s² 4f¹⁴ 5d¹⁰ 6p⁶ 7s² 5f¹⁴ 6d¹⁰ 7p⁶'
    };
    let expanded = shorthand;
    for (const [gas, config] of Object.entries(nobleGases)) {
      if (expanded.includes(gas)) {
        expanded = expanded.replace(gas, config);
        break;
      }
    }
    return expanded;
  };

  const getGroupName = (group: number | null): string => {
    if (group === null) return '';
    const names: Record<number, string> = {
      1: 'Alkali Metals',
      2: 'Alkaline Earth Metals',
      3: 'Scandium Group',
      4: 'Titanium Group',
      5: 'Vanadium Group',
      6: 'Chromium Group',
      7: 'Manganese Group',
      8: 'Iron Group',
      9: 'Cobalt Group',
      10: 'Nickel Group',
      11: 'Coinage Metals',
      12: 'Volatile Metals',
      13: 'Icosagens (Boron Family)',
      14: 'Crystallogens (Carbon Family)',
      15: 'Pnictogens (Nitrogen Family)',
      16: 'Chalcogens (Oxygen Family)',
      17: 'Halogens',
      18: 'Noble Gases'
    };
    return names[group] || '';
  };

  const getGroupShortName = (group: number): string => {
    const shortNames: Record<number, string> = {
      1: 'Alkali',
      2: 'Alkaline',
      11: 'Coinage',
      12: 'Volatile',
      13: 'Icosagens',
      14: 'Crystallo.',
      15: 'Pnictogens',
      16: 'Chalcogens',
      17: 'Halogens',
      18: 'Noble Gases'
    };
    return shortNames[group] || '';
  };

  // Temperature conversion helpers
  const kelvinToCelsius = (k: number) => k - 273.15;
  const kelvinToFahrenheit = (k: number) => (k - 273.15) * 9/5 + 32;

  // Determine element state at current temperature
  const getStateAtTemperature = (element: Element): 'solid' | 'liquid' | 'gas' | 'unknown' => {
    if (!element.meltingPoint || !element.boilingPoint) return 'unknown';

    if (temperature < element.meltingPoint) return 'solid';
    if (temperature >= element.meltingPoint && temperature < element.boilingPoint) return 'liquid';
    return 'gas';
  };

  // Filter elements based on search query
  const searchFilteredElements = useMemo(() => {
    if (!searchQuery) return PERIODIC_TABLE_ELEMENTS;

    const query = searchQuery.toLowerCase();
    return PERIODIC_TABLE_ELEMENTS.filter(el =>
      el.name.toLowerCase().includes(query) ||
      el.symbol.toLowerCase().includes(query) ||
      el.atomicNumber.toString() === query
    );
  }, [searchQuery]);

  // Filter elements based on selected filter and search
  const getFilteredElements = (): Element[] => {
    let filtered = searchFilteredElements;

    if (viewMode === 'temperature') {
      // Filter by state at current temperature
      filtered = filtered.filter(el => {
        const state = getStateAtTemperature(el);
        return state !== 'unknown';
      });
    }

    if (selectedCategories.length > 0) {
      filtered = filtered.filter(el => selectedCategories.includes(el.category));
    }

    switch (filter) {
      case 'metals':
        return filtered.filter(el =>
          el.category === 'alkali metal' ||
          el.category === 'alkaline earth metal' ||
          el.category === 'transition metal' ||
          el.category === 'post-transition metal' ||
          el.category === 'lanthanide' ||
          el.category === 'actinide'
        );
      case 'nonmetals':
        return filtered.filter(el =>
          el.category === 'nonmetal' ||
          el.category === 'halogen' ||
          el.category === 'noble gas'
        );
      case 'metalloids':
        return filtered.filter(el => el.category === 'metalloid');
      case 'solids':
        return filtered.filter(el => {
          if (viewMode === 'temperature') {
            return getStateAtTemperature(el) === 'solid';
          }
          return el.state === 'solid';
        });
      case 'liquids':
        return filtered.filter(el => {
          if (viewMode === 'temperature') {
            return getStateAtTemperature(el) === 'liquid';
          }
          return el.state === 'liquid';
        });
      case 'gases':
        return filtered.filter(el => {
          if (viewMode === 'temperature') {
            return getStateAtTemperature(el) === 'gas';
          }
          return el.state === 'gas';
        });
      default:
        return filtered;
    }
  };

  const filteredElements = getFilteredElements();
  const isElementFiltered = (element: Element): boolean => {
    return !filteredElements.some(el => el.atomicNumber === element.atomicNumber);
  };

  // Get property value for visualization
  const getPropertyValue = (element: Element, property: PropertyMode): number | null => {
    switch (property) {
      case 'atomic_radius':
        return element.atomicRadius;
      case 'electronegativity':
        return element.electronegativity;
      case 'ionization_energy':
        return element.ionizationEnergy;
      case 'metallic_character':
        return element.metallicCharacter;
      case 'non_metallic_character':
        return element.nonMetallicCharacter;
      case 'metal_reactivity':
        return element.metalReactivity;
      case 'non_metal_reactivity':
        return element.nonMetalReactivity;
      case 'electron_affinity':
        return null;
      case 'density':
        return element.density;
      case 'melting_point':
        return element.meltingPoint;
      case 'boiling_point':
        return element.boilingPoint;
      default:
        return null;
    }
  };


  const getPropertyColor = (element: Element, mode: PropertyMode) => {
    const value = getPropertyValue(element, mode);
    if (value === null || value === 0) return 'white'; // Treat 0 as null for color scaling

    const allValues = PERIODIC_TABLE_ELEMENTS
      .map(e => getPropertyValue(e, mode))
      .filter(v => v !== null && v > 0) as number[]; // Filter out 0s and nulls
    
    if (allValues.length === 0) return 'white';

    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    
    if (min === max) return 'white';
    const percentage = (value - min) / (max - min);

    switch (mode) {
      case 'atomic_radius':
        // Green scale
        return `hsl(140, 70%, ${95 - percentage * 50}%)`;
      case 'electronegativity':
        // Orange/Red scale
        return `hsl(15, 80%, ${95 - percentage * 50}%)`;
      case 'ionization_energy':
        // Purple scale
        return `hsl(270, 70%, ${95 - percentage * 50}%)`;
      case 'metallic_character':
        // Warm Amber / Bronze scale
        return `hsl(38, 90%, ${95 - percentage * 55}%)`;
      case 'non_metallic_character':
        // Teal / Mint scale
        return `hsl(165, 80%, ${95 - percentage * 55}%)`;
      case 'metal_reactivity':
        // Flame Orange / Red scale
        return `hsl(15, 95%, ${95 - percentage * 55}%)`;
      case 'non_metal_reactivity':
        // Electric Violet / Purple scale
        return `hsl(285, 85%, ${95 - percentage * 55}%)`;
      case 'electron_affinity':
        // Emerald/Green scale
        return `hsl(150, 70%, ${95 - percentage * 50}%)`;
      case 'density':
        // Slate/Gray scale
        return `hsl(220, 20%, ${95 - percentage * 60}%)`;
      case 'melting_point':
        // Sky to Indigo scale
        return `hsl(220, 75%, ${95 - percentage * 55}%)`;
      case 'boiling_point':
        // Rose to Red scale
        return `hsl(350, 80%, ${95 - percentage * 55}%)`;
      default:
        // Generic blue scale
        return `hsl(210, 80%, ${95 - percentage * 50}%)`;
    }
  };

  const getPropertyGradientString = (mode: PropertyMode) => {
    switch (mode) {
      case 'atomic_radius': return 'from-green-100 to-green-600';
      case 'electronegativity': return 'from-orange-100 to-red-600';
      case 'ionization_energy': return 'from-purple-100 to-purple-700';
      case 'metallic_character': return 'from-amber-100 to-amber-700';
      case 'non_metallic_character': return 'from-emerald-100 to-teal-700';
      case 'metal_reactivity': return 'from-orange-100 to-red-700';
      case 'non_metal_reactivity': return 'from-purple-100 to-violet-800';
      case 'electron_affinity': return 'from-emerald-100 to-emerald-600';
      case 'density': return 'from-slate-200 to-slate-700';
      case 'melting_point': return 'from-sky-100 to-indigo-700';
      case 'boiling_point': return 'from-rose-100 to-red-700';
      default: return 'from-blue-100 to-blue-600';
    }
  };

  // Grid positioning
  const _getGridPosition = (element: Element): { gridColumn: number; gridRow: number } => {
    const { period, group, atomicNumber } = element;
    
    // F-block extraction
    if (atomicNumber >= 57 && atomicNumber <= 71) {
      return { gridColumn: atomicNumber - 57 + 3, gridRow: 9 }; // Lanthanides
    }
    if (atomicNumber >= 89 && atomicNumber <= 103) {
      return { gridColumn: atomicNumber - 89 + 3, gridRow: 10 }; // Actinides
    }
    
    return { gridColumn: group || 0, gridRow: period };
  };

  // Element cell component
  const ElementCell: React.FC<{ element: Element }> = ({ element }) => {
    const isHovered = hoveredElement?.atomicNumber === element.atomicNumber;
    const isSelected = selectedElement?.atomicNumber === element.atomicNumber;
    const isComparison = comparisonElement?.atomicNumber === element.atomicNumber;
    
    // Always apply filter opacity regardless of view mode
    // Combine both the category legend filter AND the old filter dropdown
    const isCategoryFilterActive = selectedCategories.length > 0 || selectedGroups.length > 0;
    const isOldFilterActive = filter !== 'all';
    const isFilterActive = isCategoryFilterActive || isOldFilterActive;

    // Old filter check
    const passesOldFilter = !isOldFilterActive || !isElementFiltered(element);
    // Category/Group filter check
    const passesCategoryFilter = !isCategoryFilterActive
        || selectedCategories.includes(element.category) 
        || (element.group !== null && selectedGroups.includes(element.group));
    
    const isIncludedInFilter = passesOldFilter && passesCategoryFilter;

    let cellBg = 'white';
    let cellBorderColor = CATEGORY_COLORS[element.category] || '#cbd5e1';
    // Filters always drive opacity
    const cellOpacity = isFilterActive && !isIncludedInFilter ? 0.1 : 1;

    // Background/border changes per view mode (but opacity is always from filter logic)
    if (viewMode === 'temperature') {
      cellBg = getStateAtTemperature(element) === 'solid' ? '#EFF6FF' : 
               getStateAtTemperature(element) === 'liquid' ? '#FEF3C7' : 
               getStateAtTemperature(element) === 'gas' ? '#FEE2E2' : 'white';
      cellBorderColor = getStateAtTemperature(element) === 'solid' ? '#3B82F6' : 
                        getStateAtTemperature(element) === 'liquid' ? '#F59E0B' : 
                        getStateAtTemperature(element) === 'gas' ? '#EF4444' : '#cbd5e1';
    } else if (viewMode === 'property' && propertyMode !== 'none') {
      cellBg = getPropertyColor(element, propertyMode) || 'white';
      cellBorderColor = 'rgba(0,0,0,0.1)';
    } else {
      // Standard View - tint the background of included/selected elements
      if (isFilterActive && isIncludedInFilter) {
        cellBg = '#f1f5f9'; // slate-100 - reliable solid instead of color-mix
      }
    }

    // Grid coordinates
    const isLanthanide = element.atomicNumber >= 57 && element.atomicNumber <= 71;
    const isActinide = element.atomicNumber >= 89 && element.atomicNumber <= 103;

    const gridCol = isLanthanide ? element.atomicNumber - 53 : isActinide ? element.atomicNumber - 85 : (element.group ? element.group + 1 : 'auto');
    const gridRow = isLanthanide ? 10 : isActinide ? 11 : element.period + 1;

    // F-block visibility
    if (!showLanthanides && isLanthanide) return null;
    if (!showActinides && isActinide) return null;

    return (
      <div
        className="relative group cursor-pointer"
        style={{
          gridColumn: gridCol,
          gridRow: gridRow,
          opacity: cellOpacity,
          transition: 'opacity 0.15s ease'
        }}
        onMouseEnter={() => setHoveredElement(element)}
        onMouseLeave={() => setHoveredElement(null)}
        onClick={() => {
          if (comparisonElement) return;
          setSelectedElement(element);
        }}
      >
        <div 
          className={`
            w-full h-full rounded-sm p-1 transition-all duration-150 flex flex-col relative overflow-hidden
            ${isHovered ? 'ring-2 ring-slate-600 shadow-lg scale-[1.1] z-20' : 'hover:shadow-md z-10'}
            ${isSelected ? 'ring-2 ring-violet-600 shadow-md ring-offset-1' : ''}
            ${isComparison ? 'ring-2 ring-emerald-500 shadow-md ring-offset-1' : ''}
          `}
          style={{ 
            backgroundColor: cellBg,
            border: `2px solid ${cellBorderColor}`,
          }}
        >
          <div className="flex justify-between items-start w-full leading-none mb-0.5">
            <div className="text-[10px] sm:text-[11px] font-bold text-slate-800 leading-none">{element.atomicNumber}</div>
            <div className="flex flex-col items-end">
              <div className="text-[7.5px] sm:text-[8px] text-slate-800/80 leading-none mb-0.5">{element.atomicMass.toFixed(2)}</div>
                {propertyMode !== 'none' && (
                  <div className="text-[7px] sm:text-[8px] font-bold text-slate-900 bg-white/50 px-0.5 rounded-sm leading-none backdrop-blur-sm">
                    {getPropertyValue(element, propertyMode) != null ? getPropertyValue(element, propertyMode)!.toFixed(1) : '-'}
                  </div>
                )}
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-900 leading-none self-center my-auto">{element.symbol}</div>
          <div className="text-[7.5px] sm:text-[9px] font-semibold text-slate-700 leading-tight hidden sm:block truncate w-[120%] -ml-[10%] text-center tracking-tight mt-auto pt-0.5">{element.name}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 p-4 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="max-w-[1800px] mx-auto mb-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto min-w-0">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all shrink-0"
            >
              <ArrowLeft className="w-5 h-5 text-violet-600" />
              <span className="font-semibold text-slate-700 hidden sm:inline">Back</span>
            </button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-black text-violet-900 flex items-center gap-2 sm:gap-3 min-w-0">
              <Atom className="w-6 h-6 md:w-8 md:h-8 shrink-0" />
              <span className="truncate">Interactive Periodic Table</span>
            </h1>
          </div>
          
          {/* Search Bar + About button */}
          <div className="flex items-center gap-3 w-full md:w-auto min-w-0">
            <div className="flex-1 min-w-0 md:w-80 md:flex-initial relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search elements..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl focus:border-violet-500 focus:outline-none font-semibold text-slate-700"
              />
            </div>
            <button
              onClick={() => {
                const next = !challengeMode;
                setChallengeMode(next);
                if (next) handleApplyChallenge(challengeIdx);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black transition-all shadow-md shrink-0 ${
                challengeMode
                  ? 'bg-amber-500 text-slate-950 shadow-amber-500/20'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200'
              }`}
            >
              <Trophy className={`w-4 h-4 ${challengeMode ? 'text-slate-950' : 'text-amber-500'}`} />
              <span className="hidden sm:inline">{challengeMode ? 'Exit Challenges' : 'Challenge Mode'}</span>
            </button>
            <button
              onClick={() => setShowAbout(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all flex-shrink-0"
              aria-label="How to use this simulation"
            >
              <HelpCircle className="w-5 h-5 text-violet-600" />
              <span className="font-semibold text-slate-700 hidden sm:inline">How To Use</span>
            </button>
          </div>
        </div>

        {/* Legend Panel - shows above the grid, for all non-print modes */}
        <div className={`mb-6 p-4 bg-white rounded-2xl shadow-sm border border-slate-200 ${viewMode === 'print' ? 'hidden' : 'block'}`}>
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
             {/* Category Filters - always visible (including in property and temperature views!) */}
             {viewMode !== 'graph' && (
               <div className="w-full">
                 <div className="flex justify-between items-center mb-3">
                   <h3 className="text-sm font-bold text-slate-700 font-mono tracking-tight uppercase">Filter by Category</h3>
                   {(selectedCategories.length > 0 || selectedGroups.length > 0) && (
                     <button 
                       onClick={() => { setSelectedCategories([]); setSelectedGroups([]); }}
                       className="text-xs font-bold text-violet-600 hover:text-violet-800 bg-violet-50 px-3 py-1 rounded-lg"
                     >
                       Clear Filters
                     </button>
                   )}
                 </div>
                 <div className="flex flex-wrap gap-2">
                   {Object.entries(CATEGORY_COLORS).map(([category, color]) => {
                     const isSelected = selectedCategories.includes(category as ElementCategory);
                     return (
                       <button 
                         key={category} 
                         onClick={() => {
                           setSelectedCategories(prev => prev.includes(category as ElementCategory) ? prev.filter(c => c !== category) : [...prev, category as ElementCategory]);
                         }}
                         className={`flex items-center gap-2 px-3 py-1.5 rounded-lg shadow-sm border transition-all ${
                           isSelected 
                             ? 'border-slate-400 ring-2 ring-violet-500/50' 
                             : 'bg-white border-slate-200 hover:bg-slate-50'
                         }`}
                         style={{ backgroundColor: isSelected ? color + '30' : undefined }}
                       >
                         <div className="w-3.5 h-3.5 rounded-full shrink-0 border border-slate-300" style={{ backgroundColor: color }}></div>
                         <span className="text-[11px] font-bold text-slate-700 capitalize leading-tight">{category}</span>
                       </button>
                     );
                   })}
                 </div>
               </div>
             )}

             {viewMode === 'property' && propertyMode !== 'none' && (
               <div className="w-full max-w-2xl md:max-w-sm shrink-0">
                 <h3 className="text-sm font-bold text-slate-700 capitalize text-center mb-3 font-mono uppercase tracking-tight">{propertyMode.replace(/_/g, ' ')} Scale</h3>
                 <div className={`flex items-center w-full h-4 rounded-full bg-gradient-to-r ${getPropertyGradientString(propertyMode)} mb-2 border border-slate-200`}></div>
                 <div className="flex justify-between w-full text-xs font-bold text-slate-500">
                   <span>Lower / N/A</span>
                   <span>Higher</span>
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* Challenge Deck */}
        {challengeMode && (
          <ChallengeDeck
            title="Periodic Trends & Properties Mastery Challenges"
            challenges={PERIODIC_TABLE_CHALLENGES}
            currentIndex={challengeIdx}
            onSelectIndex={idx => {
              setChallengeIdx(idx);
              handleApplyChallenge(idx);
            }}
            onVerify={handleVerifyChallenge}
            onApplySolution={() => handleApplySolution(challengeIdx)}
            solutionUnlockAfter={2}
            accentGradient="from-violet-600 to-indigo-600"
            className="mb-6"
          />
        )}

        <div className="flex flex-col xl:flex-row gap-6 items-start max-w-full">
          
          {viewMode === 'print' ? (
            <div className="flex-1 w-full min-w-0">
              <PeriodicTablePrint />
            </div>
          ) : viewMode === 'graph' ? (
            <div className="flex-1 w-full min-w-0">
              <PeriodicTableGraph 
                selectedCategories={selectedCategories} 
                selectedGroups={selectedGroups}
                elementFilter={filter}
                filteredElements={filteredElements}
              />
            </div>
          ) : (
            <div className="flex-1 w-full min-w-0 overflow-x-auto bg-white rounded-2xl shadow-xl p-4 md:p-6 border border-slate-100 relative">
              <p className="block md:hidden text-center text-xs text-slate-400 font-medium mb-3">← Scroll to explore →</p>
              <div className="min-w-[900px]">
              <div
                className="grid gap-[2px] md:gap-[3px] p-2 relative"
                style={{
                  gridTemplateColumns: 'minmax(24px, auto) repeat(18, minmax(36px, 1fr))',
                  gridTemplateRows: 'minmax(30px, auto) repeat(7, minmax(48px, 60px)) minmax(16px, 24px) repeat(2, minmax(48px, 60px))',
                }}
              >
                {/* Group Column Headers */}
                {Array.from({ length: 18 }, (_, i) => i + 1).map(groupNum => {
                   const gName = getGroupName(groupNum);
                   const sName = getGroupShortName(groupNum);
                   const isSelected = selectedGroups.includes(groupNum);
                   return (
                     <button
                       key={`group-header-${groupNum}`}
                       onClick={() => {
                         setSelectedGroups(prev => prev.includes(groupNum) ? prev.filter(g => g !== groupNum) : [...prev, groupNum]);
                       }}
                       className={`flex flex-col items-center justify-end pb-1 px-0.5 rounded-t-md cursor-pointer transition-all border-b-2 ${isSelected ? 'bg-violet-50 text-violet-700 border-violet-500 shadow-sm' : 'hover:bg-slate-50 border-transparent text-slate-300 hover:text-slate-500'}`}
                       style={{ gridColumn: groupNum + 1, gridRow: 1 }}
                       title={gName ? `Group ${groupNum} - ${gName}` : `Group ${groupNum}`}
                     >
                       <span className="text-xs font-black">{groupNum}</span>
                       {sName && <span className="text-[7px] leading-tight font-bold text-center w-full truncate px-0.5 mt-0.5">{sName}</span>}
                     </button>
                   );
                })}

                {/* Period Row Headers */}
                {Array.from({ length: 7 }, (_, i) => i + 1).map(periodNum => (
                   <div 
                     key={`period-header-${periodNum}`}
                     className="flex items-center justify-center font-bold text-slate-300 text-xs pr-2"
                     style={{ gridColumn: 1, gridRow: periodNum + 1 }}
                   >
                     {periodNum}
                   </div>
                ))}

                {/* Clickable Placeholders for F-block - toggle show/hide */}
                <button 
                  onClick={() => setShowLanthanides(prev => !prev)}
                  className={`flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${showLanthanides ? 'text-slate-400 bg-slate-50/50 border-2 border-slate-200 border-dashed' : 'text-white bg-slate-500 border-2 border-slate-500'} rounded`}
                  style={{ gridColumn: 4, gridRow: 7 }}
                  title={showLanthanides ? 'Click to hide Lanthanides' : 'Click to show Lanthanides'}
                >
                  57-71
                </button>
                <button 
                  onClick={() => setShowActinides(prev => !prev)}
                  className={`flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all cursor-pointer ${showActinides ? 'text-slate-400 bg-slate-50/50 border-2 border-slate-200 border-dashed' : 'text-white bg-slate-500 border-2 border-slate-500'} rounded`}
                  style={{ gridColumn: 4, gridRow: 8 }}
                  title={showActinides ? 'Click to hide Actinides' : 'Click to show Actinides'}
                >
                  89-103
                </button>



                {PERIODIC_TABLE_ELEMENTS.map(element => {
                  return <ElementCell key={element.atomicNumber} element={element} />;
                })}
              </div>
            </div>
            
            {/* Hover Tooltip Overlay for large screens */}
            <div className="mt-4 min-h-[90px] w-full flex min-w-0">
              {hoveredElement && !selectedElement ? (
                  <div className="w-full h-full p-4 bg-slate-900 text-white rounded-xl shadow-lg flex items-center justify-between transition-all overflow-hidden min-w-0">
                      <div className="flex gap-4 items-center">
                          <div className="text-4xl font-black text-center w-16" style={{ color: CATEGORY_COLORS[hoveredElement.category] }}>{hoveredElement.symbol}</div>
                          <div>
                             <div className="text-lg font-bold">{hoveredElement.name}</div>
                             <div className="text-xs text-slate-300">Atomic Number: {hoveredElement.atomicNumber} • Mass: {hoveredElement.atomicMass.toFixed(3)} • {hoveredElement.category}</div>
                          </div>
                      </div>
                      {viewMode === 'temperature' && (
                         <div className="text-right">
                           <div className="text-sm font-bold text-slate-400">State at {temperature}K</div>
                           <div className="text-xl font-bold capitalize" style={{
                              color: getStateAtTemperature(hoveredElement) === 'solid' ? '#60A5FA' : 
                                     getStateAtTemperature(hoveredElement) === 'liquid' ? '#FBBF24' : '#F87171'
                           }}>{getStateAtTemperature(hoveredElement)}</div>
                         </div>
                      )}
                      {viewMode === 'property' && propertyMode !== 'none' && (
                         <div className="text-right">
                           <div className="text-sm font-bold text-slate-400 capitalize">{propertyMode.replace(/_/g, ' ')}</div>
                           <div className="text-xl font-bold text-indigo-300">
                             {getPropertyValue(hoveredElement, propertyMode) != null
                               ? `${getPropertyValue(hoveredElement, propertyMode)!.toFixed(
                                   propertyMode.includes('character') || propertyMode.includes('reactivity') ? 1 : 2
                                 )} ${{
                                   atomic_radius: 'pm',
                                   electronegativity: 'Pauling',
                                   ionization_energy: 'kJ/mol',
                                   metallic_character: '(0-100)',
                                   non_metallic_character: '(0-100)',
                                   metal_reactivity: '(0-100)',
                                   non_metal_reactivity: '(0-100)',
                                   density: 'g/cm³',
                                   melting_point: 'K',
                                   boiling_point: 'K',
                                   electron_affinity: '',
                                   none: ''
                                 }[propertyMode]}`
                               : 'N/A'}
                           </div>
                         </div>
                      )}
                  </div>
              ) : (
                  <div className="w-full h-full p-4 bg-slate-50 border-2 border-slate-200 border-dashed rounded-xl flex items-center justify-center text-slate-400 font-semibold transition-all">
                      Hover over an element to see quick details
                  </div>
              )}
            </div>
          </div>
          )}

          {/* Right Side Sidebar (Controls) */}
          <div className="w-full xl:w-[340px] shrink-0 space-y-4">
            {/* View Mode */}
            <div className={`bg-white rounded-2xl shadow-lg p-5 border border-slate-100 ${viewMode === 'print' ? 'print:hidden' : ''}`}>
              <label className="block text-sm font-bold text-slate-700 mb-3">View Perspective</label>
              <div className="flex flex-col gap-2">
                {(['standard', 'temperature', 'property', 'graph', 'print'] as ViewMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => {
                      setViewMode(mode);
                      if (mode !== 'property') setPropertyMode('none');
                    }}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-3 ${
                      viewMode === mode
                        ? 'bg-violet-600 text-white shadow-md'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {mode === 'standard' && <Atom className="w-4 h-4" />}
                    {mode === 'temperature' && <Thermometer className="w-4 h-4" />}
                    {mode === 'property' && <Zap className="w-4 h-4" />}
                    {mode === 'graph' && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                      </svg>
                    )}
                    {mode === 'print' && (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h10z" />
                      </svg>
                    )}
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Temperature Slider */}
            {viewMode === 'temperature' && (
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-slate-100">
                <div className="flex flex-col mb-4">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2 mb-2">
                    <Thermometer className="w-5 h-5 text-orange-500" />
                    Heat Control
                  </label>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-200">
                    <span>{temperature} K</span>
                    <span>{kelvinToCelsius(temperature).toFixed(0)} °C</span>
                    <span>{kelvinToFahrenheit(temperature).toFixed(0)} °F</span>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="6000"
                  step="10"
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="w-full h-3 bg-gradient-to-r from-blue-500 via-orange-500 to-red-500 rounded-lg appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #3B82F6 0%, #F59E0B 33%, #EF4444 66%, #DC2626 100%)`
                  }}
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-2 font-bold uppercase">
                  <span>0 K</span>
                  <span>298 K</span>
                  <span>6000 K</span>
                </div>
                <div className="mt-4 flex justify-between text-xs">
                  <div className="flex items-center gap-1.5 bg-blue-50 px-2 py-1 rounded text-blue-700 font-bold border border-blue-100">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div> Solid
                  </div>
                  <div className="flex items-center gap-1.5 bg-orange-50 px-2 py-1 rounded text-orange-700 font-bold border border-orange-100">
                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full"></div> Liquid
                  </div>
                  <div className="flex items-center gap-1.5 bg-red-50 px-2 py-1 rounded text-red-700 font-bold border border-red-100">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div> Gas
                  </div>
                </div>
              </div>
            )}

            {/* Property Mode Toggles */}
            {viewMode === 'property' && (
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-3">Select Data Overlay <span className="text-xs font-normal text-slate-400">(click again to deselect)</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    'atomic_radius',
                    'electronegativity',
                    'ionization_energy',
                    'metallic_character',
                    'non_metallic_character',
                    'metal_reactivity',
                    'non_metal_reactivity',
                    'density',
                    'melting_point',
                    'boiling_point'
                  ] as PropertyMode[]).map(prop => {
                    const label =
                      prop === 'ionization_energy' ? 'Ionization Energy' :
                      prop === 'melting_point' ? 'Melting Point' :
                      prop === 'boiling_point' ? 'Boiling Point' :
                      prop === 'metallic_character' ? 'Metallic Character' :
                      prop === 'non_metallic_character' ? 'Non-Metallic Char.' :
                      prop === 'metal_reactivity' ? 'Metal Reactivity' :
                      prop === 'non_metal_reactivity' ? 'Non-Metal Reactivity' :
                      prop.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                    const keyMap: Record<string, string> = {
                      atomic_radius: 'pm', 
                      electronegativity: 'Paulings', 
                      ionization_energy: 'kJ/mol', 
                      metallic_character: 'Index 0-100',
                      non_metallic_character: 'Index 0-100',
                      metal_reactivity: 'Index 0-100',
                      non_metal_reactivity: 'Index 0-100',
                      density: 'g/cm³',
                      melting_point: 'K',
                      boiling_point: 'K',
                    };
                    return (
                      <button
                        key={prop}
                        onClick={() => setPropertyMode(prev => prev === prop ? 'none' : prop)}
                        className={`p-2 rounded-xl text-xs font-semibold text-left transition-all flex flex-col justify-center border ${
                          propertyMode === prop
                            ? 'bg-purple-50 text-purple-700 border-purple-300 shadow-sm'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <span className="truncate w-full">{label}</span>
                        <span className="text-[10px] font-normal opacity-70">in {keyMap[prop]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filters: hidden in graph view since graph has its own built-in filters */}
            {viewMode !== 'graph' && (
              <div className="bg-white rounded-2xl shadow-lg p-5 border border-slate-100">
                <label className="block text-sm font-bold text-slate-700 mb-3">Element Filters</label>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'metals', 'nonmetals', 'metalloids', 'solids', 'liquids', 'gases'] as FilterType[]).map(f => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                        filter === f
                          ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1).replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Active Comparison Card */}
            {comparisonElement && (
                <div className="bg-emerald-50 rounded-2xl shadow-lg p-5 border border-emerald-200 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2">
                        <Scale className="w-12 h-12 text-emerald-500/20" />
                    </div>
                    <div className="relative z-10">
                        <label className="block text-xs font-bold text-emerald-800 uppercase mb-1">Comparing Against</label>
                        <h3 className="text-xl font-black text-emerald-900 mb-3 flex items-center gap-2">
                            <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded-md text-sm">{comparisonElement.symbol}</span>
                            {comparisonElement.name}
                        </h3>
                        <button
                          onClick={() => setComparisonElement(null)}
                          className="w-full py-2 bg-white text-emerald-700 hover:bg-emerald-100 rounded-xl font-bold text-sm shadow-sm transition-all border border-emerald-200"
                        >
                          Clear Comparison
                        </button>
                    </div>
                </div>
            )}
            
          </div>
        </div>
      </div>

      {/* Selected Element Details Modal */}
      {selectedElement && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => !comparisonElement && setSelectedElement(null)}>
          <div {...elementDialog} className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: CATEGORY_COLORS[selectedElement.category] }}
                >
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-900">{selectedElement.atomicNumber}</div>
                    <div className="text-3xl font-black text-slate-900">{selectedElement.symbol}</div>
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900">{selectedElement.name}</h2>
                  <p className="text-sm text-slate-600 capitalize">{selectedElement.category}</p>
                </div>
              </div>
              <div className="flex gap-2">
                {!comparisonElement && (
                  <select
                    className="px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl font-semibold outline-none focus:border-green-500 cursor-pointer shadow-sm hover:bg-green-100 transition-all appearance-none"
                    onChange={(e) => {
                      if (e.target.value) {
                        const el = PERIODIC_TABLE_ELEMENTS.find(x => x.atomicNumber === Number(e.target.value));
                        if (el) setComparisonElement(el);
                      }
                    }}
                    value=""
                  >
                    <option value="" disabled>Compare With...</option>
                    {PERIODIC_TABLE_ELEMENTS.filter(x => x.atomicNumber !== selectedElement.atomicNumber).map(el => (
                      <option key={el.atomicNumber} value={el.atomicNumber}>{el.atomicNumber} - {el.name} ({el.symbol})</option>
                    ))}
                  </select>
                )}
                <button
                  onClick={() => {
                    setSelectedElement(null);
                    setComparisonElement(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 transition-all"
                >
                  Close
                </button>
              </div>
            </div>

            <div className={`grid ${comparisonElement ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
              {/* Left Column - Selected Element Data */}
              {!comparisonElement && (
              <div>
                <h3 className="text-lg font-black text-slate-900 mb-4">Properties</h3>
                <div className="space-y-3">
                  <PropertyRow label="Atomic Mass" value={`${selectedElement.atomicMass.toFixed(3)} u`} />
                  <PropertyRow label="State at STP" value={selectedElement.state} />
                  <PropertyRow label="Category" value={selectedElement.category} />
                  <PropertyRow label="Period" value={selectedElement.period.toString()} />
                  <PropertyRow label="Group" value={selectedElement.group ? getGroupName(selectedElement.group) : 'N/A (F-block)'} />
                  
                  <div className="py-2 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-600">Electron Configuration</span>
                      <div className="flex bg-slate-100 p-0.5 rounded-lg">
                        <button 
                          onClick={() => setElectronConfigMode('noble')}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                            electronConfigMode === 'noble' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >Noble Gas</button>
                        <button 
                          onClick={() => setElectronConfigMode('full')}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                            electronConfigMode === 'full' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'
                          }`}
                        >Full</button>
                      </div>
                    </div>
                    <span className="text-sm text-slate-900 font-semibold font-mono block tracking-tight">
                      {electronConfigMode === 'noble' ? selectedElement.electronConfiguration : expandElectronConfiguration(selectedElement.electronConfiguration)}
                    </span>
                  </div>

                  <PropertyRow label="Electronegativity" value={selectedElement.electronegativity?.toFixed(2) || 'N/A'} />
                  <PropertyRow label="Ionization Energy" value={`${selectedElement.ionizationEnergy} kJ/mol`} />
                  <PropertyRow label="Atomic Radius" value={`${selectedElement.atomicRadius} pm`} />
                  <PropertyRow label="Metallic Character" value={selectedElement.metallicCharacter !== null ? `${selectedElement.metallicCharacter} / 100` : 'N/A'} />
                  <PropertyRow label="Non-Metallic Character" value={selectedElement.nonMetallicCharacter !== null ? `${selectedElement.nonMetallicCharacter} / 100` : 'N/A'} />
                  <PropertyRow label="Metal Reactivity" value={selectedElement.metalReactivity !== null ? `${selectedElement.metalReactivity} / 100` : 'N/A (Non-metal)'} />
                  <PropertyRow label="Non-Metal Reactivity" value={selectedElement.nonMetalReactivity !== null ? `${selectedElement.nonMetalReactivity} / 100` : 'N/A (Metal / Inert)'} />
                  <PropertyRow label="Density" value={selectedElement.density ? `${selectedElement.density} g/cm³` : 'N/A'} />
                  <PropertyRow label="Melting Point" value={selectedElement.meltingPoint ? `${selectedElement.meltingPoint} K` : 'N/A'} />
                  <PropertyRow label="Boiling Point" value={selectedElement.boilingPoint ? `${selectedElement.boilingPoint} K` : 'N/A'} />
                  <PropertyRow label="Oxidation States" value={selectedElement.oxidationStates.length ? selectedElement.oxidationStates.map(s => s > 0 ? `+${s}` : s).join(', ') : 'None'} />
                  {selectedElement.discoveryYear && (
                    <PropertyRow label="Discovery Year" value={selectedElement.discoveryYear.toString()} />
                  )}

                  <div className="pt-4 flex gap-3">
                    <a href={`https://en.wikipedia.org/wiki/${selectedElement.name}`} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-center text-xs transition-colors border border-blue-200">Wikipedia Page</a>
                    <a href={`https://www.youtube.com/results?search_query=Periodic+Videos+${selectedElement.name}`} target="_blank" rel="noreferrer" className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-lg text-center text-xs transition-colors border border-red-200">Periodic Videos (YouTube)</a>
                  </div>
                </div>
              </div>
              )}

              {/* Right Column - Comparison or Additional Info */}
              {comparisonElement ? (
                <div>
                  <h3 className="text-lg font-black text-slate-900 mb-4">Comparison</h3>
                  <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                    <div className="grid grid-cols-3 gap-0 text-sm">
                      <div className="font-bold text-slate-500 text-right p-3 border-r border-b border-slate-200 bg-slate-100/50">Property</div>
                      <div className="font-bold text-violet-700 text-center p-3 border-b border-slate-200 border-r bg-violet-50/50 flex flex-col items-center">
                         <span className="text-2xl">{selectedElement.symbol}</span>
                         <span className="text-xs text-slate-500 font-semibold">{selectedElement.name}</span>
                      </div>
                      <div className="font-bold text-emerald-700 text-center p-3 border-b border-slate-200 bg-emerald-50/50 flex flex-col items-center">
                         <span className="text-2xl">{comparisonElement.symbol}</span>
                         <span className="text-xs text-slate-500 font-semibold">{comparisonElement.name}</span>
                      </div>

                      <ComparisonGridRow label="Category" val1={selectedElement.category} val2={comparisonElement.category} isString capitalize />
                      <ComparisonGridRow label="Group" val1={selectedElement.group ? getGroupName(selectedElement.group) : 'N/A'} val2={comparisonElement.group ? getGroupName(comparisonElement.group) : 'N/A'} isString />
                      <ComparisonGridRow label="Period" val1={selectedElement.period} val2={comparisonElement.period} />
                      <ComparisonGridRow label="Atomic Mass" val1={selectedElement.atomicMass.toFixed(3)} val2={comparisonElement.atomicMass.toFixed(3)} unit="u" isString />
                      <ComparisonGridRow label="State at STP" val1={selectedElement.state} val2={comparisonElement.state} isString capitalize />
                      <ComparisonGridRow label="Electronegativity" val1={selectedElement.electronegativity} val2={comparisonElement.electronegativity} />
                      <ComparisonGridRow label="Ionization Energy" val1={selectedElement.ionizationEnergy} val2={comparisonElement.ionizationEnergy} unit="kJ/mol" />
                      <ComparisonGridRow label="Atomic Radius" val1={selectedElement.atomicRadius} val2={comparisonElement.atomicRadius} unit="pm" />
                      <ComparisonGridRow label="Metallic Character" val1={selectedElement.metallicCharacter} val2={comparisonElement.metallicCharacter} unit="/ 100" />
                      <ComparisonGridRow label="Non-Metallic Char." val1={selectedElement.nonMetallicCharacter} val2={comparisonElement.nonMetallicCharacter} unit="/ 100" />
                      <ComparisonGridRow label="Metal Reactivity" val1={selectedElement.metalReactivity} val2={comparisonElement.metalReactivity} unit="/ 100" />
                      <ComparisonGridRow label="Non-Metal Reactivity" val1={selectedElement.nonMetalReactivity} val2={comparisonElement.nonMetalReactivity} unit="/ 100" />
                      <ComparisonGridRow label="Density" val1={selectedElement.density} val2={comparisonElement.density} unit="g/cm³" />
                      <ComparisonGridRow label="Melting Point" val1={selectedElement.meltingPoint} val2={comparisonElement.meltingPoint} unit="K" />
                      <ComparisonGridRow label="Boiling Point" val1={selectedElement.boilingPoint} val2={comparisonElement.boilingPoint} unit="K" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col h-full min-h-[400px]">
                  <div className="flex w-full bg-slate-100 p-1 rounded-xl mb-4 shadow-inner">
                    <button 
                      onClick={() => setModelType('bohr')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${modelType === 'bohr' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Bohr Model
                    </button>
                    <button
                      onClick={() => setModelType('lewis')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${modelType === 'lewis' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Lewis Dot
                    </button>
                    <button
                      onClick={() => setModelType('spectra')}
                      className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${modelType === 'spectra' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      Spectra
                    </button>
                  </div>
                  <div className={`flex-grow rounded-2xl p-6 flex flex-col items-center justify-center relative shadow-inner transition-colors bg-slate-900 border-none`}>
                    {modelType === 'bohr' ? (
                      <>
                        <h3 className="absolute top-4 left-4 text-sm font-bold text-slate-400 z-10 flex items-center gap-2">
                          <Atom className="w-4 h-4" /> Electron Shells
                        </h3>
                        <BohrModelAtom element={selectedElement} size={280} />
                      </>
                    ) : modelType === 'lewis' ? (
                      <>
                        <h3 className="absolute top-4 left-4 text-sm font-bold text-slate-400 z-10 flex items-center gap-2">
                          <Atom className="w-4 h-4" /> Valence Electrons
                        </h3>
                        <LewisDotDiagram element={selectedElement} size={220} />
                      </>
                    ) : (
                      <>
                        <h3 className="absolute top-4 left-4 text-sm font-bold text-slate-400 z-10 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> Visible Spectrum
                        </h3>
                        <SpectrumDisplay element={selectedElement} />
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <AboutPanel
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        content={PERIODIC_TABLE_ABOUT}
        gradient="from-violet-500 to-purple-600"
      />
    </div>
  );
};

// Helper component for property rows
const PropertyRow: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex justify-between items-center py-2 border-b border-slate-100">
    <span className="text-xs font-bold text-slate-600">{label}</span>
    <span className={`text-sm text-slate-900 font-semibold ${mono ? 'font-mono' : ''}`}>{value}</span>
  </div>
);

// Helper component for comparison rows
const ComparisonGridRow: React.FC<{ label: string; val1: string | number | null | undefined; val2: string | number | null | undefined; unit?: string; isString?: boolean; capitalize?: boolean }> = ({ label, val1, val2, unit = '', isString, capitalize }) => {
  const display1 = val1 === null || val1 === undefined ? 'N/A' : isString ? val1 : `${val1} ${unit}`;
  const display2 = val2 === null || val2 === undefined ? 'N/A' : isString ? val2 : `${val2} ${unit}`;
  
  return (
    <>
      <div className="text-right p-3 border-r border-b border-slate-200 text-slate-600 font-semibold bg-white flex items-center justify-end">{label}</div>
      <div className={`text-center p-3 border-r border-b border-slate-200 bg-white font-bold text-slate-700 ${capitalize ? 'capitalize' : ''} flex items-center justify-center`}>{display1}</div>
      <div className={`text-center p-3 border-b border-slate-200 bg-white font-bold text-slate-700 ${capitalize ? 'capitalize' : ''} flex items-center justify-center`}>{display2}</div>
    </>
  );
};

export default PeriodicTableView;
