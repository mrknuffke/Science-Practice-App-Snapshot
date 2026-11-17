import React, { useState, useEffect, useRef } from 'react';
import { Flashcard } from '../../types';
import { Eye, Check, X } from 'lucide-react';

interface ImageOcclusionCardContentProps {
  card: Flashcard;
  isFlipped: boolean;
  onCorrect?: () => void;
  onIncorrect?: () => void;
}

export const ImageOcclusionCardContent: React.FC<ImageOcclusionCardContentProps> = ({
  card,
  isFlipped,
  onCorrect,
  onIncorrect,
}) => {
  const [userGuess, setUserGuess] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);
  const [feedback, setFeedback] = useState<'none' | 'correct' | 'incorrect'>('none');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync with card flips
  useEffect(() => {
    if (isFlipped) {
      setIsRevealed(true);
    }
  }, [isFlipped]);

  // Reset when card changes
  useEffect(() => {
    setUserGuess('');
    setIsRevealed(false);
    setFeedback('none');
    setShake(false);
  }, [card.id]);

  const targetMask = card.occlusionMasks?.find(m => m.isTarget) || card.occlusionMasks?.[0];

  const cleanString = (s: string) => s
    .toLowerCase()
    .replace(/^(the|a|an)\s+/i, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();

  const handleCheck = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userGuess.trim() || !targetMask) return;

    const normInput = cleanString(userGuess);
    const normTarget = cleanString(targetMask.label);
    const normDef = cleanString(card.definition);

    const isMatch = normInput === normTarget || normInput === normDef || (
      normInput.length >= 4 && (normTarget.includes(normInput) || normDef.includes(normInput))
    );

    setIsRevealed(true);

    if (isMatch) {
      setFeedback('correct');
      if (onCorrect) onCorrect();
    } else {
      setFeedback('incorrect');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      if (onIncorrect) onIncorrect();
    }
  };

  const handleToggleReveal = () => {
    setIsRevealed(prev => !prev);
  };

  return (
    <div className="w-full flex flex-col items-center select-none">
      {/* SVG Diagram Canvas with Occlusion Masks */}
      <div className="relative w-full max-w-lg bg-slate-950/40 rounded-xl border border-slate-700/60 overflow-hidden shadow-inner p-2 flex items-center justify-center">
        <svg
          viewBox={card.occlusionViewBox || '0 0 600 400'}
          className="w-full h-auto max-h-[300px]"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Base Diagram SVG */}
          {card.occlusionSvg && (
            <g dangerouslySetInnerHTML={{ __html: card.occlusionSvg }} />
          )}

          {/* Occlusion Masks */}
          {card.occlusionMasks?.map(mask => {
            const isTarget = mask.id === targetMask?.id;
            const revealed = isRevealed || (!isTarget);

            if (isTarget) {
              return (
                <g
                  key={mask.id}
                  transform={`translate(${mask.x}, ${mask.y})`}
                  className="cursor-pointer transition-transform"
                  onClick={e => {
                    e.stopPropagation();
                    handleToggleReveal();
                  }}
                >
                  {/* Occluded Box Outline & Shadow */}
                  <rect
                    x="0"
                    y="0"
                    width={mask.width}
                    height={mask.height}
                    rx="6"
                    fill={revealed ? '#064e3b' : '#b45309'}
                    stroke={revealed ? '#10b981' : '#f59e0b'}
                    strokeWidth="2.5"
                    className="transition-all duration-200"
                  />

                  {/* Pulsing ring when occluded */}
                  {!revealed && (
                    <rect
                      x="-2"
                      y="-2"
                      width={mask.width + 4}
                      height={mask.height + 4}
                      rx="8"
                      fill="none"
                      stroke="#f59e0b"
                      strokeWidth="2"
                      opacity="0.6"
                      className="animate-pulse"
                    />
                  )}

                  {/* Label or Question Mark Text */}
                  <text
                    x={mask.width / 2}
                    y={mask.height / 2 + 5}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={revealed ? '12' : '14'}
                    fontWeight="bold"
                    fontFamily="system-ui, sans-serif"
                  >
                    {revealed ? mask.label : '[ ? ] Reveal'}
                  </text>
                </g>
              );
            }

            // Non-target mask: semi-transparent context marker
            return (
              <g
                key={mask.id}
                transform={`translate(${mask.x}, ${mask.y})`}
                opacity="0.75"
              >
                <rect
                  x="0"
                  y="0"
                  width={mask.width}
                  height={mask.height}
                  rx="4"
                  fill="#1e293b"
                  stroke="#475569"
                  strokeWidth="1"
                />
                <text
                  x={mask.width / 2}
                  y={mask.height / 2 + 4}
                  textAnchor="middle"
                  fill="#cbd5e1"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="system-ui, sans-serif"
                >
                  {mask.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active Recall Input & Reveal Bar */}
      <div
        className={`mt-4 w-full max-w-md flex flex-col gap-2 ${
          shake ? 'animate-shake' : ''
        }`}
        onClick={e => e.stopPropagation()}
      >
        <form onSubmit={handleCheck} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={userGuess}
            onChange={e => setUserGuess(e.target.value)}
            disabled={isRevealed && feedback === 'correct'}
            placeholder="Identify the masked feature [ ? ]..."
            className="flex-1 bg-slate-900 text-slate-100 text-xs px-3 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
          />
          <button
            type="submit"
            disabled={!userGuess.trim()}
            className="px-3 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-semibold text-xs rounded-lg shadow-sm transition-all"
          >
            Check
          </button>
          <button aria-label={isRevealed ? 'Hide labels' : 'Show labels'} aria-pressed={isRevealed}
            type="button"
            onClick={handleToggleReveal}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-lg transition-colors border border-slate-700"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Feedback Banner */}
        {feedback !== 'none' && (
          <div
            className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
              feedback === 'correct'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }`}
          >
            <span className="flex items-center gap-1.5 font-medium">
              {feedback === 'correct' ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Accurate: {targetMask?.label || card.definition}</span>
                </>
              ) : (
                <>
                  <X className="w-4 h-4 text-rose-400" />
                  <span>Expected: {targetMask?.label || card.definition}</span>
                </>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
