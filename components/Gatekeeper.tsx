import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { ScienceBuddyMascot } from './ScienceBuddyMascot';
import ContactModal from './ContactModal';
import { initGoogleSignIn, isGoogleSignInConfigured, renderGoogleButton } from '../utils/googleAuth';

interface GatekeeperProps {
  onGoogleUnlock: (sessionToken: string) => void;
  onOpenOpenResources?: () => void;
  onShowHowItWorks?: () => void;
  onOpenFeatures?: () => void;
  onOpenTeachers?: () => void;
  onOpenSupport?: () => void;
  onFeedback?: () => void;
  onOpenSimulations?: () => void;
  onOpenChangelog?: () => void;
}

const Gatekeeper: React.FC<GatekeeperProps> = ({
  onGoogleUnlock,
  onOpenOpenResources,
  onShowHowItWorks,
  onOpenFeatures,
  onOpenTeachers,
  onOpenSupport,
  onFeedback,
  onOpenSimulations: _onOpenSimulations,
  onOpenChangelog,
}) => {
  const buttonContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHelpMode, setIsHelpMode] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const configured = isGoogleSignInConfigured();

  const handleDevBypass = async () => {
    setIsVerifying(true);
    setError(null);
    try {
      const response = await fetch('/api/auth-dev', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.session) {
        onGoogleUnlock(data.session);
      } else {
        setError(data.error || 'Local dev bypass failed.');
      }
    } catch {
      setError('Network error during local bypass.');
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (!configured) return;

    let cancelled = false;

    const handleCredential = async (credential: string) => {
      setIsVerifying(true);
      setError(null);
      try {
        const response = await fetch('/api/auth-google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential }),
        });
        const data = await response.json().catch(() => ({}));
        if (response.ok && data.session) {
          onGoogleUnlock(data.session);
        } else {
          setError(data.error || "We couldn't verify that Google account. Please try again.");
        }
      } catch {
        setError('Network error: please check your connection and try again.');
      } finally {
        setIsVerifying(false);
      }
    };

    const tryRender = () => {
      if (cancelled) return;
      if (window.google?.accounts?.id && buttonContainerRef.current) {
        initGoogleSignIn(handleCredential);
        renderGoogleButton(buttonContainerRef.current);
      } else {
        setTimeout(tryRender, 150);
      }
    };
    tryRender();

    return () => { cancelled = true; };
  }, [configured, onGoogleUnlock]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900 dark:bg-[#0A0C10] flex flex-col items-center justify-center p-6 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-[#1E212A] border border-slate-100 dark:border-slate-800 rounded-bento p-8 md:p-12 shadow-2xl relative overflow-hidden text-left">
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8 pointer-events-none"></div>

        {/* Playful Central Mascot Dialogue Greeting */}
        <div className="flex flex-col items-center gap-6 mb-8 select-none">
          <div className="relative">
            <div className="absolute w-24 h-24 bg-indigo-500/10 dark:bg-indigo-400/10 rounded-full blur-xl -top-1 left-1"></div>
            <ScienceBuddyMascot size={110} mood={error ? "sad" : isHelpMode ? "thinking" : "happy"} />
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 p-4 rounded-3xl relative text-slate-600 dark:text-slate-300 text-xs font-bold text-center leading-relaxed max-w-xs shadow-md">
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-50 dark:border-b-slate-900"></div>
            {error ? (
              <span className="text-rose-500 dark:text-rose-400">{error}</span>
            ) : isHelpMode ? (
              <span>Ah, need a hand signing in? Let's sort it out! 🎒</span>
            ) : (
              <span>Psst! Sign in with your school Google account to unlock our full practice session space together! 🚀</span>
            )}
          </div>
        </div>

        {isHelpMode ? (
          <div className="space-y-6">
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-950/40">
              <h3 className="text-[10px] font-black text-indigo-600 dark:text-[#818CF8] uppercase tracking-wider mb-1">SAS Students & Staff</h3>
              <p className="text-slate-650 dark:text-slate-355 text-xs leading-relaxed">
                Sign in with the Google account issued by your school (your @sas.edu.sg email). If the button doesn't respond, make sure you're already signed into that account in this browser.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/40">
              <h3 className="text-[10px] font-black text-slate-500 dark:text-slate-405 uppercase tracking-wider mb-1">Not an SAS Account?</h3>
              <p className="text-slate-650 dark:text-slate-355 text-xs leading-relaxed">
                Have your teacher contact Dr. Knuffke at <button onClick={() => setIsContactOpen(true)} className="text-indigo-600 dark:text-[#818CF8] font-bold hover:underline">davidknuffke.com/contact</button> to request access for your school's domain.
              </p>
            </div>

            <button
              onClick={() => setIsHelpMode(false)}
              className="w-full py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-xs font-black text-slate-600 dark:text-slate-300 transition-all font-rounded"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {configured ? (
              <div className="flex flex-col items-center gap-3">
                <div ref={buttonContainerRef} className="min-h-[44px] flex items-center justify-center" />
                {isVerifying && (
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Verifying...</p>
                )}
                {/*
                  Google rejects an unregistered JavaScript origin inside its own
                  iframe, so no callback fires and this component never learns
                  about it: the only symptom is a Google error page that names
                  "origin_mismatch" without naming the origin it saw. Showing the
                  origin here, in dev only, puts the exact string to register next
                  to the button that is failing.
                */}
                {import.meta.env.DEV && (
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center leading-relaxed max-w-[320px]">
                    Sign-in origin:{' '}
                    <code className="font-mono text-slate-600 dark:text-slate-300">
                      {window.location.origin}
                    </code>
                    <br />
                    If Google says <b>origin_mismatch</b>, this exact string is missing from
                    Authorized JavaScript origins.
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  Google sign-in isn't configured yet. Contact your administrator.
                </p>
              </div>
            )}

            {import.meta.env.DEV && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDevBypass}
                  disabled={isVerifying}
                  className="w-full py-2.5 px-4 rounded-xl border border-dashed border-amber-400 dark:border-amber-500/50 bg-amber-50/70 dark:bg-amber-950/20 text-amber-800 dark:text-amber-300 text-xs font-bold hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-all flex items-center justify-center gap-2 font-rounded shadow-sm cursor-pointer"
                >
                  <span>⚡</span>
                  <span>Bypass Sign-In (Local Dev Only)</span>
                </button>
              </div>
            )}

            <button
              onClick={() => setIsHelpMode(true)}
              className="w-full text-indigo-600 dark:text-[#818CF8] text-xs font-black hover:underline transition-all text-center font-rounded"
            >
              Trouble signing in?
            </button>
          </div>
        )}

        {!isHelpMode && (
          <div className="mt-8 text-center space-y-4">
            <p className="text-[10px] text-slate-400 dark:text-slate-550 font-black uppercase tracking-wider">EXPLORE WITHOUT SIGNING IN</p>

            {/* Unified Open Access Resources Card */}
            <button
              type="button"
              onClick={onOpenOpenResources}
              className="w-full group p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/80 dark:from-slate-800 dark:via-[#1E212A] dark:to-indigo-950/30 border border-indigo-150 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500/60 shadow-sm hover:shadow-md transition-all text-left flex items-center justify-between gap-3 font-rounded cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/10 dark:bg-indigo-400/10 flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition-transform">
                  🔬
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-wider">
                      Open Science Resources
                    </span>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                      FREE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                    Textbooks, NGSS PE modules, sims &amp; practice sets
                  </p>
                </div>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            {/* Role Quick Selector */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem('sp_open_resources_role', 'student');
                    localStorage.setItem('sp_teacher_mode', 'false');
                  } catch {
                    /* ignore */
                  }
                  onOpenOpenResources?.();
                }}
                className="py-2 px-3 rounded-xl bg-indigo-50/80 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-indigo-950/50 text-indigo-700 dark:text-[#818CF8] text-[11px] font-black font-rounded transition-colors flex items-center justify-center gap-1.5 border border-indigo-200/60 dark:border-indigo-900/50 shadow-sm cursor-pointer"
              >
                <span>🎒</span>
                <span>Student Hub</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  try {
                    localStorage.setItem('sp_open_resources_role', 'teacher');
                    localStorage.setItem('sp_teacher_mode', 'true');
                  } catch {
                    /* ignore */
                  }
                  onOpenOpenResources?.();
                }}
                className="py-2 px-3 rounded-xl bg-amber-50/80 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950/50 text-amber-700 dark:text-amber-400 text-[11px] font-black font-rounded transition-colors flex items-center justify-center gap-1.5 border border-amber-200/60 dark:border-amber-900/50 shadow-sm cursor-pointer"
              >
                <span>🍎</span>
                <span>Teacher Tools</span>
              </button>
            </div>

            {/* Compact Quick Jump Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-0.5 text-[10px] font-bold text-slate-400 dark:text-slate-500 font-rounded">
              <span>Textbooks</span>
              <span>&bull;</span>
              <span>PE Modules</span>
              <span>&bull;</span>
              <span>XL Sets</span>
              <span>&bull;</span>
              <span>Simulations</span>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
              <span className="text-[9px] text-slate-400 dark:text-slate-550 font-black uppercase tracking-wider">OR LEARN MORE</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
            </div>

            {/* Other informational links */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 font-rounded">
              {onOpenOpenResources && (
                <button onClick={onOpenOpenResources} className="hover:text-indigo-650 dark:hover:text-[#818CF8] transition-colors">
                  Open Resources
                </button>
              )}
              {onShowHowItWorks && (
                <button onClick={onShowHowItWorks} className="hover:text-indigo-650 dark:hover:text-[#818CF8] transition-colors">
                  How it Works
                </button>
              )}
                {onOpenFeatures && (
                  <button onClick={onOpenFeatures} className="hover:text-indigo-650 dark:hover:text-[#818CF8] transition-colors">
                    Features
                  </button>
                )}
                {onOpenTeachers && (
                  <button onClick={onOpenTeachers} className="hover:text-indigo-650 dark:hover:text-[#818CF8] transition-colors">
                    For Teachers
                  </button>
                )}
                {onOpenSupport && (
                  <button onClick={onOpenSupport} className="hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors">
                    Support
                  </button>
                )}
                {onOpenChangelog && (
                  <button onClick={onOpenChangelog} className="hover:text-indigo-650 dark:hover:text-[#818CF8] transition-colors">
                    Changelog
                  </button>
                )}
                {onFeedback && (
                  <button onClick={() => setIsContactOpen(true)} className="hover:text-indigo-650 dark:hover:text-[#818CF8] transition-colors">
                    Contact
                  </button>
                )}
              </div>
            </div>
          )}

        <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} />
      </div>
    </div>
  );
};

export default Gatekeeper;
