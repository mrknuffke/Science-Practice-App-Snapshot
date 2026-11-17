import React, { useState, useEffect, useRef } from 'react';
import { Target, Calculator, MessageSquare, Sparkles } from 'lucide-react';
import { ScienceBuddyMascot } from '../ScienceBuddyMascot';
import { SIMULATIONS_REGISTRY } from '../../constants/simulationsRegistry';
import { ViewType } from '../../types';

/** One bubble in the study-buddy chat; `setupPrompt` marks the first-visit setup card. */
interface AdvisorMessage {
  role: 'user' | 'model';
  text: string;
  setupPrompt?: boolean;
}

interface WelcomeHeroTileProps {
  username?: string;
  onChangeUsername?: (name: string) => void;
  mascot?: 'robot' | 'beaker' | 'plant' | 'gerbil';
  onSetMascot?: (mascot: 'robot' | 'beaker' | 'plant' | 'gerbil') => void;
  onSetDarkMode?: (isDark: boolean) => void;
  onGetAIAdvisorResponse?: (prompt: string, history?: Array<{ role: string; text: string }>) => Promise<string>;
  onStart: (course?: string, topic?: string) => void;
  onStartExplanation: (course?: string, topic?: string) => void;
  onStartFlashcards: (course?: string, topic?: string) => void;
  onStartCalculation: (course?: string, topic?: string) => void;
  onStartQuizMyNotes: () => void;
  onOpenSimulation?: (view: ViewType) => void;
  onOpenSimulationsHub?: () => void;
  onShowHowItWorks?: () => void;
  onOpenFeatures?: () => void;
  onOpenChangelog?: () => void;
  onOpenSupport?: () => void;
  onOpenSettings?: () => void;
  onOpenTrophyRoom?: () => void;
  onOpenSubjectLibrary?: () => void;
  onOpenReviewGames?: () => void;
  onOpenPracticeCenter?: () => void;
}

