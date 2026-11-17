import React, { useState } from 'react';
import { FlaskConical, Gamepad2 } from 'lucide-react';
import { ScienceBuddyMascot } from './ScienceBuddyMascot';
import { useDialog } from '../hooks/useDialog';

interface DashboardShellProps {
  children: React.ReactNode;
  currentView: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  accessibilityMode: boolean;
  onToggleAccessibility: () => void;
  teacherMode: boolean;
  onToggleTeacherMode: () => void;
  onSignOut?: () => void;
  onNavigate: (view: string) => void;
  badgeCount?: number;
  streakCount?: number;
  username?: string;
  mascot?: 'robot' | 'beaker' | 'plant' | 'gerbil';
  onChangeMascot?: (mascot: 'robot' | 'beaker' | 'plant' | 'gerbil') => void;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({
  children,
  currentView,
  isDarkMode,
  onToggleDarkMode,
  accessibilityMode,
  onToggleAccessibility,
  teacherMode,
  onToggleTeacherMode: _onToggleTeacherMode,
  onSignOut,
  onNavigate,
  badgeCount = 0,
  streakCount = 0,
  username = '',
  mascot = 'robot',
  onChangeMascot: _onChangeMascot,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuDialog = useDialog({ onClose: () => setIsMobileMenuOpen(false), label: 'Menu', open: isMobileMenuOpen });

  // Derive active categories for menu highlighting
  const isHomeActive = currentView === 'landing';
  const isPracticeActive = currentView === 'practice_center';
  const isLabResearchActive = ['lab_research', 'lab', 'research', 'motion_tracker'].includes(currentView);
  const isLibraryActive = currentView === 'subject_library';
  const isSimulationsActive = ['simulations_hub'].includes(currentView);
  const isTrophyActive = currentView === 'trophy_room';
  const isHistoryActive = ['session_history', 'session_detail'].includes(currentView);
  const isTeacherActive = ['teachers', 'document_creator', 'document_config', 'test_creator_setup', 'rubric_translator', 'reflection', 'interview', 'review_games'].includes(currentView);

  const menuItems = [
    {
      label: 'Home',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      active: isHomeActive,
      onClick: () => { onNavigate('landing'); setIsMobileMenuOpen(false); }
    },
    {
      label: 'Practice Center',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      active: isPracticeActive,
      onClick: () => { onNavigate('practice_center'); setIsMobileMenuOpen(false); }
    },
    {
      label: 'Lab & Research',
      icon: <FlaskConical className="w-5 h-5" />,
      active: isLabResearchActive,
      onClick: () => { onNavigate('lab_research'); setIsMobileMenuOpen(false); }
    },
    {
      label: 'Subject Library',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      active: isLibraryActive,
      onClick: () => { onNavigate('subject_library'); setIsMobileMenuOpen(false); }
    },
    {
      label: 'Interactives',
      icon: <Gamepad2 className="w-5 h-5" />,
      active: isSimulationsActive,
      onClick: () => { onNavigate('simulations_hub'); setIsMobileMenuOpen(false); }
    },
    {
      label: 'Trophy Room',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0H4m8 0h8m-8 0a2 2 0 012 2v2H10V9a2 2 0 012-2z" />
        </svg>
      ),
      active: isTrophyActive,
      badge: badgeCount > 0 ? badgeCount : undefined,
      onClick: () => { onNavigate('trophy_room'); setIsMobileMenuOpen(false); }
    },
    {
      label: 'History',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      active: isHistoryActive,
      onClick: () => { onNavigate('session_history'); setIsMobileMenuOpen(false); }
    }
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#12141C] text-[#1A1C21] dark:text-[#F8F9FB] transition-colors duration-300">
      {/* Sidebar Top: Logo, Branding & Compact User Profile */}
      <div className="px-2 py-4 border-b border-slate-100 dark:border-slate-800/80 mb-4 space-y-4">
        <div className="flex items-center gap-3">
          <ScienceBuddyMascot size={46} mood={currentView === 'landing' ? 'happy' : 'excited'} type={mascot} />
          <div>
            <h2 className="text-lg font-black tracking-tight leading-none text-indigo-600 dark:text-[#818CF8] font-rounded">Science Practice</h2>
            <span className="text-[9px] font-black tracking-wider uppercase text-slate-400 dark:text-slate-500">Partner</span>
          </div>
        </div>
        
        {/* Compact User Profile widget */}
        <div className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800/50">
          <div className="w-8 h-8 rounded-2xl bg-indigo-500 dark:bg-[#818CF8] text-white dark:text-slate-900 flex items-center justify-center text-xs font-black uppercase shrink-0">
            {(username || 'SS')[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider leading-none">{teacherMode ? 'Teacher Profile' : 'Student Profile'}</p>
            <p className="text-xs font-black truncate text-[#1A1C21] dark:text-[#F8F9FB] mt-1 leading-none">
              {username || 'Science Student'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
              item.active
                ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-[#818CF8]'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`transition-colors ${item.active ? 'text-indigo-500 dark:text-[#818CF8]' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.icon}
              </span>
              <span className="font-rounded font-semibold">{item.label}</span>
            </div>
            {item.badge !== undefined && (
              <span className="px-2 py-0.5 text-[10px] font-black rounded-full bg-indigo-600 dark:bg-[#818CF8] text-white">
                {item.badge}
              </span>
            )}
          </button>
        ))}

        {/* Conditional Teacher Tools Category */}
        {teacherMode && (
          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/50">
            <span className="px-4 text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase block mb-2">Teacher Space</span>
            <button
              onClick={() => { onNavigate('teachers'); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
                isTeacherActive
                  ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <span className={isTeacherActive ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </span>
              <span className="font-rounded font-semibold">Teacher Tools</span>
            </button>
          </div>
        )}

        {/* Unified Help, Support & Updates Category */}
        <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/50">
          <span className="px-4 text-[10px] font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase block mb-2">Help & updates</span>
          
          {/* How It Works */}
          <button
            onClick={() => { onNavigate('how_it_works'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all ${
              currentView === 'how_it_works'
                ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-[#818CF8]'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`transition-colors ${currentView === 'how_it_works' ? 'text-indigo-500 dark:text-[#818CF8]' : 'text-slate-400 dark:text-slate-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </span>
              <span className="font-rounded font-semibold">How It Works</span>
            </div>
          </button>

          {/* Support */}
          <button
            onClick={() => { onNavigate('support'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all mt-1 ${
              currentView === 'support'
                ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-[#818CF8]'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`transition-colors ${currentView === 'support' ? 'text-indigo-500 dark:text-[#818CF8]' : 'text-slate-400 dark:text-slate-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </span>
              <span className="font-rounded font-semibold">Support</span>
            </div>
          </button>

          {/* Site Updates */}
          <button
            onClick={() => { onNavigate('changelog'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all mt-1 ${
              currentView === 'changelog'
                ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-[#818CF8]'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`transition-colors ${currentView === 'changelog' ? 'text-indigo-500 dark:text-[#818CF8]' : 'text-slate-400 dark:text-slate-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </span>
              <span className="font-rounded font-semibold">Site Updates</span>
            </div>
          </button>

          {/* Options & Settings */}
          <button
            onClick={() => { onNavigate('settings'); setIsMobileMenuOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all mt-1 ${
              currentView === 'settings'
                ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-[#818CF8]'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`transition-colors ${currentView === 'settings' ? 'text-indigo-500 dark:text-[#818CF8]' : 'text-slate-400 dark:text-slate-500'}`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <span className="font-rounded font-semibold">User Options</span>
            </div>
          </button>

          {/* Sign Out */}
          {onSignOut && (
            <button
              onClick={() => { setIsMobileMenuOpen(false); onSignOut(); }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all mt-1 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 hover:text-slate-800 dark:hover:text-white"
            >
              <div className="flex items-center gap-3">
                <span className="text-slate-400 dark:text-slate-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </span>
                <span className="font-rounded font-semibold">Sign Out</span>
              </div>
            </button>
          )}
        </div>
      </nav>

      {/* Sidebar Bottom: Streak indicator & Toggles */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 mt-auto shrink-0 space-y-3 pb-4">
        {/* Global Streak indicator in bottom */}
        {streakCount > 0 && (
          <div className="mx-4 my-2 p-2.5 rounded-2xl bg-orange-500/10 dark:bg-orange-500/5 text-orange-500 dark:text-orange-400 text-[10px] font-black border border-orange-500/20 flex items-center justify-center gap-2">
            <span>🔥</span>
            <span>{streakCount} DAY STREAK</span>
          </div>
        )}

        {/* Small Rounded Square Toggles */}
        <div className="flex justify-center gap-2 px-4">
          <button
            onClick={onToggleDarkMode}
            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-[#818CF8] hover:border-indigo-500/30 dark:hover:border-[#818CF8]/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
            title={isDarkMode ? "Light Mode" : "Dark Mode"}
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
          <button
            onClick={onToggleAccessibility}
            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all hover:scale-105 active:scale-95 ${
              accessibilityMode
                ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500 text-indigo-650 dark:text-[#818CF8]'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-[#818CF8] hover:border-indigo-500/30 dark:hover:border-[#818CF8]/30'
            }`}
            title={accessibilityMode ? "Disable Readability Mode" : "Enable Readability Mode"}
          >
            <span className="font-rounded font-black text-sm">Aa</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#12141C] text-[#1A1C21] dark:text-[#F8F9FB] transition-colors duration-300 flex">
      {/* ── DESKTOP FIXED SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 left-0 bg-white dark:bg-[#12141C] border-r border-slate-100 dark:border-slate-800/80 p-6 z-40 transition-colors duration-300">
        {sidebarContent}
      </aside>

      {/* ── MOBILE HEADER NAVIGATION ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-[#12141C] border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between px-6 z-40 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <ScienceBuddyMascot size={32} type={mascot} />
          <h1 className="font-rounded font-black text-sm text-indigo-600 dark:text-[#818CF8]">Science Practice Partner</h1>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-[#818CF8] transition-colors focus:outline-none"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* ── MOBILE DRAWER SIDEBAR PANEL ── */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 flex">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
          
          {/* Sliding drawer panel */}
          <div {...menuDialog} className="relative flex flex-col w-64 max-w-xs h-full bg-white dark:bg-[#12141C] p-6 shadow-2xl animate-in slide-in-from-left duration-300">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* ── MAIN WORKSPACE CONTENT CONTAINER ── */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0">
        <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-8 pt-20 md:pt-8 transition-colors duration-300">
          {children}
        </main>
      </div>

      {/* Floating Right-Hand Toolbar for Theme/Accessibility Toggles */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50 no-print">
        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:text-indigo-600 dark:hover:text-[#818CF8] hover:border-indigo-500/30 dark:hover:border-[#818CF8]/30 flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95"
          title={isDarkMode ? "Light Mode" : "Dark Mode"}
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
          )}
        </button>
        {/* Readability Toggle */}
        <button
          onClick={onToggleAccessibility}
          className={`w-10 h-10 rounded-xl border flex items-center justify-center shadow-md transition-all hover:scale-105 active:scale-95 ${
            accessibilityMode
              ? 'bg-indigo-50 dark:bg-indigo-950/30 border-indigo-500 text-indigo-650 dark:text-[#818CF8]'
              : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-indigo-600 dark:hover:text-[#818CF8] hover:border-indigo-500/30 dark:hover:border-[#818CF8]/30'
          }`}
          title={accessibilityMode ? "Disable Readability" : "Enable Readability"}
        >
          <span className="font-rounded font-black text-sm">Aa</span>
        </button>
      </div>
    </div>
  );
};
