import React from 'react';
import { CourseType } from '../../types';
import { ErrorBoundary } from '../ErrorBoundary';

// Lazy-loaded simulation views
const SimulationsHub = React.lazy(() => import('../SimulationsHub'));
const CalorimetryView = React.lazy(() => import('../simulations/calorimetry/CalorimetryView'));
const BloodBufferView = React.lazy(() => import('../simulations/bloodBuffer/BloodBufferView'));
const NuclearDecayView = React.lazy(() => import('../simulations/nuclearDecay/NuclearDecayView'));
const OsmosisView = React.lazy(() => import('../simulations/osmosis/OsmosisView'));
const CarbonJourneyView = React.lazy(() => import('../simulations/carbonJourney/CarbonJourneyView'));
const IslandBiogeographyView = React.lazy(() => import('../simulations/islandBiogeography/IslandBiogeographyView'));
const PhaseChangeView = React.lazy(() => import('../simulations/phaseChange/PhaseChangeView'));
const RegulatoryModelerView = React.lazy(() => import('../simulations/regulatoryModeler/RegulatoryModelerView'));
const DiffusionView = React.lazy(() => import('../simulations/diffusion/DiffusionView'));
const KineticsView = React.lazy(() => import('../simulations/kinetics/KineticsView'));
const GasLawsView = React.lazy(() => import('../simulations/gasLaws/GasLawsView'));
const FbdView = React.lazy(() => import('../simulations/freeBodyDiagram/FbdView'));
const MotionTrackerView = React.lazy(() => import('../simulations/motionTracker/MotionTrackerView'));
const CovalentBondingView = React.lazy(() => import('../simulations/covalentBonding/CovalentBondingView'));
const BuildAnAtom = React.lazy(() => import('../simulations/buildAnAtom/BuildAnAtom'));
const IonicBondingBuilderView = React.lazy(() => import('../simulations/ionicBonding/IonicBondingBuilderView'));
const PeriodicTableView = React.lazy(() => import('../simulations/periodicTable/PeriodicTableView'));
const EcosystemSimulationView = React.lazy(() => import('../simulations/ecosystem/EcosystemSimulationView'));
const PopulationGeneticsView = React.lazy(() => import('../simulations/populationGenetics/PopulationGeneticsView'));

export const SIMULATION_VIEWS = new Set<string>([
  'simulations_hub',
  'calorimetry',
  'blood_buffer',
  'nuclear_decay',
  'osmosis_lab',
  'carbon_journey',
  'island_biogeography',
  'phase_change',
  'regulatory_modeler',
  'diffusion_simulation',
  'reaction_kinetics_simulation',
  'gas_laws',
  'free_body_diagram',
  'motion_tracker',
  'covalent_bonding',
  'build_an_atom',
  'ionic_bonding',
  'periodic_table',
  'ecosystem_simulation',
  'population_genetics'
]);

export const SimulationLoadingFallback: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center flex-col gap-6">
    <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-600 rounded-full animate-spin"></div>
    <div className="text-center">
      <h3 className="text-xl font-bold text-slate-900 mb-2">Loading Simulation</h3>
      <p className="text-slate-500 animate-pulse">Preparing interactive environment...</p>
    </div>
  </div>
);

interface SimulationRouterProps {
  view: string;
  course?: CourseType | null;
  isAuthenticated: boolean;
  onNavigate: (view: string) => void;
  onBackToLanding: () => void;
}

