import { useState } from 'react';
import ContactModal from './ContactModal';

interface FeedbackViewProps {
  onBack: () => void;
}

const FeedbackView: React.FC<FeedbackViewProps> = ({ onBack }) => {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-300 p-6 md:p-12 flex items-center justify-center relative overflow-hidden">
      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />

      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10 w-full">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-sm font-bold text-slate-400 uppercase tracking-widest mb-12 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>

        <header className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">Connect & Feedback</h1>
          <p className="text-xl leading-relaxed text-slate-400 max-w-xl mx-auto">
            Have a suggestion, found a bug, or just want to see what else I'm working on? Reach out through any of these channels.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Email / Contact Form */}
          <button
            onClick={() => setIsContactOpen(true)}
            className="group bg-slate-800/50 hover:bg-emerald-500/10 border border-slate-700 hover:border-emerald-500/50 p-8 rounded-[2rem] text-center transition-all flex flex-col items-center gap-4 hover:scale-[1.02] cursor-pointer"
          >
            <div className="w-20 h-20 bg-emerald-500/20 rounded-3xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/10">
              {/* Filled Email Icon */}
              <svg className="w-10 h-10" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-bold text-xl group-hover:text-emerald-300 transition-colors">Contact Form</h3>
              <p className="text-slate-400 text-sm">Send feedback directly</p>
            </div>
          </button>

          {/* BlueSky */}
          <a
            href="https://bsky.app/profile/davidknuffke.bsky.social"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-slate-800/50 hover:bg-sky-500/10 border border-slate-700 hover:border-sky-500/50 p-8 rounded-[2rem] text-center transition-all flex flex-col items-center gap-4 hover:scale-[1.02]"
          >
            <div className="w-20 h-20 bg-sky-500/20 rounded-3xl flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform shadow-lg shadow-sky-500/10">
              {/* Filled Cloud with Yellow Sun */}
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Yellow Sun (Behind) - Solid Fill */}
                <circle cx="18" cy="6" r="4" fill="#FBBF24" />
                {/* Filled Cloud (Foreground - Inherits Text Color) */}
                <path d="M17 10h-1.65c-0.2-2.6-2.35-4.7-5.05-4.7-2.3 0-4.25 1.55-4.9 3.7-0.3-0.05-0.6-0.1-0.9-0.1-2.5 0-4.5 2-4.5 4.5s2 4.5 4.5 4.5h9.5c2.5 0 4.5-2 4.5-4.5s-2-4.5-4.5-4.5z" fill="currentColor" />
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-bold text-xl group-hover:text-sky-300 transition-colors">BlueSky</h3>
              <p className="text-slate-400 text-sm">@davidknuffke</p>
            </div>
          </a>

          {/* Medium */}
          <a
            href="https://davidknuffke.medium.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-slate-800/50 hover:bg-white/10 border border-slate-700 hover:border-white/50 p-8 rounded-[2rem] text-center transition-all flex flex-col items-center gap-4 hover:scale-[1.02]"
          >
            <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-lg shadow-white/5">
              {/* Bold Serif 'M' - Solid/Filled */}
              <svg className="w-10 h-10" viewBox="0 0 100 100" fill="currentColor">
                <text x="50" y="80" fontFamily="Times New Roman, serif" fontSize="90" fontWeight="900" textAnchor="middle">M</text>
              </svg>
            </div>
            <div className="space-y-1">
              <h3 className="text-white font-bold text-xl group-hover:text-slate-200 transition-colors">Medium</h3>
              <p className="text-slate-400 text-sm">Weekly Writing</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
};

export default FeedbackView;