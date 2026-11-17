import React, { useState } from 'react';
import { ScienceBuddyMascot } from '../ScienceBuddyMascot';
import { useDialog } from '../../hooks/useDialog';

export type UserRole = 'student' | 'teacher';

// Set once the user has picked a role after signing in. Signing out clears it, so
// the next person on a shared computer sees this card again.
export const PROFILE_DONE_KEY = 'sp_profile_done';

interface ProfileSetupModalProps {
  isOpen: boolean;
  initialRole: UserRole | null;
  initialName: string;
  onSave: (role: UserRole, name: string) => void;
}

const ROLE_OPTIONS: { id: UserRole; emoji: string; label: string; desc: string }[] = [
  { id: 'student', emoji: '🎒', label: 'Student', desc: 'Practice modes, simulations and study tools.' },
  { id: 'teacher', emoji: '🍎', label: 'Teacher', desc: 'Student tools, plus worksheet, test and review game builders.' },
];

export const ProfileSetupModal: React.FC<ProfileSetupModalProps> = ({ isOpen, initialRole, initialName, onSave }) => {
  // No onClose: the card must be answered, so Escape does not dismiss it.
  const dialog = useDialog<HTMLFormElement>({ labelledBy: 'profile-setup-title', open: isOpen });
  const [role, setRole] = useState<UserRole | null>(initialRole);
  const [name, setName] = useState(initialName);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role) onSave(role, name.trim());
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        {...dialog}
        className="bg-white dark:bg-[#1A1D26] border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-2xl max-w-md w-full relative overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col items-center text-center space-y-5"
      >
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 rounded-2xl">
          <ScienceBuddyMascot size={80} mood="wave" />
        </div>

        <div className="space-y-1.5">
          <h3 id="profile-setup-title" className="text-xl font-black font-rounded text-[#1A1C21] dark:text-[#F8F9FB]">
            Before you start
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
            Tell us who you are, so the menu shows the right tools.
          </p>
        </div>

        <div className="w-full space-y-2 text-left">
          <span id="profile-role-label" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">I am a</span>
          <div role="radiogroup" aria-labelledby="profile-role-label" className="grid grid-cols-2 gap-3">
            {ROLE_OPTIONS.map(option => {
              const isSelected = role === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => setRole(option.id)}
                  className={`min-h-[44px] p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-500 dark:border-[#818CF8] shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-slate-600'
                  }`}
                >
                  <span className="flex items-center gap-1.5 text-sm font-black font-rounded text-[#1A1C21] dark:text-[#F8F9FB]">
                    <span aria-hidden="true">{option.emoji}</span> {option.label}
                  </span>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 leading-snug mt-1">{option.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="w-full space-y-2 text-left">
          <label htmlFor="profile-name" className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">
            What should your study partner call you?
          </label>
          <input
            id="profile-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoComplete="off"
            placeholder="First name or nickname"
            className="w-full min-h-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#1A1C21] dark:text-white rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400"
          />
          <p className="text-[10px] text-slate-400 leading-snug">
            Optional. It stays on this computer, and you can change it in User Options.
          </p>
        </div>

        <button
          type="submit"
          disabled={!role}
          className="w-full min-h-[44px] py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {role ? 'Continue' : 'Pick student or teacher'}
        </button>
      </form>
    </div>
  );
};
