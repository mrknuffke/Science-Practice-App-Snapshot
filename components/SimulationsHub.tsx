/**
 * Simulations Hub
 * Central page for all interactive science simulations
 */

import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Atom,
  Zap,
  Sparkles,
  GraduationCap,
  Leaf,
  Link,
  ExternalLink,
  Dna,
  Network,
  Waves,
  FlaskConical,
  Wind,
  Move,
  Activity,
  Flame,
  Droplets,
  Recycle,
  Bird,
} from 'lucide-react';
import ContactModal from './ContactModal';

import { SIMULATIONS_REGISTRY } from '../constants/simulationsRegistry';

interface SimulationsHubProps {
  onBack: () => void;
  onStartCovalentBonding: () => void;
  onStartIonicBonding: () => void;
  onStartPeriodicTable: () => void;
  onStartEcosystemSimulation: () => void;
  onStartPopulationGenetics: () => void;
  onStartPhaseChange: () => void;
  onStartRegulatoryModeler: () => void;
  onStartDiffusion: () => void;
  onStartKinetics: () => void;
  onStartGasLaws: () => void;
  onStartFbd: () => void;
  onStartBuildAnAtom: () => void;
  onStartMotionTracker?: () => void;
  onStartCalorimetry?: () => void;
  onStartBloodBuffer?: () => void;
  onStartNuclearDecay?: () => void;
  onStartOsmosis?: () => void;
  onStartCarbonJourney?: () => void;
  onStartIslandBiogeography?: () => void;
}

interface SimulationCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  subject: 'Biology' | 'Chemistry' | 'Physics' | 'General';
  topics: string[];
  onClick: () => void;
  status?: 'beta' | 'new' | 'stable';
}

interface VisualConfig {
  icon: React.ReactNode;
  gradient: string;
  subject: 'Biology' | 'Chemistry' | 'Physics' | 'General';
  onClick: () => void;
  status?: 'beta' | 'new' | 'stable';
}

