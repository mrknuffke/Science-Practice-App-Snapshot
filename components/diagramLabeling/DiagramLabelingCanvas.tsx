import React, { useState, useRef } from 'react';
import { DiagramPreset, DiagramEvaluation, DiagramViewMode } from './diagramLabelingTypes';
import { ZoomIn, ZoomOut, RotateCcw, Check, X } from 'lucide-react';

interface DiagramLabelingCanvasProps {
  preset: DiagramPreset;
  viewMode: DiagramViewMode;
  userGuesses: Record<string, string>;
  selectedCalloutId: string | null;
  evaluation: DiagramEvaluation | null;
  onSelectCallout: (calloutId: string) => void;
  onUpdateGuess?: (calloutId: string, guess: string) => void;
}

export const DiagramLabelingCanvas: React.FC<DiagramLabelingCanvasProps> = ({
  preset,
  viewMode,
  userGuesses,
  selectedCalloutId,
  evaluation,
  onSelectCallout,
  onUpdateGuess: _onUpdateGuess,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredCalloutId, setHoveredCalloutId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.75));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    // Only start pan if clicking the background, not a button/pin
    if ((e.target as HTMLElement).tagName === 'svg' || (e.target as HTMLElement).id === 'canvas-bg') {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPan({
      x: e.clientX - startPan.x,
      y: e.clientY - startPan.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Find active callout for quick tooltips/cards
  const activeCallout = preset.callouts.find(
    c => c.id === (hoveredCalloutId || selectedCalloutId)
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[540px] bg-slate-950/40 dark:bg-slate-900/60 rounded-xl border border-slate-700/50 overflow-hidden flex flex-col select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Zoom / Pan Toolbar Overlay */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-700/60 shadow-lg text-xs text-slate-300">
        <button
          onClick={handleZoomIn}
          title="Zoom In"
          className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <span className="w-10 text-center font-mono font-medium">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomOut}
          title="Zoom Out"
          className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-3.5 bg-slate-700 mx-0.5" />
        <button
          onClick={handleResetView}
          title="Reset Zoom & Pan"
          className="p-1 rounded hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Mode Status Pill Overlay */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-sm border ${
          viewMode === 'study'
            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        }`}>
          <span className={`w-2 h-2 rounded-full ${viewMode === 'study' ? 'bg-blue-400 animate-pulse' : 'bg-emerald-400'}`} />
          {viewMode === 'study' ? 'Study Mode: Click pins to explore' : 'Quiz Mode: Label the pins'}
        </span>
      </div>

      {/* SVG Canvas Container */}
      <div className="w-full flex-1 relative flex items-center justify-center overflow-hidden">
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isPanning ? 'none' : 'transform 0.15s ease-out',
            width: '100%',
            height: '100%',
          }}
          className="flex items-center justify-center cursor-grab active:cursor-grabbing"
        >
          <svg
            viewBox={preset.viewBox}
            className="w-full h-full max-h-[500px]"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Background Rect for catching clicks */}
            <rect id="canvas-bg" width="100%" height="100%" fill="transparent" />

            {/* Injected Preset Scientific Diagram Markup */}
            <g
              dangerouslySetInnerHTML={{ __html: preset.svgMarkup }}
              style={{ pointerEvents: 'none' }}
            />

            {/* Interactive Callout Pins */}
            {preset.callouts.map(callout => {
              const isSelected = selectedCalloutId === callout.id;
              const isHovered = hoveredCalloutId === callout.id;
              const guess = userGuesses[callout.id];
              const att = evaluation?.attempts[callout.id];
              const isEvaluated = !!evaluation;

              // Color scheme based on state
              let pinBg = '#3b82f6'; // default blue
              let pinBorder = '#1d4ed8';
              let pinText = '#ffffff';

              if (isEvaluated && att) {
                if (att.isCorrect) {
                  pinBg = '#10b981'; // green
                  pinBorder = '#047857';
                } else {
                  pinBg = '#ef4444'; // red
                  pinBorder = '#b91c1c';
                }
              } else if (guess && guess.trim()) {
                pinBg = '#0284c7'; // answered
                pinBorder = '#0369a1';
              } else if (isSelected) {
                pinBg = '#f59e0b'; // amber selected
                pinBorder = '#d97706';
              }

              return (
                <g
                  key={callout.id}
                  transform={`translate(${callout.x}, ${callout.y})`}
                  className="cursor-pointer transition-transform"
                  onClick={e => {
                    e.stopPropagation();
                    onSelectCallout(callout.id);
                  }}
                  onMouseEnter={() => setHoveredCalloutId(callout.id)}
                  onMouseLeave={() => setHoveredCalloutId(null)}
                >
                  {/* Outer Pulsing Ring when selected or active in Study mode */}
                  {(isSelected || (viewMode === 'study' && isHovered)) && (
                    <circle
                      cx="0"
                      cy="0"
                      r="22"
                      fill="none"
                      stroke={pinBg}
                      strokeWidth="2.5"
                      opacity="0.6"
                      className="animate-ping"
                    />
                  )}

                  {/* Pin Drop Shadow */}
                  <circle
                    cx="0"
                    cy="2"
                    r="15"
                    fill="#000000"
                    opacity="0.4"
                  />

                  {/* Main Pin Circle */}
                  <circle
                    cx="0"
                    cy="0"
                    r="15"
                    fill={pinBg}
                    stroke={isSelected ? '#ffffff' : pinBorder}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    className="transition-colors duration-150"
                  />

                  {/* Icon or Pin Number */}
                  {isEvaluated && att ? (
                    att.isCorrect ? (
                      <path
                        d="M -5 0 L -1 4 L 5 -3"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    ) : (
                      <path
                        d="M -4 -4 L 4 4 M 4 -4 L -4 4"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    )
                  ) : (
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill={pinText}
                      fontSize="12"
                      fontWeight="bold"
                      fontFamily="system-ui, sans-serif"
                    >
                      {callout.number}
                    </text>
                  )}

                  {/* In Study Mode or when answered, show label tag badge */}
                  {(viewMode === 'study' || (guess && guess.trim())) && (
                    <g transform="translate(18, -10)">
                      <rect
                        x="0"
                        y="0"
                        rx="4"
                        height="20"
                        width={Math.max(60, (viewMode === 'study' ? callout.label.length : guess.length) * 7.5 + 14)}
                        fill="#0f172a"
                        fillOpacity="0.85"
                        stroke={isSelected ? '#60a5fa' : '#334155'}
                        strokeWidth="1"
                      />
                      <text
                        x="7"
                        y="14"
                        fill="#f8fafc"
                        fontSize="10"
                        fontWeight="600"
                        fontFamily="system-ui, sans-serif"
                      >
                        {viewMode === 'study' ? callout.label : guess}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Floating Active Callout Card at Bottom of Canvas */}
      {activeCallout && (
        <div className="absolute bottom-3 left-3 right-3 z-20 bg-slate-900/95 backdrop-blur-md p-3 rounded-lg border border-slate-700/80 shadow-xl flex items-start gap-3 text-sm animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold flex items-center justify-center text-xs">
            {activeCallout.number}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-100">
                {viewMode === 'study' || evaluation ? activeCallout.label : `Callout #${activeCallout.number}`}
              </span>
              {viewMode === 'study' && activeCallout.acceptableAnswers && activeCallout.acceptableAnswers.length > 0 && (
                <span className="text-xs text-slate-400">
                  (Also: {activeCallout.acceptableAnswers.join(', ')})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">
              {viewMode === 'study' || evaluation
                ? activeCallout.description || activeCallout.hint
                : activeCallout.hint || 'Select this callout to enter your identification.'}
            </p>
            {evaluation && evaluation.attempts[activeCallout.id] && (
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                {evaluation.attempts[activeCallout.id].isCorrect ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Correct
                  </span>
                ) : (
                  <span className="text-rose-400 flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Incorrect (Expected: {activeCallout.label})
                  </span>
                )}
                {userGuesses[activeCallout.id] && (
                  <span className="text-slate-400">
                    Your answer: &quot;{userGuesses[activeCallout.id]}&quot;
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
