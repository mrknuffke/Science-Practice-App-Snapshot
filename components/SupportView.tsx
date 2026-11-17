import React from 'react';
import { ArrowLeft, Heart, Sparkles, Cpu, User, HelpCircle, Share2, MessageSquare, AlertTriangle, Coffee, Crown, Key, Zap, ExternalLink } from 'lucide-react';
import { MODES_METADATA } from '../constants/modesRegistry';

interface SupportViewProps {
  onBack: () => void;
  onFeedback: () => void;
  onOpenChangelog: () => void;
}

const SupportView: React.FC<SupportViewProps> = ({ onBack, onFeedback, onOpenChangelog }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 text-left">
      
      {/* ── BACK NAVIGATION LINK ── */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-605 dark:hover:text-[#818CF8] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
      </div>

      {/* ── HEADER ── */}
      <header className="space-y-3">
        <div className="inline-flex px-3 py-1 bg-emerald-550/10 border border-emerald-500/20 rounded-full text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider">
          A Public Educational Good
        </div>
        <h1 className="text-4xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded bg-clip-text text-transparent bg-gradient-to-br from-emerald-550 to-indigo-600 dark:from-emerald-400 dark:to-indigo-500">
          Open Infrastructure, Built for the Future
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
          Built in the tradition of funding models like Wikipedia and other public internet good platforms, Science Practice Partner is committed to remaining free, open, and completely private. No advertisements, no ad networks, no paywalls, and no subscription traps. The only measurement is an anonymous, cookieless page count. Just high-quality Socratic AI practice, supported entirely by volunteer educational advocates.
        </p>
      </header>

      {/* ── MEMBERSHIP CTA HERO ── */}
      <section className="relative rounded-[2rem] p-[2px] bg-gradient-to-br from-emerald-500 via-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/10">
        <div className="bg-white dark:bg-[#15171C] rounded-[calc(2rem-2px)] p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-indigo-600 rounded-xl">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#1A1C21] dark:text-white font-rounded">Teachers: Get Your School Added</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-[#818CF8]">Domain Whitelisting</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
            The AI tools are unlocked by <strong className="text-[#1A1C21] dark:text-white">Google Workspace domain</strong>, not by a code or a password. If your school isn't on the approved list yet, supporting the project on <strong className="text-[#1A1C21] dark:text-white">Ko-fi</strong> is how that gets arranged — every request costs real API spend, and this covers it. Message me from Ko-fi with your school's domain (e.g. <code className="bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px]">@yourschool.edu</code>) and I'll add it. Your whole class then signs in with the Google accounts they already have.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-2xl p-4 text-center">
              <Key className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
              <strong className="block text-[11px] font-black text-[#1A1C21] dark:text-white font-rounded mb-0.5">Domain Access</strong>
              <span className="text-[10px] text-slate-450 leading-tight block">Your school's domain added to the sign-in allowlist</span>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl p-4 text-center">
              <Zap className="w-5 h-5 text-indigo-500 mx-auto mb-2" />
              <strong className="block text-[11px] font-black text-[#1A1C21] dark:text-white font-rounded mb-0.5">Priority Support</strong>
              <span className="text-[10px] text-slate-450 leading-tight block">More responsive feedback & dedicated support</span>
            </div>
            <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 rounded-2xl p-4 text-center">
              <Sparkles className="w-5 h-5 text-violet-500 mx-auto mb-2" />
              <strong className="block text-[11px] font-black text-[#1A1C21] dark:text-white font-rounded mb-0.5">Early Features</strong>
              <span className="text-[10px] text-slate-450 leading-tight block">First access to new modes & tools as they ship</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <a
              href="https://ko-fi.com/davidknuffke"
              target="_blank"
              rel="noopener noreferrer"
              className="group/cta relative inline-flex items-center justify-center gap-3 w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-emerald-550 to-indigo-600 rounded-2xl font-rounded font-black text-white text-base hover:opacity-95 shadow-lg shadow-emerald-500/20 transition-all overflow-hidden active:scale-98"
            >
              <Coffee className="w-6 h-6 text-white" />
              <span>Join on Ko-fi</span>
              <ExternalLink className="w-4 h-4 text-white/60 group-hover/cta:text-white transition-colors" />
            </a>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed text-center max-w-sm">
              Already at an approved school? You don't need any of this — just sign in with your school Google account. The simulations and the chemistry textbook are open to everyone regardless.
            </p>
          </div>
        </div>
      </section>

      {/* ── MAIN GRID BENTO BLOCKS ── */}
      <div className="space-y-10">

        {/* 1. Why Support Matters */}
        <section className="bento-card border border-slate-100 dark:border-slate-800/80 p-6 md:p-8 bg-white dark:bg-[#15171C] rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-black text-[#1A1C21] dark:text-white font-rounded">Why Support Matters</h2>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed mb-6">
            Like Wikipedia, this platform is run by and for the community. We believe that top-tier educational materials and AI-guided Socratic tutoring should be a universal public right—not a luxury gated by subscription paywalls. Your contribution directly funds Google Gemini API keys for students and classrooms worldwide who otherwise couldn't afford it.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center">
              <span className="block text-3xl font-black text-emerald-500 dark:text-emerald-450 mb-1.5 font-rounded">{MODES_METADATA.length}</span>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Practice Modes</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-center">
              <span className="block text-3xl font-black text-emerald-500 dark:text-emerald-450 mb-1.5 font-rounded">100%</span>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Free & Private</span>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed mb-6">
            Your support keeps the AI running, the tools free, and the development active. Even small contributions make a real difference in keeping education open.
          </p>

          <div className="flex flex-col gap-4 items-center">
            <a
              href="https://ko-fi.com/davidknuffke"
              target="_blank"
              rel="noopener noreferrer"
              className="group/btn relative inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-gradient-to-r dark:from-emerald-550 dark:to-indigo-600 rounded-xl font-rounded font-black text-white text-sm shadow-lg shadow-emerald-600/25 transition-all overflow-hidden active:scale-98"
            >
              <Coffee className="w-4.5 h-4.5 text-white" />
              <span>Sponsor on Ko-fi</span>
              <ExternalLink className="w-3.5 h-3.5 text-white/60 group-hover/btn:text-white transition-colors" />
            </a>

            <p className="text-[11px] text-slate-600 dark:text-slate-400 text-center max-w-md leading-relaxed">
              One-time donations welcome. If you're a teacher who needs your <strong className="text-indigo-600 dark:text-[#818CF8]">school domain added</strong> to the sign-in allowlist, see the section above.
            </p>
            
            <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-center max-w-lg mt-2 font-rounded">
              Note to Students: You should NEVER donate money to this project. Your job is to learn; keep your money for pizza 🍕.
            </p>
          </div>
        </section>

        {/* 2. What Support Enables */}
        <section className="bento-card border border-slate-100 dark:border-slate-800/80 p-6 md:p-8 bg-white dark:bg-[#15171C] rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Cpu className="w-5 h-5 text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} />
            <h2 className="text-lg font-black text-[#1A1C21] dark:text-white font-rounded">What Your Support Enables</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "AI API Costs", desc: "Keeps the real-time Socratic tutoring running for all users without usage delays." },
              { title: "New Features", desc: "Development of advanced active study tools and interactive breakout modes." },
              { title: "Server & Hosting", desc: "Reliable, high-bandwidth server pathways for classrooms worldwide." },
              { title: "Privacy Commitment", desc: "No ads, no user database, no personal data collected. Only anonymous, cookieless page counts." }
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 flex gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-555 shrink-0 mt-1.5 animate-ping" />
                <div className="space-y-0.5">
                  <strong className="block text-xs font-black text-[#1A1C21] dark:text-white font-rounded">{item.title}</strong>
                  <span className="text-[11px] text-slate-450 leading-relaxed block">{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. About the Creator */}
        <section className="bento-card border border-slate-100 dark:border-slate-800/80 p-6 md:p-8 bg-white dark:bg-[#15171C] rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <User className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-black text-[#1A1C21] dark:text-white font-rounded">About the Creator</h2>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed mb-4">
            Science Practice Partner is built by <strong>David Knuffke</strong>, a high school science teacher. The entire application was created using AI-assisted development (vibe-coding) as a demonstration of what educators can build when given the right tools.
          </p>

          <div className="bg-indigo-50 dark:bg-indigo-950/20 border-l-4 border-indigo-500 rounded-r-2xl p-5 mb-6 text-xs italic text-slate-650 dark:text-slate-400 font-bold leading-relaxed">
            "Because of my lack of fluency with coding languages, I do not feel comfortable handling anybody's personal information. Signing in asks Google one question — are you at an approved school? — and stores only the answer. There is no user database here, no profiles, and no student records. I don't have the expertise to secure a database of children's data, so I refuse to have one."
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed mb-6">
            The platform reflects a commitment to privacy, accessibility, and genuinely useful AI implementation in education.
          </p>

          <div className="flex flex-wrap gap-3">
            <a
              href="https://www.davidknuffke.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-rounded font-black text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors"
            >
              Learn More About David →
            </a>
            <a
              href="https://www.amazon.com/Ethical-AI-Working-Framework-Educators-ebook/dp/B0GF7LNC7H"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-rounded font-black text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-850 hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors"
            >
              Read: Ethical AI in Education →
            </a>
          </div>
        </section>

        {/* 4. Other Ways to Help */}
        <section className="bento-card border border-slate-100 dark:border-slate-800/80 p-6 md:p-8 bg-white dark:bg-[#15171C] rounded-[2rem] shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-black text-[#1A1C21] dark:text-white font-rounded">Other Ways to Help</h2>
          </div>
          
          <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed mb-6">
            If you can't contribute financially, here are other ways to support:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { 
                title: "Share with colleagues", 
                desc: "Tell other science teachers about the platform.", 
                icon: <Share2 className="w-4 h-4 text-emerald-500 dark:text-emerald-450" />,
                action: false 
              },
              {
                title: "Provide feedback",
                desc: "Use the feedback system to suggest improvements.",
                icon: <MessageSquare className="w-4 h-4 text-indigo-500 dark:text-[#818CF8]" />,
                action: true,
                note: (
                  <span className="block mt-1 text-[10px] text-indigo-500 dark:text-[#818CF8] font-bold font-rounded">
                    Cool ideas get perma-credit on the <button onClick={(e) => { e.stopPropagation(); onOpenChangelog(); }} className="underline hover:text-indigo-600 dark:hover:text-[#99A4FF] transition-colors">Changelog</button>!
                  </span>
                )
              },
              {
                title: "Report issues",
                desc: "Help identify bugs, formatting issues, or mistakes.",
                icon: <AlertTriangle className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
                action: true,
                note: (
                  <span className="block mt-1 text-[10px] text-indigo-500 dark:text-[#818CF8] font-bold font-rounded">
                    Helpful reports get perma-credit on the <button onClick={(e) => { e.stopPropagation(); onOpenChangelog(); }} className="underline hover:text-indigo-600 dark:hover:text-[#99A4FF] transition-colors">Changelog</button>!
                  </span>
                )
              },
              { 
                title: "Spread the word", 
                desc: "Post about it in educator groups or social media.", 
                icon: <Sparkles className="w-4 h-4 text-[#818CF8] dark:text-[#99A4FF]" />,
                action: false 
              }
            ].map((item, i) => (
              <div
                key={i}
                className={`bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl p-4 flex gap-3 ${item.action ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors group' : ''}`}
                onClick={item.action ? onFeedback : undefined}
              >
                <div className="shrink-0 mt-1">
                  {item.icon}
                </div>
                <div className="space-y-0.5">
                  <strong className={`block text-xs font-black text-[#1A1C21] dark:text-white font-rounded ${item.action ? 'group-hover:text-indigo-550 dark:group-hover:text-[#818CF8] transition-colors underline decoration-indigo-500/20' : ''}`}>
                    {item.title}
                  </strong>
                  <span className="text-[11px] text-slate-450 leading-relaxed block">{item.desc}</span>
                  {item.note}
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* ── FOOTER ── */}
      <footer className="text-center pt-8 text-slate-400 dark:text-slate-500 text-xs border-t border-slate-100 dark:border-slate-800/80">
        <p className="mb-1 font-bold">Thank you for using Science Practice Partner</p>
        <p>Built with care by an educator, for educators and students</p>
      </footer>

    </div>
  );
};

export default SupportView;