export const SimulationsHub: React.FC<SimulationsHubProps> = ({
  onBack,
  onStartCovalentBonding,
  onStartIonicBonding,
  onStartPeriodicTable,
  onStartEcosystemSimulation,
  onStartPopulationGenetics,
  onStartPhaseChange,
  onStartRegulatoryModeler,
  onStartDiffusion,
  onStartKinetics,
  onStartGasLaws,
  onStartFbd,
  onStartBuildAnAtom,
  onStartMotionTracker,
  onStartCalorimetry,
  onStartBloodBuffer,
  onStartNuclearDecay,
  onStartOsmosis,
  onStartCarbonJourney,
  onStartIslandBiogeography,
}) => {
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const visualConfigMap: Record<string, VisualConfig> = useMemo(() => ({
    ecosystem_balance: {
      icon: <Leaf className="w-8 h-8" />,
      gradient: 'from-emerald-500 to-teal-600',
      subject: 'Biology',
      onClick: onStartEcosystemSimulation,
    },
    population_genetics: {
      icon: <Dna className="w-8 h-8" />,
      gradient: 'from-blue-500 to-violet-600',
      subject: 'Biology',
      onClick: onStartPopulationGenetics,
    },
    covalent_bonding: {
      icon: <Link className="w-8 h-8" />,
      gradient: 'from-blue-500 to-cyan-600',
      subject: 'Chemistry',
      onClick: onStartCovalentBonding,
      status: 'beta',
    },
    ionic_bonding: {
      icon: <Zap className="w-8 h-8" />,
      gradient: 'from-amber-500 to-orange-600',
      subject: 'Chemistry',
      onClick: onStartIonicBonding,
      status: 'stable',
    },
    periodic_table: {
      icon: <Atom className="w-8 h-8" />,
      gradient: 'from-violet-500 to-purple-600',
      subject: 'Chemistry',
      onClick: onStartPeriodicTable,
    },
    build_an_atom: {
      icon: <Atom className="w-8 h-8" />,
      gradient: 'from-violet-600 to-indigo-700',
      subject: 'Chemistry',
      onClick: onStartBuildAnAtom,
      status: 'new',
    },
    phase_change: {
      icon: <Zap className="w-8 h-8" />,
      gradient: 'from-violet-500 to-fuchsia-600',
      subject: 'Chemistry',
      onClick: onStartPhaseChange,
      status: 'beta',
    },
    regulatory_modeler: {
      icon: <Network className="w-8 h-8" />,
      gradient: 'from-emerald-600 to-teal-700',
      subject: 'Biology',
      onClick: onStartRegulatoryModeler,
      status: 'beta',
    },
    diffusion_simulation: {
      icon: <Waves className="w-8 h-8" />,
      gradient: 'from-blue-500 to-cyan-600',
      subject: 'Biology',
      onClick: onStartDiffusion,
      status: 'beta',
    },
    reaction_kinetics_simulation: {
      icon: <FlaskConical className="w-8 h-8" />,
      gradient: 'from-indigo-500 to-purple-600',
      subject: 'Chemistry',
      onClick: onStartKinetics,
      status: 'beta',
    },
    gas_laws: {
      icon: <Wind className="w-8 h-8" />,
      gradient: 'from-sky-500 to-indigo-600',
      subject: 'Chemistry',
      onClick: onStartGasLaws,
      status: 'beta',
    },
    free_body_diagram: {
      icon: <Move className="w-8 h-8" />,
      gradient: 'from-cyan-500 to-blue-600',
      subject: 'Physics',
      onClick: onStartFbd,
      status: 'beta',
    },
    motion_tracker: {
      icon: <Move className="w-8 h-8" />,
      gradient: 'from-cyan-600 to-teal-600',
      subject: 'Physics',
      onClick: onStartMotionTracker || (() => {}),
      status: 'beta',
    },
    calorimetry: {
      icon: <Flame className="w-8 h-8" />,
      gradient: 'from-amber-500 to-rose-600',
      subject: 'Chemistry',
      onClick: onStartCalorimetry || (() => {}),
      status: 'new',
    },
    blood_buffer: {
      icon: <Activity className="w-8 h-8" />,
      gradient: 'from-rose-500 to-indigo-600',
      subject: 'Chemistry',
      onClick: onStartBloodBuffer || (() => {}),
      status: 'new',
    },
    nuclear_decay: {
      icon: <Zap className="w-8 h-8" />,
      gradient: 'from-emerald-500 to-amber-600',
      subject: 'Chemistry',
      onClick: onStartNuclearDecay || (() => {}),
      status: 'new',
    },
    osmosis_lab: {
      icon: <Droplets className="w-8 h-8" />,
      gradient: 'from-sky-500 to-emerald-600',
      subject: 'Biology',
      onClick: onStartOsmosis || (() => {}),
      status: 'new',
    },
    carbon_journey: {
      icon: <Recycle className="w-8 h-8" />,
      gradient: 'from-emerald-500 to-amber-500',
      subject: 'Biology',
      onClick: onStartCarbonJourney || (() => {}),
      status: 'new',
    },
    island_biogeography: {
      icon: <Bird className="w-8 h-8" />,
      gradient: 'from-sky-500 to-emerald-600',
      subject: 'Biology',
      onClick: onStartIslandBiogeography || (() => {}),
      status: 'new',
    },
  }), [
    onStartEcosystemSimulation,
    onStartPopulationGenetics,
    onStartCovalentBonding,
    onStartIonicBonding,
    onStartPeriodicTable,
    onStartBuildAnAtom,
    onStartPhaseChange,
    onStartRegulatoryModeler,
    onStartDiffusion,
    onStartKinetics,
    onStartGasLaws,
    onStartFbd,
    onStartMotionTracker,
    onStartCalorimetry,
    onStartBloodBuffer,
    onStartNuclearDecay,
    onStartOsmosis,
    onStartCarbonJourney,
    onStartIslandBiogeography,
  ]);

  const simulations: SimulationCard[] = useMemo(() => {
    return SIMULATIONS_REGISTRY.map((reg) => {
      const visual = visualConfigMap[reg.id];
      return {
        id: reg.id,
        title: reg.title,
        description: reg.blurb,
        topics: reg.topics,
        icon: visual?.icon || <FlaskConical className="w-8 h-8" />,
        gradient: visual?.gradient || 'from-slate-500 to-slate-600',
        subject: visual?.subject || 'General',
        onClick: visual?.onClick || (() => {}),
        status: visual?.status,
      };
    });
  }, [visualConfigMap]);

  const subjects: Array<'Biology' | 'Chemistry' | 'Physics' | 'General'> = ['Biology', 'Chemistry', 'Physics', 'General'];

  const getStatusBadge = (status?: 'beta' | 'new' | 'stable') => {
    if (!status || status === 'stable') return null;

    const badgeStyles = {
      beta: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      new: 'bg-green-100 text-green-800 border-green-300',
    };

    return (
      <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded-full border ${badgeStyles[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 text-blue-600 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-slate-700">Back to Home</span>
          </button>

          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <GraduationCap className="w-12 h-12 text-blue-600" />
              <h1 className="text-4xl md:text-5xl font-black text-slate-900">
                Science Interactives
              </h1>
            </div>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Interactive visualizations to explore scientific concepts hands-on. Build, experiment, and discover!
            </p>
          </div>
        </div>

        {/* Simulations by Subject */}
        <div className="space-y-12">
          {subjects.map(subject => {
            const subjectSims = simulations.filter(s => s.subject === subject);
            if (subjectSims.length === 0) return null;

            return (
              <div key={subject}>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                    {subject === 'Biology' && <Leaf className="w-6 h-6 text-emerald-600" />}
                    {subject === 'Chemistry' && <Atom className="w-6 h-6 text-violet-600" />}
                    {subject === 'Physics' && <Zap className="w-6 h-6 text-cyan-600" />}
                    {subject} Interactives
                  </h2>
                  <div className="h-px flex-1 bg-slate-200"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subjectSims.map((sim) => (
                    <div
                      key={sim.id}
                      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer transform hover:-translate-y-2 flex flex-col h-full"
                      onClick={sim.onClick}
                    >
                      {/* Gradient Header: fixed height for consistency */}
                      <div className={`bg-gradient-to-r ${sim.gradient} p-6 text-white relative overflow-hidden min-h-[120px]`}>
                        <div className="absolute top-0 right-0 opacity-20 transform translate-x-8 -translate-y-8">
                          {React.cloneElement(sim.icon as React.ReactElement, { className: 'w-32 h-32' })}
                        </div>
                        <div className="relative z-10">
                          <div className="flex items-start justify-between mb-3">
                            {sim.icon}
                            {getStatusBadge(sim.status)}
                          </div>
                          <h2 className="text-2xl font-black mb-2">{sim.title}</h2>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-6 flex flex-col flex-1">
                        <p className="text-slate-700 mb-6 leading-relaxed flex-1">
                          {sim.description}
                        </p>

                        {/* Topics */}
                        <div className="mb-6">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Core Concepts</div>
                          <div className="flex flex-wrap gap-2">
                            {sim.topics.map((topic, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[11px] font-bold border border-slate-100"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Launch Button */}
                        <button
                          className={`w-full py-3.5 bg-gradient-to-r ${sim.gradient} text-white font-black rounded-xl hover:shadow-lg transition-all transform group-hover:scale-[1.02] text-sm uppercase tracking-wider`}
                        >
                          Launch Simulation
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Credits & Attributions */}
        <div className="mt-12 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-sm font-black text-slate-600 uppercase tracking-wider mb-4">Acknowledgments</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              <strong>Ecosystem Balance</strong> is inspired by the{' '}
              <a href="https://ccl.northwestern.edu/netlogo/models/WolfSheepPredation" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1">
                Wolf Sheep Predation model <ExternalLink className="w-3 h-3" />
              </a>
              {' '}from the{' '}
              <a href="https://ccl.northwestern.edu/netlogo/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1">
                NetLogo Models Library <ExternalLink className="w-3 h-3" />
              </a>
              {' '}(Wilensky, 1997).
            </p>
            <p>
              <strong>Covalent Bonding</strong> is inspired by the covalent bonding simulation from{' '}
              <a href="https://www.scarecrowscience.co.uk/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1">
                Scarecrow Science <ExternalLink className="w-3 h-3" />
              </a>.
            </p>
            <p>
              <strong>Particle Phase Change</strong> and <strong>Ideal Gas Laws</strong> drew ideas and inspiration from{' '}
              <a href="https://phet.colorado.edu" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1">
                PhET Interactive Simulations <ExternalLink className="w-3 h-3" />
              </a>
              {' '}at the University of Colorado Boulder (
              <a href="https://github.com/phetsims/states-of-matter" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1">
                states-of-matter <ExternalLink className="w-3 h-3" />
              </a>,{' '}
              <a href="https://github.com/phetsims/gas-properties" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1">
                gas-properties <ExternalLink className="w-3 h-3" />
              </a>).
            </p>
            <p>
              <strong>Build an Atom</strong>, <strong>Population Genetics</strong>, <strong>Cell Membrane Transport</strong>, <strong>Regulatory Modeler</strong>, and <strong>Free Body Diagrams</strong> drew ideas and inspiration from PhET Interactive Simulations (
              <a href="https://github.com/phetsims/build-an-atom" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1">
                build-an-atom <ExternalLink className="w-3 h-3" />
              </a>,{' '}
              <a href="https://github.com/phetsims/natural-selection" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1">
                natural-selection <ExternalLink className="w-3 h-3" />
              </a>,{' '}
              <a href="https://github.com/phetsims/membrane-channels" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1">
                membrane-channels <ExternalLink className="w-3 h-3" />
              </a>,{' '}
              <a href="https://github.com/phetsims/gene-expression-essentials" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1">
                gene-expression-essentials <ExternalLink className="w-3 h-3" />
              </a>,{' '}
              <a href="https://github.com/phetsims/forces-and-motion-basics" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline inline-flex items-center gap-1">
                forces-and-motion-basics <ExternalLink className="w-3 h-3" />
              </a>).
            </p>
          </div>
        </div>

        {/* Feedback Section */}
        <div className="mt-6 p-8 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border-2 border-blue-200">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900 mb-3">Request an Interactive</h2>
            <p className="text-slate-700 mb-6 max-w-2xl mx-auto">
              Have an idea for a new simulation? We'd love to hear from you! Submit your suggestions for physics, chemistry, biology, or earth science simulations.
            </p>
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-5 h-5" />
              Submit Feedback
            </button>
          </div>
        </div>
      </div>

      <ContactModal isOpen={showFeedbackModal} onClose={() => setShowFeedbackModal(false)} />
    </div>
  );
};

export default SimulationsHub;
