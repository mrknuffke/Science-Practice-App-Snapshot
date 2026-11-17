import React, { useState } from 'react';
import { Flame, FileText, Download, Check, Sparkles } from 'lucide-react';
import SimulationHeader from '../shared/SimulationHeader';
import AboutPanel from '../shared/AboutPanel';
import { SocraticMascotPanel } from '../shared/SocraticMascotPanel';
import ThermalEquilibrationTab from './ThermalEquilibrationTab';
import HeatingCurvesTab from './HeatingCurvesTab';
import CalorimetryLolTab from './CalorimetryLolTab';
import { THERMAL_SOCRATIC_TIPS } from './thermalStudioConstants';
import { useDialog } from '../../../hooks/useDialog';

interface ThermalStudioViewProps {
  onBack: () => void;
}

const THERMAL_ABOUT = {
  title: 'Thermal & Thermochemistry Studio',
  summary: 'A unified thermodynamics laboratory exploring specific heat capacities, multi-stage heating curves, and solution calorimetry with LOL energy bar diagrams.',
  sections: [
    {
      icon: 'book' as const,
      title: 'First Law of Thermodynamics',
      items: [
        'Energy cannot be created or destroyed, only transferred between a chemical system and its surroundings.',
        'In an isolated calorimeter, heat lost by hot materials or chemical reactions equals heat gained by the solvent: q_system + q_surroundings = 0.',
        'During temperature changes without phase change, heat transferred is governed by q = m · c · ΔT, where c is specific heat capacity.'
      ],
      bullets: true,
    },
    {
      icon: 'sliders' as const,
      title: 'Multi-Stage Phase Changes & Latent Heats',
      items: [
        'Heating curves display temperature plateaus during melting (fusion) and boiling (vaporization).',
        'At a plateau, temperature remains strictly constant because added energy overcomes intermolecular attractions rather than increasing average molecular kinetic energy.',
        'Total energy across multiple phases is calculated via: Σq = q_solid + q_fus + q_liquid + q_vap + q_gas.'
      ],
      bullets: true,
    },
    {
      icon: 'flask' as const,
      title: 'Dynamic LOL Energy Balancing',
      items: [
        'LOL diagrams track initial system energy (left L), heat flow through system boundaries (center O), and final system energy (right L).',
        'Thermal energy (E_th) represents molecular motion (temperature), while chemical energy (E_ch) represents potential energy stored in bonds and crystal lattices.',
        'In endothermic reactions, heat enters the system (+q), increasing E_ch and cooling the surroundings. In exothermic reactions, heat leaves (-q), warming the surroundings.'
      ],
      bullets: true,
    }
  ]
};

