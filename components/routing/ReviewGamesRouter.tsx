import React from 'react';
import { CourseType, WhoAmIPuzzle } from '../../types';
import SEO from '../SEO';
import { ErrorBoundary } from '../ErrorBoundary';

const ReviewGamesView = React.lazy(() => import('../ReviewGamesView'));
const JeopardyGame = React.lazy(() => import('../jeopardy/JeopardyGame'));
const JeopardyLayout = React.lazy(() => import('../jeopardy/JeopardyLayout'));
const SquareMatchView = React.lazy(() => import('../SquareMatchView'));
const WhoAmISetupView = React.lazy(() => import('../WhoAmISetupView'));
const WhoAmIPreviewView = React.lazy(() => import('../WhoAmIPreviewView'));
const WhoAmIGameView = React.lazy(() => import('../WhoAmIGameView'));
const BingoGameView = React.lazy(() => import('../bingo/BingoGameView'));
const CharadesGameView = React.lazy(() => import('../charades/CharadesGameView'));
const TabooGameView = React.lazy(() => import('../taboo/TabooGameView'));
const VocabRelayView = React.lazy(() => import('../relay/VocabRelayView'));

export const REVIEW_GAME_VIEWS = new Set<string>([
  'review_games',
  'square_match_setup',
  'bingo_setup',
  'charades_setup',
  'taboo_setup',
  'jeopardy_setup',
  'who_am_i_setup',
  'who_am_i_preview',
  'who_am_i_game',
  'vocab_relay'
]);

interface ReviewGamesRouterProps {
  view: string;
  selectedCourse?: CourseType | null;
  selectedTopic?: string | null;
  whoAmIPuzzles?: WhoAmIPuzzle[];
  isPreparingQuiz: boolean;
  onBackToLanding: () => void;
  onNavigate: (view: string, mode?: string) => void;
  onStartWhoAmIGeneration: (course: CourseType, topic: string, opts?: { count?: number; difficultyMix?: 'easier' | 'mixed' | 'harder'; silliness?: number; sourceContext?: string }) => void;
  onLoadWhoAmIGame: (puzzles: WhoAmIPuzzle[], course: string, topic: string) => void;
  onUpdateWhoAmIPuzzles: (puzzles: WhoAmIPuzzle[]) => void;
  onStartWhoAmIGame: (puzzles: WhoAmIPuzzle[]) => void;
  onRegenerateWhoAmIClues: (puzzleIndex: number, difficulty?: 'easier' | 'harder') => void | Promise<void>;
}

export const ReviewGamesRouter: React.FC<ReviewGamesRouterProps> = ({
  view,
  selectedCourse,
  selectedTopic,
  whoAmIPuzzles,
  isPreparingQuiz,
  onBackToLanding,
  onNavigate,
  onStartWhoAmIGeneration,
  onLoadWhoAmIGame,
  onUpdateWhoAmIPuzzles,
  onStartWhoAmIGame,
  onRegenerateWhoAmIClues
}) => {
  const renderReviewGame = () => {
    if (view === 'review_games') {
      return (
      <ReviewGamesView
        onBack={onBackToLanding}
        onStartJeopardy={() => onNavigate('jeopardy_setup', 'jeopardy')}
        onStartSquareMatch={() => onNavigate('square_match_setup', 'square_match')}
        onStartWhoAmI={() => onNavigate('who_am_i_setup', 'who_am_i')}
        onStartBingo={() => onNavigate('bingo_setup', 'bingo')}
        onStartCharades={() => onNavigate('charades_setup', 'review_games')}
        onStartTaboo={() => onNavigate('taboo_setup', 'review_games')}
        onStartVocabRelay={() => onNavigate('vocab_relay', 'review_games')}
      />
    );
  }

  if (view === 'square_match_setup') {
    return (
      <>
        <SEO title="Square Match Puzzle" />
        <SquareMatchView
          onBack={() => onNavigate('review_games', 'review_games')}
          course={selectedCourse ?? null}
          topic={selectedTopic ?? null}
        />
      </>
    );
  }

  if (view === 'bingo_setup') {
    return (
      <>
        <SEO title="Science Bingo" />
        <BingoGameView
          onBack={() => onNavigate('review_games', 'review_games')}
          course={selectedCourse ?? null}
          topic={selectedTopic ?? null}
        />
      </>
    );
  }

  if (view === 'charades_setup') {
    return (
      <>
        <SEO title="Science Charades" />
        <CharadesGameView
          onBack={() => onNavigate('review_games', 'review_games')}
          course={selectedCourse ?? null}
          topic={selectedTopic ?? null}
        />
      </>
    );
  }

  if (view === 'taboo_setup') {
    return (
      <>
        <SEO title="Science Taboo" />
        <TabooGameView
          onBack={() => onNavigate('review_games', 'review_games')}
          course={selectedCourse ?? null}
          topic={selectedTopic ?? null}
        />
      </>
    );
  }

  if (view === 'jeopardy_setup') {
    return (
      <>
        <SEO title="Jeopardy Game" />
        <JeopardyLayout onExit={() => onNavigate('review_games')}>
          <JeopardyGame />
        </JeopardyLayout>
      </>
    );
  }

  if (view === 'who_am_i_setup') {
    return (
      <>
        <SEO title="Who Am I? Setup" />
        <WhoAmISetupView
          onBack={() => onNavigate('review_games')}
          onGenerate={onStartWhoAmIGeneration}
          onLoadGame={onLoadWhoAmIGame}
          isLoading={isPreparingQuiz}
          defaultCourse={selectedCourse ?? null}
          defaultTopic={selectedTopic ?? null}
        />
      </>
    );
  }

  if (view === 'who_am_i_preview') {
    return (
      <>
        <SEO title={`Who Am I? Preview - ${selectedTopic || selectedCourse || 'Review Game'}`} />
        <WhoAmIPreviewView
          puzzles={whoAmIPuzzles || []}
          course={selectedCourse || 'Custom Practice'}
          topic={selectedTopic || ''}
          onBack={() => onNavigate('who_am_i_setup')}
          onStartGame={onStartWhoAmIGame}
          onRegenerateClues={onRegenerateWhoAmIClues}
          onLoadGame={onUpdateWhoAmIPuzzles}
          isRegenerating={isPreparingQuiz}
        />
      </>
    );
  }

  if (view === 'who_am_i_game') {
    return (
      <>
        <SEO title={`Who Am I? - ${selectedTopic || selectedCourse || 'Game'}`} />
        <WhoAmIGameView
          puzzles={whoAmIPuzzles || []}
          onBack={() => onNavigate('who_am_i_preview')}
        />
      </>
    );
  }

    if (view === 'vocab_relay') {
      return (
        <>
          <SEO title="Vocab Relay Game" />
          <VocabRelayView
            onBack={() => onNavigate('review_games', 'review_games')}
          />
        </>
      );
    }

    return null;
  };

  const isHub = view === 'review_games';

  return (
    <ErrorBoundary
      fallbackTitle="Review Game Error"
      fallbackMessage="An unexpected issue occurred while running this review game."
      onReset={() => {
        if (isHub) {
          onBackToLanding();
        } else {
          onNavigate('review_games');
        }
      }}
      resetLabel={isHub ? "Return to Home" : "Return to Review Games"}
    >
      {renderReviewGame()}
    </ErrorBoundary>
  );
};
