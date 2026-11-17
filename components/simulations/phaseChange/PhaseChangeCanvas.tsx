import React, { forwardRef } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from './phaseChangeConstants';

interface PhaseChangeCanvasProps {
  // We don't take particles as a prop to avoid re-rendering 60fps.
  // The parent will draw directly to the canvas ref.
}

export const PhaseChangeCanvas = forwardRef<HTMLCanvasElement, PhaseChangeCanvasProps>(
  (props, ref) => {
    return (
      <div className="relative bg-slate-900 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-inner flex items-center justify-center p-4">
        <canvas
          ref={ref}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="bg-slate-800 rounded-xl w-full max-w-lg aspect-square"
          style={{ height: 'auto' }}
        />
        {/* Thermometer aesthetic background or container visual could go here */}
      </div>
    );
  }
);

PhaseChangeCanvas.displayName = 'PhaseChangeCanvas';
