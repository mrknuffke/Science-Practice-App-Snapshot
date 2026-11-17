/**
 * Simulation Header Component
 * Reusable header with back button and title for all simulations
 */

import React from 'react';
import { ArrowLeft, HelpCircle, LucideIcon } from 'lucide-react';

export interface SimulationHeaderProps {
  title: string;
  icon?: LucideIcon;
  onBack: () => void;
  gradient?: string;
  children?: React.ReactNode;
  /** If provided, renders an "About / How To" button that calls this handler */
  onOpenAbout?: () => void;
}

const SimulationHeader: React.FC<SimulationHeaderProps> = ({
  title,
  icon: Icon,
  onBack,
  gradient = 'from-violet-500 to-purple-600',
  children,
  onOpenAbout,
}) => {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all group"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5 text-violet-600 group-hover:-translate-x-1 transition-transform" />
          <span className="font-semibold text-slate-700">Back to Interactives</span>
        </button>

        <h1
          className={`text-2xl md:text-4xl font-black bg-gradient-to-r ${gradient} bg-clip-text text-transparent flex items-center gap-3`}
        >
          {Icon && <Icon className="w-8 h-8 md:w-10 md:h-10 text-violet-600" />}
          {title}
        </h1>

        {onOpenAbout && (
          <button
            onClick={onOpenAbout}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-md hover:shadow-lg transition-all group"
            aria-label="How to use this simulation"
          >
            <HelpCircle className="w-5 h-5 text-violet-600 group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-slate-700 hidden sm:inline">How To Use</span>
          </button>
        )}
      </div>

      {children}
    </div>
  );
};

export default SimulationHeader;