export const WelcomeHeroTile: React.FC<WelcomeHeroTileProps> = ({
  username,
  onChangeUsername,
  mascot = 'robot',
  onSetMascot,
  onSetDarkMode,
  onGetAIAdvisorResponse,
  onStart,
  onStartExplanation,
  onStartFlashcards,
  onStartCalculation,
  onStartQuizMyNotes,
  onOpenSimulation,
  onOpenSimulationsHub,
  onShowHowItWorks,
  onOpenFeatures,
  onOpenChangelog,
  onOpenSupport,
  onOpenSettings,
  onOpenTrophyRoom,
  onOpenSubjectLibrary,
  onOpenReviewGames,
  onOpenPracticeCenter
}) => {
  // Username editing
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(username || '');

  useEffect(() => {
    setTempUsername(username || '');
  }, [username]);

  const handleSaveUsername = () => {
    if (onChangeUsername) {
      onChangeUsername(tempUsername.trim());
    }
    setIsEditingUsername(false);
  };

  // Conversational AI Advisor state
  const [detectedCourse, setDetectedCourse] = useState<string | null>(null);
  const [detectedTopic, setDetectedTopic] = useState<string | null>(null);
  const [advisorPrompt, setAdvisorPrompt] = useState('');
  const [advisorMessages, setAdvisorMessages] = useState<AdvisorMessage[]>([]);
  const [isAdvisorLoading, setIsAdvisorLoading] = useState(false);
  const [isAdvisorActive, setIsAdvisorActive] = useState(false);
  const advisorMessagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAdvisorActive) {
      advisorMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [advisorMessages, isAdvisorLoading, isAdvisorActive]);

  useEffect(() => {
    const setupDone = localStorage.getItem('sp_advisor_setup_done');
    if (!setupDone) {
      setIsAdvisorActive(true);
      setAdvisorMessages([
        {
          role: 'model',
          text: "Hi! I'm your science study buddy. Before we start — set things up your way:",
          setupPrompt: true,
        }
      ]);
    }
  }, []);

  const completeSetup = (mascotChoice?: 'robot' | 'beaker' | 'plant' | 'gerbil') => {
    if (mascotChoice && onSetMascot) {
      onSetMascot(mascotChoice);
    }
    localStorage.setItem('sp_advisor_setup_done', 'true');
    setAdvisorMessages(prev => [
      ...prev,
      {
        role: 'model',
        text: "You're all set! Ask me anything — like 'start the gas laws sim' or 'quiz me on photosynthesis.'",
      }
    ]);
  };

  const applyAdvisorAction = (action: unknown) => {
    if (typeof action !== 'object' || action === null) return;
    const act = action as Record<string, unknown>;
    const type = act.type;
    const value = act.value;

    if (type === 'set_dark_mode' && typeof value === 'boolean') {
      onSetDarkMode?.(value);
      setAdvisorMessages(prev => [...prev, { role: 'model', text: `✅ Done — dark mode is ${value ? 'on' : 'off'}!` }]);
    } else if (type === 'set_mascot' && typeof value === 'string' && ['robot', 'beaker', 'plant', 'gerbil'].includes(value)) {
      onSetMascot?.(value as 'robot' | 'beaker' | 'plant' | 'gerbil');
      const mascotNames = { robot: 'Science Bot 🤖', beaker: 'Beaker Buddy 🧪', plant: 'Happy Plant 🌱', gerbil: 'Cool Gerbil 🐹' };
      setAdvisorMessages(prev => [...prev, { role: 'model', text: `✅ Done — switched companion to ${mascotNames[value as keyof typeof mascotNames]}!` }]);
    } else if (type === 'set_username' && typeof value === 'string' && value.trim().length > 0) {
      const cleanName = value.trim().slice(0, 30);
      onChangeUsername?.(cleanName);
      setAdvisorMessages(prev => [...prev, { role: 'model', text: `✅ Done — updated your display name to ${cleanName}!` }]);
    }
  };

  const handleSendAdvisorMessage = async (textToSend?: string) => {
    const promptText = textToSend || advisorPrompt;
    if (!promptText.trim() || isAdvisorLoading) return;
    
    const userMsg: AdvisorMessage = { role: 'user', text: promptText };
    setAdvisorMessages(prev => [...prev, userMsg]);
    setAdvisorPrompt('');
    setIsAdvisorLoading(true);

    try {
      if (onGetAIAdvisorResponse) {
        let reply = await onGetAIAdvisorResponse(promptText, advisorMessages);

        // Parse metadata tag: [[METADATA: {"course": "...", "topic": "..."}]]
        const metadataRegex = /\[\[METADATA:\s*(\{.*?\})\s*\]\]/;
        const match = reply.match(metadataRegex);
        if (match && match[1]) {
          try {
            const meta = JSON.parse(match[1]);
            if (meta.course) setDetectedCourse(meta.course);
            if (meta.topic) setDetectedTopic(meta.topic);
          } catch (e) {
            console.error("Failed to parse Socratic advisor metadata:", e);
          }
          // Strip the metadata tag from the visible text
          reply = reply.replace(metadataRegex, "").trim();
        }

        // Parse action tag: [[ACTION: {"type": "...", "value": ...}]]
        const actionRegex = /\[\[ACTION:\s*(\{.*?\})\s*\]\]/;
        const actionMatch = reply.match(actionRegex);
        if (actionMatch && actionMatch[1]) {
          try {
            const action: unknown = JSON.parse(actionMatch[1]);
            applyAdvisorAction(action);
          } catch (e) {
            console.error("Failed to parse advisor action:", e);
          }
          reply = reply.replace(actionRegex, "").trim();
        }

        setAdvisorMessages(prev => [...prev, { role: 'model', text: reply }]);
      } else {
        setTimeout(() => {
          setAdvisorMessages(prev => [...prev, {
            role: 'model',
            text: `Beep boop! I am here to help you study science! We can use [quiz] to practice questions, [explanation] to chat, or [calculation] for math. What works best for you?`
          }]);
        }, 1000);
      }
    } catch (e) {
      console.error(e);
      setAdvisorMessages(prev => [...prev, { role: 'model', text: "Oh no! I lost my connection. Let's try again! You can also start practicing directly." }]);
    } finally {
      setIsAdvisorLoading(false);
    }
  };

  const renderMessageWithShortcuts = (text: string) => {
    const parts = text.split(/(\[[a-z_:]+\])/g);
    return (
      <div className="space-y-3">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
          {parts.map((part) => {
            if (part.startsWith('[') && part.endsWith(']')) {
              return null;
            }
            return part;
          })}
        </p>
        
        {/* Action buttons list */}
        <div className="flex flex-wrap gap-2 pt-1">
          {parts.map((part, index) => {
            if (part.startsWith('[') && part.endsWith(']')) {
              const modeId = part.slice(1, -1);

              if (modeId.startsWith('sim:')) {
                const sim = SIMULATIONS_REGISTRY.find(s => s.id === modeId.slice(4));
                if (sim && onOpenSimulation) {
                  return (
                    <button
                      key={index}
                      onClick={() => onOpenSimulation(sim.view)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all"
                    >
                      {sim.emoji} Launch {sim.title}
                    </button>
                  );
                }
                return null;
              }

              switch (modeId) {
                case 'quiz':
                  return (
                    <button
                      key={index}
                      onClick={() => onStart(detectedCourse || undefined, detectedTopic || undefined)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all"
                    >
                      🎯 Launch Practice Questions
                    </button>
                  );
                case 'explanation':
                  return (
                    <button
                      key={index}
                      onClick={() => onStartExplanation(detectedCourse || undefined, detectedTopic || undefined)}
                      className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all"
                    >
                      💬 Start Socratic Chat
                    </button>
                  );
                case 'flashcards':
                  return (
                    <button
                      key={index}
                      onClick={() => onStartFlashcards(detectedCourse || undefined, detectedTopic || undefined)}
                      className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all"
                    >
                      🗂️ Flip Flashcards
                    </button>
                  );
                case 'calculation':
                  return (
                    <button
                      key={index}
                      onClick={() => onStartCalculation(detectedCourse || undefined, detectedTopic || undefined)}
                      className="px-3 py-1.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all"
                    >
                      🔢 Solve Calculations
                    </button>
                  );
                case 'notes':
                  return (
                    <button
                      key={index}
                      onClick={onStartQuizMyNotes}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all"
                    >
                      ⚡ Upload Study Notes
                    </button>
                  );
                case 'simulations':
                  return (
                    <button
                      key={index}
                      onClick={onOpenSimulationsHub}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all"
                    >
                      🧪 Open Simulations Hub
                    </button>
                  );
                case 'how_it_works':
                  return onShowHowItWorks ? (
                    <button
                      key={index}
                      onClick={onShowHowItWorks}
                      className="px-3 py-1.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all"
                    >
                      📖 How It Works
                    </button>
                  ) : null;
                case 'features':
                  return onOpenFeatures ? (
                    <button
                      key={index}
                      onClick={onOpenFeatures}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all"
                    >
                      ✨ Feature Tour
                    </button>
                  ) : null;
                case 'changelog':
                  return onOpenChangelog ? (
                    <button
                      key={index}
                      onClick={onOpenChangelog}
                      className="px-3 py-1.5 rounded-xl bg-violet-500 hover:bg-violet-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all"
                    >
                      🆕 What's New
                    </button>
                  ) : null;
                case 'support':
                  return onOpenSupport ? (
                    <button
                      key={index}
                      onClick={onOpenSupport}
                      className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all"
                    >
                      💙 Support the Project
                    </button>
                  ) : null;
                case 'settings':
                  return onOpenSettings ? (
                    <button
                      key={index}
                      onClick={onOpenSettings}
                      className="px-3 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all"
                    >
                      ⚙️ Customize Options & Settings
                    </button>
                  ) : null;
                case 'trophy':
                  return onOpenTrophyRoom ? (
                    <button
                      key={index}
                      onClick={onOpenTrophyRoom}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all"
                    >
                      🏆 Open Trophy Room
                    </button>
                  ) : null;
                case 'subjects':
                  return onOpenSubjectLibrary ? (
                    <button
                      key={index}
                      onClick={onOpenSubjectLibrary}
                      className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all"
                    >
                      📚 Browse Subject Library
                    </button>
                  ) : null;
                case 'review_games':
                  return onOpenReviewGames ? (
                    <button
                      key={index}
                      onClick={onOpenReviewGames}
                      className="px-3 py-1.5 rounded-xl bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-black flex items-center gap-1 shadow-sm transition-all"
                    >
                      🎮 Launch Review Games
                    </button>
                  ) : null;
                default:
                  return null;
              }
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="lg:col-span-2 bento-card active:scale-100 border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
      <div className="flex-1 space-y-4 relative z-10 w-full">
        <div className="inline-block px-3 py-1 rounded-full text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-[#818CF8] uppercase tracking-wider">
          Science Practice AI
        </div>
        
        {/* Friendly, prominent user greeting entry box */}
        <div className="min-h-[5.5rem] flex flex-col justify-center">
          {(!username || isEditingUsername) ? (
            <div className="space-y-2.5 animate-in fade-in duration-300">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#1A1C21] dark:text-[#F8F9FB] font-rounded">
                Hey there! What should we call you? 👋
              </h1>
              <div className="flex items-center gap-2 max-w-sm w-full">
                <input
                  type="text"
                  value={tempUsername}
                  onChange={(e) => setTempUsername(e.target.value)}
                  placeholder="Enter your name... e.g. Alex"
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[#1A1C21] dark:text-white rounded-xl px-3 py-2.5 text-xs font-bold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600"
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
                  autoFocus={isEditingUsername}
                />
                <button
                  onClick={handleSaveUsername}
                  className="btn-squishy px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 shadow-md transition-colors"
                  title="Save Name"
                >
                  Save
                </button>
                {username && (
                  <button
                    onClick={() => {
                      setTempUsername(username);
                      setIsEditingUsername(false);
                    }}
                    className="px-3 py-2.5 bg-slate-100 text-slate-500 rounded-xl text-xs font-black dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ) : (
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight text-[#1A1C21] dark:text-[#F8F9FB] font-rounded flex flex-wrap items-center gap-x-2 gap-y-1">
              <span>Hey there,</span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-[#818CF8]">
                {username}!
              </span>
              <span>👋</span>
              <button
                onClick={() => setIsEditingUsername(true)}
                className="text-xs p-1.5 opacity-50 hover:opacity-100 transition-opacity"
                title="Edit name"
              >
                ✏️
              </button>
            </h1>
          )}
        </div>

        {isAdvisorActive ? (
          <div className="flex-1 flex flex-col justify-between gap-3 h-full min-h-[220px]">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800/80 pb-2">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Study Planner Advisor</span>
              <button
                onClick={() => {
                  setIsAdvisorActive(false);
                  setAdvisorMessages([]);
                }}
                className="text-xs font-black text-indigo-500 dark:text-[#818CF8] hover:underline flex items-center gap-1"
              >
                ← Reset Chat
              </button>
            </div>
            
            {/* Advisor Messages Feed */}
            <div className="flex-1 w-full max-h-[160px] overflow-y-auto space-y-3 pr-2 scrollbar-thin my-1">
              {advisorMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-xs font-semibold leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800/40 rounded-tl-none'
                  }`}>
                    {msg.role === 'user' ? (
                      msg.text
                    ) : msg.setupPrompt ? (
                      <div className="space-y-3">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-relaxed">
                          {msg.text}
                        </p>
                        <div className="space-y-3 pt-1">
                          <div>
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                              Appearance:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => onSetDarkMode?.(false)}
                                className="px-3 py-1.5 min-h-[44px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center"
                              >
                                ☀️ Light
                              </button>
                              <button
                                onClick={() => onSetDarkMode?.(true)}
                                className="px-3 py-1.5 min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all flex items-center"
                              >
                                🌙 Dark
                              </button>
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                              Your Buddy:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => completeSetup('robot')}
                                className="px-3 py-1.5 min-h-[44px] rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold transition-all flex items-center"
                              >
                                🤖 Science Bot
                              </button>
                              <button
                                onClick={() => completeSetup('beaker')}
                                className="px-3 py-1.5 min-h-[44px] rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-bold transition-all flex items-center"
                              >
                                🧪 Beaker Buddy
                              </button>
                              <button
                                onClick={() => completeSetup('plant')}
                                className="px-3 py-1.5 min-h-[44px] rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition-all flex items-center"
                              >
                                🌱 Happy Plant
                              </button>
                              <button
                                onClick={() => completeSetup('gerbil')}
                                className="px-3 py-1.5 min-h-[44px] rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center"
                              >
                                🐹 Cool Gerbil
                              </button>
                            </div>
                          </div>
                          <div className="pt-1">
                            <button
                              onClick={() => completeSetup()}
                              className="text-[10px] font-bold text-slate-400 dark:text-slate-500 hover:underline min-h-[44px] inline-flex items-center"
                            >
                              Skip
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      renderMessageWithShortcuts(msg.text)
                    )}
                  </div>
                </div>
              ))}
              {isAdvisorLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800/40 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs font-semibold text-slate-400 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={advisorMessagesEndRef} />
            </div>

            {/* Advisor Input Bottom */}
            <div className="w-full flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/50">
              <input
                type="text"
                placeholder="Ask your companion more questions..."
                value={advisorPrompt}
                onChange={(e) => setAdvisorPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendAdvisorMessage()}
                className="flex-1 px-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                onClick={() => handleSendAdvisorMessage()}
                className="px-4 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] text-white dark:text-slate-900 text-xs font-black transition-all shadow-sm"
              >
                Send
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-md">
              Ready to learn something new today? Dive into adaptive practice, step-by-step calculations, or interactive simulations!
            </p>
            
            {/* Conversational advisor prompt launcher */}
            <div className="w-full max-w-md relative my-1">
              <input
                type="text"
                placeholder="Ask AI: What should I study today?"
                value={advisorPrompt}
                onChange={(e) => setAdvisorPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (setIsAdvisorActive(true), handleSendAdvisorMessage())}
                className="w-full px-4 py-2.5 pr-10 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button aria-label="Send"
                onClick={() => {
                  setIsAdvisorActive(true);
                  handleSendAdvisorMessage();
                }}
                className="absolute right-1.5 top-1.5 p-1 rounded-lg bg-indigo-500 hover:bg-indigo-600 dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] text-white dark:text-slate-900 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            <div className="pt-1 flex flex-wrap gap-2.5">
              <button
                onClick={() => onStart(detectedCourse || undefined, detectedTopic || undefined)}
                className="btn-squishy bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 text-xs font-black flex items-center gap-1.5 dark:bg-[#818CF8] dark:hover:bg-[#99A4FF] dark:text-slate-900 rounded-xl shadow-md transition-all"
                title="Launch Adaptive Practice Session"
              >
                <span>Adaptive Practice</span>
                <Target className="w-4 h-4" />
              </button>
              <button
                onClick={() => onStartExplanation(detectedCourse || undefined, detectedTopic || undefined)}
                className="btn-squishy px-4 py-2.5 bg-teal-50 dark:bg-teal-950/30 border border-teal-200/50 dark:border-teal-900/30 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/20 text-xs font-black flex items-center gap-1.5 rounded-xl transition-all"
                title="Launch Socratic Study Partner Chat"
              >
                <span>Socratic Chat</span>
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                onClick={() => onStartCalculation(detectedCourse || undefined, detectedTopic || undefined)}
                className="btn-squishy px-4 py-2.5 bg-violet-50 dark:bg-violet-950/30 border border-violet-200/50 dark:border-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/20 text-xs font-black flex items-center gap-1.5 rounded-xl transition-all"
                title="Launch Equation Problem Solver"
              >
                <span>Equation Solver</span>
                <Calculator className="w-4 h-4" />
              </button>
              {onOpenPracticeCenter && (
                <button
                  onClick={onOpenPracticeCenter}
                  className="btn-squishy px-4 py-2.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-black flex items-center gap-1.5 rounded-xl transition-all"
                  title="Browse All Revision Modes"
                >
                  <span>All Modes</span>
                  <Sparkles className="w-4 h-4" />
                </button>
              )}
            </div>
          </>
        )}
      </div>
      
      {/* Floating Mascot Illustration */}
      <div className="w-40 h-40 flex items-center justify-center relative select-none shrink-0">
        <div className="absolute w-32 h-32 bg-indigo-500/10 dark:bg-[#818CF8]/10 rounded-full blur-xl"></div>
        <ScienceBuddyMascot
          size={140}
          mood={isAdvisorLoading ? 'thinking' : isAdvisorActive && advisorMessages.length > 0 ? 'excited' : 'happy'}
          type={mascot}
        />
      </div>
    </div>
  );
};