export const SimulationRouter: React.FC<SimulationRouterProps> = ({
  view,
  course,
  isAuthenticated,
  onNavigate,
  onBackToLanding
}) => {
  const renderSimulation = () => {
    if (view === 'simulations_hub') {
      return (
        <React.Suspense fallback={<SimulationLoadingFallback />}>
          <SimulationsHub
          onBack={onBackToLanding}
          onStartCovalentBonding={() => onNavigate('covalent_bonding')}
          onStartIonicBonding={() => onNavigate('ionic_bonding')}
          onStartPeriodicTable={() => onNavigate('periodic_table')}
          onStartEcosystemSimulation={() => onNavigate('ecosystem_simulation')}
          onStartPopulationGenetics={() => onNavigate('population_genetics')}
          onStartPhaseChange={() => onNavigate('phase_change')}
          onStartRegulatoryModeler={() => onNavigate('regulatory_modeler')}
          onStartDiffusion={() => onNavigate('diffusion_simulation')}
          onStartKinetics={() => onNavigate('reaction_kinetics_simulation')}
          onStartGasLaws={() => onNavigate('gas_laws')}
          onStartFbd={() => onNavigate('free_body_diagram')}
          onStartBuildAnAtom={() => onNavigate('build_an_atom')}
          onStartMotionTracker={() => onNavigate('motion_tracker')}
          onStartCalorimetry={() => onNavigate('calorimetry')}
          onStartBloodBuffer={() => onNavigate('blood_buffer')}
          onStartNuclearDecay={() => onNavigate('nuclear_decay')}
          onStartOsmosis={() => onNavigate('osmosis_lab')}
          onStartCarbonJourney={() => onNavigate('carbon_journey')}
          onStartIslandBiogeography={() => onNavigate('island_biogeography')}
        />
      </React.Suspense>
    );
  }

  if (view === 'calorimetry') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <CalorimetryView onBack={() => onNavigate('simulations_hub')} />
      </React.Suspense>
    );
  }

  if (view === 'blood_buffer') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <BloodBufferView onBack={() => onNavigate('simulations_hub')} />
      </React.Suspense>
    );
  }

  if (view === 'osmosis_lab') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <OsmosisView onBack={() => onNavigate('simulations_hub')} />
      </React.Suspense>
    );
  }

  if (view === 'island_biogeography') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <IslandBiogeographyView onBack={() => onNavigate('simulations_hub')} />
      </React.Suspense>
    );
  }

  if (view === 'carbon_journey') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <CarbonJourneyView onBack={() => onNavigate('simulations_hub')} />
      </React.Suspense>
    );
  }

  if (view === 'nuclear_decay') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <NuclearDecayView onBack={() => onNavigate('simulations_hub')} />
      </React.Suspense>
    );
  }

  if (view === 'phase_change') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <PhaseChangeView onBack={() => onNavigate('simulations_hub')} />
      </React.Suspense>
    );
  }

  if (view === 'regulatory_modeler') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <RegulatoryModelerView onBack={() => onNavigate('simulations_hub')} />
      </React.Suspense>
    );
  }

  if (view === 'diffusion_simulation') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <DiffusionView onBack={() => onNavigate('simulations_hub')} />
      </React.Suspense>
    );
  }

  if (view === 'reaction_kinetics_simulation') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <KineticsView onBack={() => onNavigate('simulations_hub')} />
      </React.Suspense>
    );
  }

  if (view === 'gas_laws') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <GasLawsView onBack={() => onNavigate('simulations_hub')} />
      </React.Suspense>
    );
  }

  if (view === 'free_body_diagram') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <FbdView
          onBack={() => onNavigate('simulations_hub')}
          isAuthenticated={isAuthenticated}
        />
      </React.Suspense>
    );
  }

  if (view === 'motion_tracker') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <MotionTrackerView onBack={onBackToLanding} />
      </React.Suspense>
    );
  }

  if (view === 'covalent_bonding') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <CovalentBondingView
          course={course || 'General Chemistry'}
          onBack={() => onNavigate('simulations_hub')}
        />
      </React.Suspense>
    );
  }

  if (view === 'build_an_atom') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <BuildAnAtom onBack={() => onNavigate('simulations_hub')} />
      </React.Suspense>
    );
  }

  if (view === 'ionic_bonding') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <IonicBondingBuilderView
          course={course || 'General Chemistry'}
          onBack={() => onNavigate('simulations_hub')}
        />
      </React.Suspense>
    );
  }

  if (view === 'periodic_table') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <PeriodicTableView
          course={course || 'General Chemistry'}
          onBack={() => onNavigate('simulations_hub')}
        />
      </React.Suspense>
    );
  }

  if (view === 'ecosystem_simulation') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <EcosystemSimulationView onBack={() => onNavigate('simulations_hub')} />
      </React.Suspense>
    );
  }

  if (view === 'population_genetics') {
    return (
      <React.Suspense fallback={<SimulationLoadingFallback />}>
        <PopulationGeneticsView onBack={() => onNavigate('simulations_hub')} />
      </React.Suspense>
    );
  }

  return null;
  };

  const isHub = view === 'simulations_hub';

  return (
    <ErrorBoundary
      fallbackTitle="Simulation Error"
      fallbackMessage="An unexpected issue occurred while running this simulation."
      onReset={() => {
        if (isHub) {
          onBackToLanding();
        } else {
          onNavigate('simulations_hub');
        }
      }}
      resetLabel={isHub ? "Return to Home" : "Return to Simulations Hub"}
    >
      {renderSimulation()}
    </ErrorBoundary>
  );
};
