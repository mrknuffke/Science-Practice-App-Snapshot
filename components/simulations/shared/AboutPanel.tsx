/**
 * AboutPanel: reusable slide-in info panel for all simulations.
 *
 * Usage:
 *   <AboutPanel isOpen={showAbout} onClose={() => setShowAbout(false)} content={MY_ABOUT_CONTENT} />
 *
 * Content is defined per-simulation via the SimulationAboutContent interface.
 */

import React from 'react';
import { X, BookOpen, Sliders, Lightbulb, FlaskConical } from 'lucide-react';
import { useDialog } from '../../../hooks/useDialog';

export interface AboutSection {
  /** Icon name: maps to a lucide icon */
  icon: 'book' | 'sliders' | 'lightbulb' | 'flask';
  title: string;
  /** Array of paragraph strings or bullet items */
  items: string[];
  /** If true, render items as a bulleted list; otherwise as paragraphs */
  bullets?: boolean;
}

export interface SimulationAboutContent {
  title: string;
  /** 1-2 sentence overview shown at the top */
  summary: string;
  sections: AboutSection[];
}

interface AboutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  content: SimulationAboutContent;
  /** Gradient string for the header (matches the simulation's gradient) */
  gradient?: string;
}

const ICONS = {
  book: BookOpen,
  sliders: Sliders,
  lightbulb: Lightbulb,
  flask: FlaskConical,
} as const;

const AboutPanel: React.FC<AboutPanelProps> = ({
  isOpen,
  onClose,
  content,
  gradient = 'from-violet-500 to-purple-600',
}) => {
  // Escape closes; focus moves in on open, stays inside, and returns to the About button on close.
  const dialog = useDialog({ onClose, label: `About ${content.title}`, open: isOpen });

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        {...dialog}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${gradient} p-5 flex items-start justify-between flex-shrink-0`}>
          <div>
            <h2 className="text-xl font-black text-white leading-tight">{content.title}</h2>
            <p className="text-xs font-semibold text-white/80 mt-0.5 uppercase tracking-wider">How To Use</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 mt-0.5 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors flex-shrink-0"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Summary */}
          <p className="text-sm text-slate-600 leading-relaxed font-medium">{content.summary}</p>

          {content.sections.map((section, idx) => {
            const IconComponent = ICONS[section.icon];
            return (
              <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <h3 className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-white shadow-sm border border-slate-200">
                    <IconComponent className="w-3.5 h-3.5 text-slate-600" />
                  </span>
                  {section.title}
                </h3>
                {section.bullets ? (
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-600">
                        <span className="text-slate-400 font-black mt-0.5 flex-shrink-0">•</span>
                        <span dangerouslySetInnerHTML={{ __html: item }} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="space-y-2">
                    {section.items.map((item, i) => (
                      <p key={i} className="text-sm text-slate-600 leading-relaxed" dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </>
  );
};

export default AboutPanel;
