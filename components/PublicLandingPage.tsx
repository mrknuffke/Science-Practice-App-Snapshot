/**
 * PublicLandingPage.tsx
 * Public-facing landing page that showcases both AI-powered tools (require Google sign-in)
 * and free interactive simulations (no authentication needed).
 *
 * Layout: Split-screen on desktop (AI left, Interactives right), stacked on mobile.
 */

import React from 'react';

interface PublicLandingPageProps {
  onOpenGatekeeper: () => void;
  onOpenHowItWorks: () => void;
  onOpenFeatures: () => void;
  onOpenTeachers: () => void;
  onOpenSupport: () => void;
  onOpenChangelog: () => void;
  onOpenSimulationsHub?: () => void;
  onStartPeriodicTable: () => void;
  onStartCovalentBonding: () => void;
  onStartIonicBonding: () => void;
  onStartEcosystemSimulation: () => void;
}

export const PublicLandingPage: React.FC<PublicLandingPageProps> = ({
  onOpenGatekeeper,
  onOpenHowItWorks,
  onOpenFeatures,
  onOpenTeachers,
  onOpenSupport,
  onOpenChangelog,
  onOpenSimulationsHub,
  onStartPeriodicTable,
  onStartCovalentBonding,
  onStartIonicBonding,
  onStartEcosystemSimulation,
}) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/95 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Logo */}
            <div className="text-center sm:text-left">
              <h1 className="text-3xl md:text-4xl font-black tracking-tighter">
                Science <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Practice Partner</span>
              </h1>
              <p className="text-xs text-slate-400 font-medium mt-1">AI-Powered Practice & Interactive Simulations</p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-wrap justify-center gap-2 sm:gap-3">
              <button
                onClick={onOpenHowItWorks}
                className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                How It Works
              </button>
              <button
                onClick={onOpenFeatures}
                className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                Features
              </button>
              <button
                onClick={onOpenTeachers}
                className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                For Teachers
              </button>
              <button
                onClick={onOpenSupport}
                className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-emerald-400 transition-colors uppercase tracking-wider"
              >
                Support
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content - Split Screen */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

          {/* LEFT HALF - AI-Powered Tools (Requires Google Sign-In) */}
          <div className="order-2 md:order-1">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700 h-full flex flex-col">
              {/* Section Header */}
              <div className="mb-6">
                <div className="inline-block px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 mb-4">
                  <span className="text-emerald-400 text-xs font-black uppercase tracking-widest">AI-Powered</span>
                </div>
                <h2 className="text-3xl font-black mb-3">Practice Tools</h2>
                <p className="text-slate-400 leading-relaxed">
                  Unlimited curriculum-aligned practice problems and real-time AI tutoring for Elementary, Middle School, High School, and AP Sciences.
                </p>
              </div>

              {/* Feature List */}
              <div className="mb-8 flex-1">
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">What You Get:</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🎯</span>
                    <div>
                      <p className="font-bold text-sm">Practice Session</p>
                      <p className="text-xs text-slate-400">Adaptive MCQ quizzes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📝</span>
                    <div>
                      <p className="font-bold text-sm">Written Response</p>
                      <p className="text-xs text-slate-400">FRQ practice</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📊</span>
                    <div>
                      <p className="font-bold text-sm">Data Analysis</p>
                      <p className="text-xs text-slate-400">CER with datasets</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">💬</span>
                    <div>
                      <p className="font-bold text-sm">Explanation Partner</p>
                      <p className="text-xs text-slate-400">Socratic tutoring</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🧬</span>
                    <div>
                      <p className="font-bold text-sm">Lab Co-Pilot</p>
                      <p className="text-xs text-slate-400">Experiment support</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">⚡</span>
                    <div>
                      <p className="font-bold text-sm">Smart Scanner</p>
                      <p className="text-xs text-slate-400">Upload notes, get quizzes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">📇</span>
                    <div>
                      <p className="font-bold text-sm">Flashcards</p>
                      <p className="text-xs text-slate-400">Rapid recall drills</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-lg">🔢</span>
                    <div>
                      <p className="font-bold text-sm">Calculation Partner</p>
                      <p className="text-xs text-slate-400">Step-by-step math</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="space-y-3">
                <button
                  onClick={onOpenGatekeeper}
                  className="w-full bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-black py-4 px-6 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02] active:scale-95 text-lg"
                >
                  🔐 Sign In with Google
                </button>
                <button
                  onClick={onOpenGatekeeper}
                  className="w-full text-sm text-slate-400 hover:text-emerald-400 transition-colors font-semibold"
                >
                  I don't have access yet →
                </button>
              </div>

              {/* Disclaimer */}
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-xs text-slate-500 leading-relaxed">
                  <strong className="text-slate-400 uppercase tracking-wider block mb-1">Important:</strong>
                  These tools use AI to generate practice content. While designed to align with standard curricula (AP/NGSS), they may occasionally make errors. Use as a study aid, not a replacement for your teacher.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT HALF - Free Interactives (No Code Needed) */}
          <div className="order-1 md:order-2">
            <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-slate-700 h-full flex flex-col">
              {/* Section Header */}
              <div className="mb-6">
                <div className="inline-block px-3 py-1 rounded-full border border-violet-500/30 bg-violet-500/10 mb-4">
                  <span className="text-violet-400 text-xs font-black uppercase tracking-widest">Free Access</span>
                </div>
                <h2 className="text-3xl font-black mb-3">Interactive Simulations</h2>
                <p className="text-slate-400 leading-relaxed">
                  Explore science concepts hands-on with interactive visualizations. No sign-in required!
                </p>
              </div>

              {/* Interactive Cards */}
              <div className="space-y-4 flex-1">
                {/* SAS General Biology Textbook */}
                <a
                  href="/bio/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-br from-teal-600/30 via-emerald-600/20 to-green-600/30 hover:from-teal-600/40 hover:to-green-600/40 border border-teal-500/40 hover:border-teal-400 p-5 rounded-2xl text-left transition-all group flex items-start justify-between gap-4 block shadow-lg shadow-teal-950/30"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 bg-teal-500/25 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shrink-0">
                      🌱
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-black text-lg group-hover:text-teal-300 transition-colors">SAS General Biology</h3>
                        <span className="text-xs text-slate-400 group-hover:text-white transition-colors">↗</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">Open access general biology textbook &amp; interactive homeostasis reference</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-black bg-teal-500/20 text-teal-300 rounded-full border border-teal-500/40 tracking-wider uppercase shrink-0">
                    OPEN ACCESS
                  </span>
                </a>

                {/* SAS General Chemistry Textbook */}
                <a
                  href="/chem/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-br from-indigo-600/30 via-violet-600/20 to-purple-600/30 hover:from-indigo-600/40 hover:to-purple-600/40 border border-indigo-500/40 hover:border-indigo-400 p-5 rounded-2xl text-left transition-all group flex items-start justify-between gap-4 block shadow-lg shadow-indigo-950/30"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 bg-indigo-500/25 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shrink-0">
                      📖
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-black text-lg group-hover:text-indigo-300 transition-colors">SAS General Chemistry</h3>
                        <span className="text-xs text-slate-400 group-hover:text-white transition-colors">↗</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">Open access general chemistry textbook &amp; interactive reference</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-black bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/40 tracking-wider uppercase shrink-0">
                    OPEN ACCESS
                  </span>
                </a>

                {/* SAS General Physics Textbook */}
                <a
                  href="/physics/index.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-br from-cyan-600/30 via-teal-600/20 to-blue-600/30 hover:from-cyan-600/40 hover:to-blue-600/40 border border-cyan-500/40 hover:border-cyan-400 p-5 rounded-2xl text-left transition-all group flex items-start justify-between gap-4 block shadow-lg shadow-cyan-950/30"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 bg-cyan-500/25 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shrink-0">
                      🪐
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-black text-lg group-hover:text-cyan-300 transition-colors">SAS General Physics</h3>
                        <span className="text-xs text-slate-400 group-hover:text-white transition-colors">↗</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-snug">Open access general physics textbook & interactive kinematics reference</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-black bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/40 tracking-wider uppercase shrink-0">
                    OPEN ACCESS
                  </span>
                </a>

                {/* Periodic Table */}
                <button
                  onClick={onStartPeriodicTable}
                  className="w-full bg-gradient-to-br from-violet-600/20 to-purple-600/20 hover:from-violet-600/30 hover:to-purple-600/30 border border-violet-500/30 hover:border-violet-500/50 p-5 rounded-2xl text-left transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-violet-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        ⚛️
                      </div>
                      <div>
                        <h3 className="font-black text-lg group-hover:text-violet-300 transition-colors">Interactive Periodic Table</h3>
                        <p className="text-xs text-slate-400">Explore elements, trends & properties</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                      STABLE
                    </span>
                  </div>
                </button>

                {/* Covalent Bonding */}
                <button
                  onClick={onStartCovalentBonding}
                  className="w-full bg-gradient-to-br from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30 border border-cyan-500/30 hover:border-cyan-500/50 p-5 rounded-2xl text-left transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        🧪
                      </div>
                      <div>
                        <h3 className="font-black text-lg group-hover:text-cyan-300 transition-colors">Covalent Bonding Builder</h3>
                        <p className="text-xs text-slate-400">Build molecules & visualize electron sharing</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-bold bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30">
                      BETA
                    </span>
                  </div>
                </button>

                {/* Ionic Bonding */}
                <button
                  onClick={onStartIonicBonding}
                  className="w-full bg-gradient-to-br from-amber-600/20 to-orange-600/20 hover:from-amber-600/30 hover:to-orange-600/30 border border-amber-500/30 hover:border-amber-500/50 p-5 rounded-2xl text-left transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        ⚡
                      </div>
                      <div>
                        <h3 className="font-black text-lg group-hover:text-amber-300 transition-colors">Ionic Bonding Builder</h3>
                        <p className="text-xs text-slate-400">Observe electron transfer & charge balance</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-bold bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30">
                      BETA
                    </span>
                  </div>
                </button>

                {/* Ecosystem Simulation */}
                <button
                  onClick={onStartEcosystemSimulation}
                  className="w-full bg-gradient-to-br from-emerald-600/20 to-teal-600/20 hover:from-emerald-600/30 hover:to-teal-600/30 border border-emerald-500/30 hover:border-emerald-500/50 p-5 rounded-2xl text-left transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        🌿
                      </div>
                      <div>
                        <h3 className="font-black text-lg group-hover:text-emerald-300 transition-colors">Ecosystem Balance</h3>
                        <p className="text-xs text-slate-400">Model predator-prey dynamics & carrying capacity</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-bold bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30">
                      BETA
                    </span>
                  </div>
                </button>
              </div>

              {/* Browse All Link */}
              {onOpenSimulationsHub && (
                <div className="mt-6 pt-6 border-t border-slate-700">
                  <button
                    onClick={onOpenSimulationsHub}
                    className="w-full bg-slate-700/50 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    Browse All Interactives
                    <span className="text-lg">→</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/95 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Creator Credit */}
            <p className="text-slate-400 text-sm">
              Created by{' '}
              <a
                href="https://www.davidknuffke.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-200 font-bold hover:text-emerald-400 transition-colors"
              >
                David Knuffke
              </a>
            </p>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6">
              <button
                onClick={onOpenChangelog}
                className="text-indigo-400 hover:text-indigo-300 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                Site Updates
              </button>
              <a
                href="mailto:dknuffke@sas.edu.sg?subject=Science Practice Partner Feedback"
                className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLandingPage;
