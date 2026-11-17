
import React from 'react';

interface MaintenanceViewProps {
  onSupport: () => void;
}

const MaintenanceView: React.FC<MaintenanceViewProps> = ({ onSupport }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 p-6 flex items-center justify-center relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="max-w-2xl w-full relative z-10 text-center">
        <div className="inline-block p-6 rounded-3xl bg-slate-800/80 border border-slate-700 shadow-2xl mb-8">
           <div className="text-6xl mb-4">💤</div>
           <h1 className="text-4xl font-black text-white mb-2">Systems Offline</h1>
           <p className="text-rose-400 font-bold uppercase tracking-widest text-xs">Maximum Capacity Reached</p>
        </div>

        <div className="space-y-6 text-lg text-slate-400 leading-relaxed mb-12">
          <p>
            Science Practice Partner is currently <strong>taking a nap</strong>. 
          </p>
          <p>
            This application relies on a paid AI API to generate questions and feedback. 
            Unfortunately, the monthly budget for these costs has been exceeded.
          </p>
          <p>
            Service will resume once any funding gaps have been resolved.
          </p>
        </div>

        <button 
          onClick={onSupport}
          className="group relative inline-flex items-center justify-center px-8 py-4 font-black text-white transition-all duration-200 bg-emerald-600 text-lg rounded-2xl hover:bg-emerald-500 hover:scale-[1.02] shadow-xl shadow-emerald-900/20"
        >
          <span className="mr-3">☕</span>
          Help Bring It Back Online
        </button>
      </div>
    </div>
  );
};

export default MaintenanceView;
