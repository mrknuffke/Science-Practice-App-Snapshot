import React, { useState } from 'react';
import { ScienceBuddyMascot } from './ScienceBuddyMascot';
import { 
  User, 
  Sparkles, 
  Eye, 
  Trash2, 
  RotateCcw, 
  ShieldAlert,
  ArrowLeft,
  CheckCircle,
  HelpCircle,
  LogOut
} from 'lucide-react';
import type { UserRole } from './landing/ProfileSetupModal';

interface SettingsViewProps {
  username: string;
  onChangeUsername: (name: string) => void;
  mascot: 'robot' | 'beaker' | 'plant' | 'gerbil';
  onChangeMascot: (mascot: 'robot' | 'beaker' | 'plant' | 'gerbil') => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  accessibilityMode: boolean;
  onToggleAccessibility: () => void;
  teacherMode: boolean;
  onSetRole: (role: UserRole) => void;
  onSignOut: () => void;
  onBack: () => void;
  onResetProfile: () => void;
  onFlushHistory: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  username,
  onChangeUsername,
  mascot,
  onChangeMascot,
  isDarkMode,
  onToggleDarkMode,
  accessibilityMode,
  onToggleAccessibility,
  teacherMode,
  onSetRole,
  onSignOut,
  onBack,
  onResetProfile,
  onFlushHistory,
}) => {
  const [tempName, setTempName] = useState(username);
  const [showFlushConfirm, setShowFlushConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onChangeUsername(tempName.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }
  };

  const companions = [
    { id: 'robot', emoji: '🤖', name: 'Science Bot', desc: 'Futuristic animated droid helper.' },
    { id: 'beaker', emoji: '🧪', name: 'Beaker Buddy', desc: 'Bubbling reactive chemistry flask.' },
    { id: 'plant', emoji: '🌱', name: 'Happy Plant', desc: 'Smiling terracota pot with waving leaf.' },
    { id: 'gerbil', emoji: '🐹', name: 'Cool Gerbil', desc: 'Classroom pet wearing glasses and a sharp bowtie.' }
  ] as const;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-500 text-left">
      {/* Header Back Link */}
      <div>
        <button
          onClick={onBack}
          className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </button>
        <h1 className="text-4xl font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">User Options & Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 leading-relaxed max-w-2xl">
          Customize your Socratic companion, choose your layout theme, configure helper tools, and manage your local data storage settings.
        </p>
      </div>

      {/* Bento Grid Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* 1. STUDENT PROFILE CARD (2/3 width) */}
        <div className="lg:col-span-2 space-y-6 flex flex-col justify-between">
          {/* Profile Details */}
          <div className="bento-card border border-slate-100 dark:border-slate-800/80 flex-1 flex flex-col justify-between gap-6 p-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <User className="w-3 h-3 text-indigo-500" /> Personal Identity
              </span>
              <h3 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Your Profile</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Pick your role and the name your study partner uses when it talks to you.
              </p>
            </div>

            <div className="space-y-2 max-w-md w-full">
              <span id="settings-role-label" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">I am a</span>
              <div role="radiogroup" aria-labelledby="settings-role-label" className="grid grid-cols-2 gap-3">
                {([
                  { id: 'student', emoji: '🎒', label: 'Student' },
                  { id: 'teacher', emoji: '🍎', label: 'Teacher' },
                ] as const).map(option => {
                  const isSelected = (option.id === 'teacher') === teacherMode;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => onSetRole(option.id)}
                      className={`min-h-[44px] px-4 rounded-xl border text-xs font-black font-rounded flex items-center justify-center gap-2 transition-all ${
                        isSelected
                          ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-500 dark:border-[#818CF8] text-indigo-700 dark:text-[#818CF8]'
                          : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-indigo-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <span aria-hidden="true">{option.emoji}</span> {option.label}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-400 leading-snug">
                Teacher adds a Teacher Space to the menu, with worksheet, test and review game builders.
              </p>
            </div>

            <form onSubmit={handleSaveName} className="flex gap-3 max-w-md w-full items-end mt-4">
              <div className="flex-1 space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Your Display Name</label>
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#1A1C21] dark:text-white rounded-xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
                />
              </div>
              <button
                type="submit"
                className="btn-squishy h-10 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 shadow-md transition-all flex items-center gap-1.5"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4" /> Saved!
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          </div>

          {/* 2. COMPANION SELECTOR BAR */}
          <div className="bento-card border border-slate-100 dark:border-slate-800/80 p-6 space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" /> Active Socratic Guide
              </span>
              <h3 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Study Companion</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Select your animated laboratory assistant. The chosen companion will bob and guide you reactively across all modules.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {companions.map((buddy) => {
                const isSelected = mascot === buddy.id;
                return (
                  <button
                    key={buddy.id}
                    onClick={() => onChangeMascot(buddy.id)}
                    className={`flex flex-col items-center justify-between p-4 rounded-2xl border text-center transition-all duration-300 transform hover:scale-102 ${
                      isSelected
                        ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-500 dark:border-[#818CF8] shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div className="w-16 h-16 flex items-center justify-center relative select-none">
                      {isSelected && (
                        <div className="absolute w-12 h-12 bg-indigo-500/10 rounded-full blur-md animate-pulse"></div>
                      )}
                      <ScienceBuddyMascot size={64} type={buddy.id} mood={isSelected ? 'excited' : 'happy'} />
                    </div>
                    <div className="mt-3">
                      <p className="text-xs font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded leading-none">{buddy.name}</p>
                      <p className="text-[10px] text-slate-400 leading-tight mt-1 line-clamp-2">{buddy.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 3. VISUAL PREFERENCES CARD (1/3 width) */}
        <div className="bento-card border border-slate-100 dark:border-slate-800/80 p-6 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                <Eye className="w-3 h-3 text-teal-500" /> Interface Accessibility
              </span>
              <h3 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Aesthetics & Typography</h3>
              <p className="text-xs text-slate-400 leading-normal">
                Optimize the display contrast, fonts, and accessibility settings for comfortable reading.
              </p>
            </div>

            <div className="space-y-4 mt-4">
              {/* Dark Mode toggle switch */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <div>
                  <p className="text-xs font-black text-[#1A1C21] dark:text-white font-rounded leading-none">Dark Appearance</p>
                  <p className="text-[10px] text-slate-400 mt-1">Dim lights for comfortable night study.</p>
                </div>
                <button
                  onClick={onToggleDarkMode}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    isDarkMode ? 'bg-[#818CF8] justify-end' : 'bg-slate-300 justify-start'
                  }`}
                  title="Toggle Light/Dark Theme"
                >
                  <span className="bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300" />
                </button>
              </div>

              {/* Dyslexia Mode toggle switch */}
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl">
                <div>
                  <p className="text-xs font-black text-[#1A1C21] dark:text-white font-rounded leading-none">Dyslexia-Friendly Font</p>
                  <p className="text-[10px] text-slate-400 mt-1">Enable OpenDyslexic high-readability text.</p>
                </div>
                <button
                  onClick={onToggleAccessibility}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 ${
                    accessibilityMode ? 'bg-[#818CF8] justify-end' : 'bg-slate-300 justify-start'
                  }`}
                  title="Toggle Accessible Font"
                >
                  <span className="bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform duration-300" />
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-indigo-500/5 dark:bg-indigo-500/10 border border-indigo-500/15 dark:border-indigo-500/20 rounded-2xl flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400 leading-snug">
            <HelpCircle className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
            <span>Changing settings stores preferences instantly in your secure local sandboxed memory.</span>
          </div>
        </div>

      </div>

      {/* 4. ACCOUNT / SIGN OUT */}
      <div className="bento-card border border-slate-100 dark:border-slate-800/80 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <LogOut className="w-3 h-3 text-indigo-500" /> Account
          </span>
          <h3 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Sign Out</h3>
          <p className="text-xs text-slate-400 leading-normal max-w-2xl">
            Sign out when you finish on a shared computer. Your name is cleared, but badges and history stay on this computer.
          </p>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="btn-squishy min-h-[44px] px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-black transition-all flex items-center justify-center gap-2 shrink-0"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* 5. DANGER ZONE / DATA HYGIENE SECTION */}
      <div className="bento-card border border-rose-100 dark:border-rose-950/20 p-6 space-y-6 bg-rose-500/[0.01] dark:bg-rose-500/[0.02]">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-rose-500 tracking-wider">Local storage Management</span>
            <h3 className="text-lg font-black text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">Danger Zone & Privacy</h3>
            <p className="text-xs text-slate-400 leading-normal max-w-3xl">
              <b>Privacy-first design:</b> your learning data belongs to you. <b>Science Practice Partner</b> keeps every badge, streak, setting and session report in your browser's local storage. There is no user database and no account record anywhere. The only thing that leaves your device is the text you send to the AI for a response, plus an anonymous page count. You can flush history or fully reset files at any time.
            </p>
          </div>
        </div>

        <div className="flex gap-4 flex-wrap pt-2">
          {/* Flush History button */}
          {!showFlushConfirm ? (
            <button
              onClick={() => setShowFlushConfirm(true)}
              className="btn-squishy px-5 py-3 rounded-xl border border-rose-200 dark:border-rose-950 text-rose-500 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-950/50 text-xs font-black transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Flush Practice History
            </button>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-bold animate-in fade-in duration-300">
              <span className="text-rose-600 dark:text-rose-400">Flush your badges, statistics, and past session reports permanently?</span>
              <button
                onClick={() => {
                  onFlushHistory();
                  setShowFlushConfirm(false);
                }}
                className="text-xs text-rose-600 dark:text-rose-400 font-black hover:underline"
              >
                Yes, Flush
              </button>
              <button
                onClick={() => setShowFlushConfirm(false)}
                className="text-xs text-slate-400 font-black hover:underline"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Reset profile button */}
          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="btn-squishy px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white dark:bg-rose-950 dark:hover:bg-rose-900 text-xs font-black transition-all flex items-center gap-2 shadow-md"
            >
              <RotateCcw className="w-4 h-4" /> Fully Reset Profile
            </button>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-xs font-bold animate-in fade-in duration-300">
              <span className="text-rose-600 dark:text-rose-400 font-bold">This deletes EVERYTHING including usernames, companion stats, and your sign-in session. Proceed?</span>
              <button
                onClick={() => {
                  onResetProfile();
                  setShowResetConfirm(false);
                }}
                className="text-xs text-rose-600 dark:text-rose-400 font-black hover:underline"
              >
                Yes, Reset All
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="text-xs text-slate-400 font-black hover:underline"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
