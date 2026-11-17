import React, { useState } from 'react';
import {
  Users,
  Timer,
  Zap,
  Play,
  Layers,
  ChevronRight,
  Plus,
  Trash2,
} from 'lucide-react';
import { CourseType } from '../../types';
import {
  RelayConfig,
  RelayGameMode,
  RelayAnsweringModality,
  RelayTeam,
  RelayCard,
} from './relayTypes';
import { RELAY_PRESETS } from './relayPresets';
import { generateRelayDeck } from '../../services/ai/vocabRelay';

interface VocabRelaySetupProps {
  onStartGame: (_config: RelayConfig, _deck: RelayCard[]) => void;
  onBack?: () => void;
  defaultCourse?: CourseType | null;
  defaultTopic?: string | null;
  isGenerating?: boolean;
}

export const VocabRelaySetup: React.FC<VocabRelaySetupProps> = ({
  onStartGame,
  onBack: _onBack,
  defaultCourse,
  defaultTopic,
  isGenerating = false,
}) => {
  const [loadingDeck, setLoadingDeck] = useState<boolean>(false);
  const [gameMode, setGameMode] = useState<RelayGameMode>('pass_and_play');
  const [modality, setModality] = useState<RelayAnsweringModality>('caller_guesser');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(RELAY_PRESETS[0].id);
  const [useCustomTopic, setUseCustomTopic] = useState<boolean>(false);
  const [customCourse, setCustomCourse] = useState<CourseType>(defaultCourse || 'AP Biology');
  const [customTopic, setCustomTopic] = useState<string>(defaultTopic || '');
  const [totalLaps, setTotalLaps] = useState<number>(2);
  const [termsPerRunner, setTermsPerRunner] = useState<number>(4);
  const [turnSeconds, setTurnSeconds] = useState<number>(30);

  // Teams configuration
  const [teams, setTeams] = useState<RelayTeam[]>([
    {
      id: 'team_red',
      name: 'Team Red',
      color: 'rose',
      score: 0,
      currentRunnerIndex: 0,
      runners: ['Runner 1', 'Runner 2', 'Runner 3'],
    },
    {
      id: 'team_blue',
      name: 'Team Blue',
      color: 'indigo',
      score: 0,
      currentRunnerIndex: 0,
      runners: ['Runner 1', 'Runner 2', 'Runner 3'],
    },
  ]);

  const handleAddRunner = (teamIndex: number) => {
    setTeams(prev => {
      const next = [...prev];
      const count = next[teamIndex].runners.length + 1;
      next[teamIndex].runners.push(`Runner ${count}`);
      return next;
    });
  };

  const handleRemoveRunner = (teamIndex: number, runnerIndex: number) => {
    setTeams(prev => {
      const next = [...prev];
      if (next[teamIndex].runners.length > 1) {
        next[teamIndex].runners.splice(runnerIndex, 1);
      }
      return next;
    });
  };

  const handleUpdateRunnerName = (teamIndex: number, runnerIndex: number, name: string) => {
    setTeams(prev => {
      const next = [...prev];
      next[teamIndex].runners[runnerIndex] = name;
      return next;
    });
  };

  const handleStart = async () => {
    const selectedPreset = RELAY_PRESETS.find(p => p.id === selectedPresetId) || RELAY_PRESETS[0];

    const config: RelayConfig = {
      gameMode,
      modality,
      course: useCustomTopic ? customCourse : selectedPreset.course,
      topic: useCustomTopic ? (customTopic.trim() || 'General Science') : selectedPreset.topic,
      totalLaps,
      termsPerRunner,
      turnSeconds,
      teams: gameMode === 'solo_sprint'
        ? [
            {
              id: 'solo_runner',
              name: 'Solo Sprint',
              color: 'cyan',
              score: 0,
              currentRunnerIndex: 0,
              runners: ['Hot-Seat Runner'],
            },
          ]
        : teams,
    };

    if (useCustomTopic && customTopic.trim()) {
      setLoadingDeck(true);
      try {
        const generated = await generateRelayDeck(customCourse, customTopic.trim(), 12);
        if (generated && generated.cards && generated.cards.length > 0) {
          onStartGame(config, generated.cards);
          return;
        }
      } catch (err) {
        console.error('Failed to generate AI relay deck, falling back to preset', err);
      } finally {
        setLoadingDeck(false);
      }
    }

    onStartGame(config, selectedPreset.cards);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Setup Header */}
      <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/60 shadow-xl text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 text-xs font-bold uppercase tracking-wider">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>High-Energy Turn-Based Review Game</span>
        </div>
        <h2 className="text-3xl font-black text-slate-100 tracking-tight">
          Vocab Relay Setup
        </h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto">
          Pass the device or turn as runners race against the clock to describe or identify science concepts.
        </p>
      </div>

      {/* Grid: Game Mode & Answering Modality */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Game Mode */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 shadow-lg space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>1. Match Play Format</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'pass_and_play', label: 'Pass & Play', desc: '1 Device / Team' },
              { id: 'projector_dual', label: 'Projector Dual', desc: 'Red vs Blue' },
              { id: 'solo_sprint', label: 'Solo Sprint', desc: 'Hot-Seat Solo' },
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setGameMode(m.id as RelayGameMode)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  gameMode === m.id
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md'
                    : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold">{m.label}</div>
                <div className="text-[10px] text-slate-300/80 mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Answering Modality */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 shadow-lg space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>2. Answering Modality</span>
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setModality('caller_guesser')}
              className={`p-3 rounded-xl border text-left transition-all ${
                modality === 'caller_guesser'
                  ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="text-xs font-bold">Clue Caller (Taboo)</div>
              <div className="text-[10px] text-slate-300/80 mt-0.5">
                Runner speaks clues; forbidden root words disallowed!
              </div>
            </button>
            <button
              type="button"
              onClick={() => setModality('rapid_choice')}
              className={`p-3 rounded-xl border text-left transition-all ${
                modality === 'rapid_choice'
                  ? 'bg-amber-600 border-amber-400 text-white shadow-md'
                  : 'bg-slate-900/80 border-slate-700 text-slate-300 hover:border-slate-600'
              }`}
            >
              <div className="text-xs font-bold">Rapid 4-Choice Grid</div>
              <div className="text-[10px] text-slate-300/80 mt-0.5">
                Active recall reading definition, tapping correct term.
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Curriculum Topic Selection */}
      <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>3. Curriculum Word Bank</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setUseCustomTopic(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                !useCustomTopic
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Curated Decks
            </button>
            <button
              type="button"
              onClick={() => setUseCustomTopic(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                useCustomTopic
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Custom AI Topic
            </button>
          </div>
        </div>

        {!useCustomTopic ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RELAY_PRESETS.map(p => (
              <div
                key={p.id}
                onClick={() => setSelectedPresetId(p.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  selectedPresetId === p.id
                    ? 'bg-emerald-950/60 border-emerald-500 shadow-md ring-1 ring-emerald-500/50'
                    : 'bg-slate-900/80 border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  {p.course}
                </div>
                <div className="text-sm font-bold text-slate-100 mt-0.5">{p.title}</div>
                <div className="text-[11px] text-slate-400 mt-1">{p.topic}</div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">{p.cards.length} ready terms</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Target Course</label>
              <input
                type="text"
                value={customCourse}
                onChange={e => setCustomCourse(e.target.value as CourseType)}
                placeholder="e.g. AP Chemistry"
                className="w-full bg-slate-900 text-slate-200 text-sm rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-400 block mb-1">Topic / Unit</label>
              <input
                type="text"
                value={customTopic}
                onChange={e => setCustomTopic(e.target.value)}
                placeholder="e.g. Acids, Bases and Titration Curves"
                className="w-full bg-slate-900 text-slate-200 text-sm rounded-xl px-3 py-2 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>
          </div>
        )}
      </div>

      {/* Pacing & Runners Setup */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pacing Knobs */}
        <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 shadow-lg space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Timer className="w-4 h-4 text-cyan-400" />
            <span>4. Round Parameters</span>
          </label>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Total Laps (Rounds):</span>
                <span className="font-bold text-cyan-400">{totalLaps}</span>
              </div>
              <input
                type="range"
                min={1}
                max={3}
                value={totalLaps}
                onChange={e => setTotalLaps(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Terms per Runner:</span>
                <span className="font-bold text-cyan-400">{termsPerRunner}</span>
              </div>
              <input
                type="range"
                min={3}
                max={6}
                value={termsPerRunner}
                onChange={e => setTermsPerRunner(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 mb-1">
                <span>Timer per Term:</span>
                <span className="font-bold text-cyan-400">{turnSeconds}s</span>
              </div>
              <input
                type="range"
                min={15}
                max={45}
                step={5}
                value={turnSeconds}
                onChange={e => setTurnSeconds(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500"
              />
            </div>
          </div>
        </div>

        {/* Team Rosters (2 columns) */}
        {gameMode !== 'solo_sprint' && (
          <div className="md:col-span-2 bg-slate-800/80 rounded-2xl p-5 border border-slate-700/60 shadow-lg space-y-4">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-rose-400" />
              <span>5. Team Rosters</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {teams.map((team, tIdx) => (
                <div
                  key={team.id}
                  className="bg-slate-900/90 rounded-xl p-3 border border-slate-700/80 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={team.name}
                      onChange={e => {
                        const val = e.target.value;
                        setTeams(prev => {
                          const n = [...prev];
                          n[tIdx].name = val;
                          return n;
                        });
                      }}
                      className="bg-transparent font-bold text-sm text-slate-100 border-b border-transparent hover:border-slate-600 focus:border-indigo-400 focus:outline-none px-1"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddRunner(tIdx)}
                      className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold"
                    >
                      <Plus className="w-3 h-3" />
                      Add Runner
                    </button>
                  </div>

                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {team.runners.map((runner, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-500 w-4">
                          {rIdx + 1}.
                        </span>
                        <input
                          type="text"
                          value={runner}
                          onChange={e => handleUpdateRunnerName(tIdx, rIdx, e.target.value)}
                          className="flex-1 bg-slate-800 text-xs rounded px-2 py-1 text-slate-200 border border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                        {team.runners.length > 1 && (
                          <button aria-label="Remove runner"
                            type="button"
                            onClick={() => handleRemoveRunner(tIdx, rIdx)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Start Button */}
      <div className="pt-2 text-center">
        <button
          type="button"
          onClick={handleStart}
          disabled={isGenerating || loadingDeck}
          className="px-8 py-3.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 hover:from-indigo-600 hover:to-rose-600 disabled:opacity-50 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] flex items-center gap-2 mx-auto"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>{loadingDeck || isGenerating ? 'Generating Relay Word Deck...' : 'Start Vocab Relay!'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
