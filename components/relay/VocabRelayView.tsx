import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  RelayConfig,
  RelayCard,
  RelayTeam,
  RelayGameStats,
} from './relayTypes';
import { VocabRelaySetup } from './VocabRelaySetup';
import { VocabRelayCard } from './VocabRelayCard';
import { VocabRelayBatonPass } from './VocabRelayBatonPass';
import { VocabRelayResults } from './VocabRelayResults';
import { VOCAB_RELAY_ABOUT } from './VocabRelayAbout';
import {
  calculateTermScore,
  calculateCleanLegBonus,
  shuffleArray,
} from '../../services/relayEngine';
import {
  playCorrectSound,
  playPassSound,
  playTimerTick,
} from './relayAudio';
import SimulationHeader from '../simulations/shared/SimulationHeader';
import AboutPanel from '../simulations/shared/AboutPanel';
import { Timer } from 'lucide-react';

interface VocabRelayViewProps {
  onBack: () => void;
}

type GamePhase = 'setup' | 'playing' | 'baton_pass' | 'game_over';

export const VocabRelayView: React.FC<VocabRelayViewProps> = ({ onBack }) => {
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [showAbout, setShowAbout] = useState(false);

  // Match Configuration & Active State
  const [config, setConfig] = useState<RelayConfig | null>(null);
  const [deck, setDeck] = useState<RelayCard[]>([]);
  const [teams, setTeams] = useState<RelayTeam[]>([]);
  const [currentLap, setCurrentLap] = useState<number>(1);
  const [currentTeamIndex, setCurrentTeamIndex] = useState<number>(0);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [streak, setStreak] = useState<number>(0);

  // Current Leg State
  const [legTermCount, setLegTermCount] = useState<number>(0);
  const [legPoints, setLegPoints] = useState<number>(0);
  const [legHadPass, setLegHadPass] = useState<boolean>(false);
  const [cleanLegBonusEarned, setCleanLegBonusEarned] = useState<number>(0);

  // Transition Handoff Names
  const [incomingRunnerName, setIncomingRunnerName] = useState<string>('');
  const [nextRunnerName, setNextRunnerName] = useState<string>('');

  // Overall Match Stats
  const [stats, setStats] = useState<RelayGameStats>({
    totalTerms: 0,
    totalCorrect: 0,
    totalPassed: 0,
    fastestAnswerSeconds: 999,
    cleanLegsCount: 0,
    answers: [],
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start a new game session
  const handleStartGame = (newConfig: RelayConfig, initialDeck: RelayCard[]) => {
    setConfig(newConfig);
    const shuffled = shuffleArray(initialDeck);
    setDeck(shuffled);
    setTeams(newConfig.teams.map((t) => ({ ...t, score: 0, currentRunnerIndex: 0 })));
    setCurrentLap(1);
    setCurrentTeamIndex(0);
    setCurrentCardIndex(0);
    setSecondsRemaining(newConfig.turnSeconds);
    setStreak(0);
    setLegTermCount(0);
    setLegPoints(0);
    setLegHadPass(false);
    setCleanLegBonusEarned(0);

    setStats({
      totalTerms: 0,
      totalCorrect: 0,
      totalPassed: 0,
      fastestAnswerSeconds: 999,
      cleanLegsCount: 0,
      answers: [],
    });

    setPhase('playing');
  };

  // Helper to get active team and runner
  const activeTeam = teams[currentTeamIndex] || teams[0];
  const activeRunnerName =
    activeTeam && activeTeam.runners.length > 0
      ? activeTeam.runners[activeTeam.currentRunnerIndex % activeTeam.runners.length]
      : 'Runner 1';

  const activeCard = useMemo(() => {
    return (
      deck[currentCardIndex % (deck.length || 1)] || {
        id: 'placeholder',
        term: 'Ready',
        category: 'Science',
        definition: 'Ready to sprint!',
        clueKeywords: [],
        tabooWords: [],
      }
    );
  }, [deck, currentCardIndex]);

  // Turn Progression Logic
  const completeLegAndAdvance = useCallback(
    (lastAnswerPoints: number, hadPassesInLeg: boolean) => {
      if (!config) return;

      const totalLegPoints = legPoints + lastAnswerPoints;
      const cleanBonus = calculateCleanLegBonus(totalLegPoints, hadPassesInLeg);

      // Update current team score with clean bonus
      const updatedTeams = teams.map((t, idx) => {
        if (idx === currentTeamIndex) {
          return {
            ...t,
            score: t.score + cleanBonus,
          };
        }
        return t;
      });
      setTeams(updatedTeams);
      setCleanLegBonusEarned(cleanBonus);

      if (cleanBonus > 0) {
        setStats((prev) => ({
          ...prev,
          cleanLegsCount: prev.cleanLegsCount + 1,
        }));
      }

      const incomingName = activeRunnerName;
      setIncomingRunnerName(incomingName);

      // Determine next team & next runner
      let nextTeamIdx = currentTeamIndex;
      let nextLap = currentLap;
      let isMatchOver = false;

      if (config.gameMode === 'pass_and_play' || config.gameMode === 'projector_dual') {
        // Rotate through teams
        nextTeamIdx = (currentTeamIndex + 1) % teams.length;
        if (nextTeamIdx === 0) {
          // All teams completed this round of legs
          // Advance runners within teams
          const advancedRunnersTeams = updatedTeams.map((t) => ({
            ...t,
            currentRunnerIndex: t.currentRunnerIndex + 1,
          }));
          setTeams(advancedRunnersTeams);

          // Check if lap completed
          const runnersPerTeam = teams[0].runners.length;
          const currentLegRound = updatedTeams[0].currentRunnerIndex + 1;
          if (currentLegRound >= runnersPerTeam) {
            if (currentLap >= config.totalLaps) {
              isMatchOver = true;
            } else {
              nextLap = currentLap + 1;
              setCurrentLap(nextLap);
              // Reset runner indices for next lap
              setTeams(advancedRunnersTeams.map((t) => ({ ...t, currentRunnerIndex: 0 })));
            }
          }
        }
      } else {
        // Solo Sprint mode
        const currentRunnerIdx = updatedTeams[0].currentRunnerIndex + 1;
        const totalRunners = updatedTeams[0].runners.length;
        if (currentRunnerIdx >= totalRunners) {
          if (currentLap >= config.totalLaps) {
            isMatchOver = true;
          } else {
            nextLap = currentLap + 1;
            setCurrentLap(nextLap);
            setTeams(updatedTeams.map((t) => ({ ...t, currentRunnerIndex: 0 })));
          }
        } else {
          setTeams(
            updatedTeams.map((t) => ({
              ...t,
              currentRunnerIndex: currentRunnerIdx,
            }))
          );
        }
      }

      if (isMatchOver) {
        setPhase('game_over');
      } else {
        const nextTeam = updatedTeams[nextTeamIdx];
        const nextRunner =
          nextTeam && nextTeam.runners.length > 0
            ? nextTeam.runners[nextTeam.currentRunnerIndex % nextTeam.runners.length]
            : 'Next Runner';
        setNextRunnerName(nextRunner);
        setCurrentTeamIndex(nextTeamIdx);
        setPhase('baton_pass');
      }
    },
    [
      config,
      currentLap,
      currentTeamIndex,
      legPoints,
      teams,
      activeRunnerName,
    ]
  );

  // Handler: Term Correct
  const handleCorrect = useCallback(() => {
    if (!config || phase !== 'playing') return;

    playCorrectSound();
    const timeSpent = config.turnSeconds - secondsRemaining;
    const { points } = calculateTermScore(
      true,
      timeSpent,
      config.turnSeconds,
      streak
    );

    // Update Team Score
    setTeams((prevTeams) =>
      prevTeams.map((t, idx) =>
        idx === currentTeamIndex ? { ...t, score: t.score + points } : t
      )
    );

    // Update Stats
    setStats((prev) => ({
      ...prev,
      totalTerms: prev.totalTerms + 1,
      totalCorrect: prev.totalCorrect + 1,
      fastestAnswerSeconds: Math.min(prev.fastestAnswerSeconds, timeSpent),
      answers: [
        ...prev.answers,
        {
          term: activeCard.term,
          category: activeCard.category,
          correct: true,
          timeSpentSeconds: timeSpent,
          teamId: activeTeam.id,
          runnerName: activeRunnerName,
          lap: currentLap,
          pointsEarned: points,
        },
      ],
    }));

    const nextStreak = streak + 1;
    setStreak(nextStreak);

    const nextLegTermCount = legTermCount + 1;
    setLegPoints((prev) => prev + points);

    if (nextLegTermCount >= config.termsPerRunner) {
      completeLegAndAdvance(points, legHadPass);
    } else {
      setLegTermCount(nextLegTermCount);
      setCurrentCardIndex((prev) => prev + 1);
      setSecondsRemaining(config.turnSeconds);
    }
  }, [
    config,
    phase,
    secondsRemaining,
    streak,
    currentTeamIndex,
    activeCard,
    activeTeam,
    activeRunnerName,
    currentLap,
    legTermCount,
    legHadPass,
    completeLegAndAdvance,
  ]);

  // Handler: Pass / Skip
  const handlePass = useCallback(() => {
    if (!config || phase !== 'playing') return;

    playPassSound();
    const timeSpent = config.turnSeconds - secondsRemaining;

    // Record passed answer
    setStats((prev) => ({
      ...prev,
      totalTerms: prev.totalTerms + 1,
      totalPassed: prev.totalPassed + 1,
      answers: [
        ...prev.answers,
        {
          term: activeCard.term,
          category: activeCard.category,
          correct: false,
          timeSpentSeconds: timeSpent,
          teamId: activeTeam.id,
          runnerName: activeRunnerName,
          lap: currentLap,
          pointsEarned: 0,
        },
      ],
    }));

    setStreak(0);
    setLegHadPass(true);

    const nextLegTermCount = legTermCount + 1;
    if (nextLegTermCount >= config.termsPerRunner) {
      completeLegAndAdvance(0, true);
    } else {
      setLegTermCount(nextLegTermCount);
      setCurrentCardIndex((prev) => prev + 1);
      setSecondsRemaining(config.turnSeconds);
    }
  }, [
    config,
    phase,
    secondsRemaining,
    activeCard,
    activeTeam,
    activeRunnerName,
    currentLap,
    legTermCount,
    completeLegAndAdvance,
  ]);

  // Timer Interval Effect
  useEffect(() => {
    if (phase !== 'playing' || !config) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Time expired for this term
          handlePass();
          return config.turnSeconds;
        }
        if (prev <= 6 && prev > 1) {
          playTimerTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase, config, handlePass]);

  // Handoff to Next Runner
  const handleReadyAfterBatonPass = () => {
    if (!config) return;
    setLegTermCount(0);
    setLegPoints(0);
    setLegHadPass(false);
    setCleanLegBonusEarned(0);
    setSecondsRemaining(config.turnSeconds);
    setStreak(0);
    setCurrentCardIndex((prev) => prev + 1);
    setPhase('playing');
  };

  // Restart match
  const handlePlayAgain = () => {
    setPhase('setup');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-6 flex flex-col items-center max-w-full overflow-x-hidden">
      <div className="w-full max-w-5xl">
        <SimulationHeader
          title="Vocab Relay"
          icon={Timer}
          onBack={onBack}
          gradient="from-indigo-600 to-purple-600"
          onOpenAbout={() => setShowAbout(true)}
        />

        {/* Phase 1: Setup View */}
        {phase === 'setup' && (
          <VocabRelaySetup onStartGame={handleStartGame} onBack={onBack} />
        )}

        {/* Phase 2: Active Gameplay Card */}
        {phase === 'playing' && config && activeTeam && (
          <VocabRelayCard
            card={activeCard}
            allCardsInDeck={deck}
            modality={config.modality}
            team={activeTeam}
            runnerName={activeRunnerName}
            currentTermIndex={legTermCount}
            totalTermsInLeg={config.termsPerRunner}
            lap={currentLap}
            totalLaps={config.totalLaps}
            secondsRemaining={secondsRemaining}
            maxTurnSeconds={config.turnSeconds}
            streak={streak}
            onCorrect={handleCorrect}
            onPass={handlePass}
          />
        )}

        {/* Phase 3: Baton Pass Transition Modal */}
        {phase === 'baton_pass' && config && (
          <VocabRelayBatonPass
            incomingRunnerName={incomingRunnerName}
            nextRunnerName={nextRunnerName}
            team={activeTeam}
            lap={currentLap}
            totalLaps={config.totalLaps}
            legPoints={legPoints}
            cleanLegBonus={cleanLegBonusEarned}
            termsAnswered={legTermCount}
            onReady={handleReadyAfterBatonPass}
          />
        )}

        {/* Phase 4: Final Match Podium & Analytics */}
        {phase === 'game_over' && config && (
          <VocabRelayResults
            config={config}
            stats={stats}
            teams={teams}
            onPlayAgain={handlePlayAgain}
            onExit={onBack}
          />
        )}
      </div>

      {/* About & Pedagogical How-To Guide Panel */}
      <AboutPanel
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        content={VOCAB_RELAY_ABOUT}
      />
    </div>
  );
};

export default VocabRelayView;