export const ThermalStudioView: React.FC<ThermalStudioViewProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'equilibration' | 'heating' | 'calorimetry'>('equilibration');
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const reportDialog = useDialog({ onClose: () => setShowReportModal(false), labelledBy: 'thermal-report-title', open: showReportModal });
  const [copiedReport, setCopiedReport] = useState<boolean>(false);

  // Generate formatted student lab report
  const generateReportText = () => {
    const timestamp = new Date().toLocaleString();
    return `# Thermal & Thermochemistry Studio: Student Lab Report
Generated: ${timestamp}
Course: General Chemistry & Thermodynamics
Status: Verification Complete

## Module 1: Specific Heat & Thermal Equilibration
- Governing Law: First Law of Thermodynamics (q_metal = -q_liquid)
- Equation: q = m · c · ΔT
- Key Concept: Materials with low specific heat capacity (e.g., Lead c = 0.129 J/g·°C) experience large temperature swings with minimal heat transfer, whereas water (c = 4.184 J/g·°C) serves as an exceptionally high-capacity thermal buffer.

## Module 2: Multi-Stage Heating Curves
- Governing Equation: Σq = q_solid + q_fus + q_liquid + q_vap + q_gas
- Melting Plateau: q_fus = m · ΔH_fus (temperature constant at T_melt)
- Vaporization Plateau: q_vap = m · ΔH_vap (temperature constant at T_boil)
- Particle Insight: Latent heat energy converts potential energy by severing intermolecular bonds rather than increasing molecular velocity.

## Module 3: Solution Calorimetry & LOL Energy Balancer
- Governing Equation: q_rxn = -q_calorimeter
- Molar Enthalpy: ΔH_soln = q_rxn / n_solute
- LOL Energy Accounting: Conserved discrete energy blocks (E_th + E_ch ± q = E_final)
- Reaction Types Observed:
  * Ammonium Nitrate (NH4NO3): Endothermic dissolution (+25.7 kJ/mol), heat absorbed from solvent, cold pack mechanism.
  * Calcium Chloride (CaCl2): Exothermic dissolution (-81.3 kJ/mol), intense heat released to solvent, hot pack mechanism.

---
Science Practice App · Singapore American School
`;
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const handleDownloadReport = () => {
    const element = document.createElement('a');
    const file = new Blob([generateReportText()], { type: 'text/markdown' });
    element.href = URL.createObjectURL(file);
    element.download = `Thermochemistry_Lab_Report_${Date.now()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 md:p-8 max-w-full overflow-x-hidden">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <SimulationHeader
          title="Thermal & Thermochemistry Studio"
          icon={Flame}
          onBack={onBack}
          gradient="from-amber-500 to-rose-600"
          onOpenAbout={() => setShowAbout(true)}
        />

        {/* Primary Laboratory Tab Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('equilibration')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'equilibration'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>1. Specific Heat (q = mcΔT)</span>
            </button>
            <button
              onClick={() => setActiveTab('heating')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'heating'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>2. Multi-Stage Heating Curves</span>
            </button>
            <button
              onClick={() => setActiveTab('calorimetry')}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 ${
                activeTab === 'calorimetry'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <span>3. Calorimetry &amp; LOL Balancer</span>
            </button>
          </div>

          {/* Export Report Button */}
          <button
            onClick={() => setShowReportModal(true)}
            className="px-3.5 py-2 rounded-2xl text-xs font-bold bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-all self-end sm:self-auto"
          >
            <FileText className="w-3.5 h-3.5 text-amber-500" />
            <span>Export Lab Report</span>
          </button>
        </div>

        {/* About Modal */}
        <AboutPanel
          isOpen={showAbout}
          onClose={() => setShowAbout(false)}
          content={THERMAL_ABOUT}
          gradient="from-amber-500 to-rose-600"
        />

        {/* Active Tab Content */}
        {activeTab === 'equilibration' && <ThermalEquilibrationTab />}
        {activeTab === 'heating' && <HeatingCurvesTab />}
        {activeTab === 'calorimetry' && <CalorimetryLolTab />}

        {/* Pedagogical Mascot Guidance Panel */}
        <SocraticMascotPanel
          title="Thermodynamics Socratic Study Guide"
          tips={THERMAL_SOCRATIC_TIPS}
          mood="thinking"
        />

        {/* Lab Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div {...reportDialog} className="bg-white dark:bg-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-500" />
                  <h3 id="thermal-report-title" className="font-bold text-base text-slate-800 dark:text-slate-100">
                    Export Thermodynamic Lab Report
                  </h3>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
                >
                  &times;
                </button>
              </div>

              <div className="h-64 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl font-mono text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
                {generateReportText()}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={handleCopyReport}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition-colors"
                >
                  {copiedReport ? <Check className="w-4 h-4 text-emerald-500" /> : <Sparkles className="w-4 h-4" />}
                  <span>{copiedReport ? 'Copied to Clipboard' : 'Copy to Clipboard'}</span>
                </button>
                <button
                  onClick={handleDownloadReport}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-amber-500 to-rose-600 hover:brightness-110 text-white flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Markdown</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThermalStudioView;
