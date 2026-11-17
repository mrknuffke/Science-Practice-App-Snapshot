import React, { useEffect, useRef, useState } from 'react';
import {
  WINDOW_W,
  WINDOW_H,
  MEMBRANE_X,
  MEMBRANE_HALF,
  PORE_HALF,
  WATER_R,
  SUGAR_R,
  WindowInputs,
  createWindow,
  advanceWindow,
  crossingTally,
  poreCentres,
} from './osmosisParticles';

interface MembraneWindowProps {
  inputs: WindowInputs;
  running: boolean;
  /** Bump to rebuild the particle set (new run). */
  resetKey: number;
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

const MembraneWindow: React.FC<MembraneWindowProps> = ({ inputs, running, resetKey }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputsRef = useRef(inputs);
  const runningRef = useRef(running);
  const [tally, setTally] = useState({ into: 0, out: 0 });

  useEffect(() => {
    inputsRef.current = inputs;
    runningRef.current = running;
  }, [inputs, running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const win = createWindow(inputsRef.current);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = WINDOW_W * dpr;
    canvas.height = WINDOW_H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pores = poreCentres();
    const reduced = prefersReducedMotion();
    let last = performance.now();
    let lastTally = 0;
    let frame = 0;
    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, WINDOW_W, WINDOW_H);
      // Membrane with water-sized pores
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(MEMBRANE_X - MEMBRANE_HALF, 0, MEMBRANE_HALF * 2, WINDOW_H);
      ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
      for (const c of pores) {
        ctx.clearRect(MEMBRANE_X - MEMBRANE_HALF, c - PORE_HALF, MEMBRANE_HALF * 2, PORE_HALF * 2);
        ctx.fillRect(MEMBRANE_X - MEMBRANE_HALF, c - PORE_HALF, MEMBRANE_HALF * 2, PORE_HALF * 2);
      }
      for (const p of win.particles) {
        ctx.beginPath();
        if (p.kind === 'water') {
          ctx.arc(p.x, p.y, WATER_R, 0, Math.PI * 2);
          ctx.fillStyle = '#0ea5e9';
          ctx.fill();
        } else {
          ctx.arc(p.x, p.y, SUGAR_R, 0, Math.PI * 2);
          ctx.fillStyle = '#f59e0b';
          ctx.fill();
          ctx.lineWidth = 1;
          ctx.strokeStyle = '#b45309';
          ctx.stroke();
        }
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      if (runningRef.current && !reduced) {
        advanceWindow(win, inputsRef.current, dt);
      } else if (runningRef.current && reduced) {
        // Reduced motion: advance in coarse steps a few times a second.
        if (frame % 15 === 0) for (let i = 0; i < 15; i++) advanceWindow(win, inputsRef.current, dt);
      }
      frame++;
      draw();
      if (now - lastTally > 400) {
        lastTally = now;
        setTally(crossingTally(win));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [resetKey]);

  const net = tally.into - tally.out;

  return (
    <div className="space-y-2">
      <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
        <canvas
          ref={canvasRef}
          className="block w-full h-auto"
          style={{ aspectRatio: `${WINDOW_W} / ${WINDOW_H}` }}
          role="img"
          aria-label="Close-up of the bag wall. Water molecules wander through small pores in both directions. Sugar molecules are too big to fit."
        />
        <div className="absolute inset-x-0 top-1 px-3 flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 pointer-events-none">
          <span>Inside the bag</span>
          <span>Beaker</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 p-2">
          <div className="text-slate-500 dark:text-slate-400 font-semibold">Water in</div>
          <div className="font-mono font-bold text-sky-600 dark:text-sky-400 text-base">{tally.into}</div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 p-2">
          <div className="text-slate-500 dark:text-slate-400 font-semibold">Water out</div>
          <div className="font-mono font-bold text-sky-600 dark:text-sky-400 text-base">{tally.out}</div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 p-2">
          <div className="text-slate-500 dark:text-slate-400 font-semibold">Net</div>
          <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-base">
            {net > 0 ? `+${net} in` : net < 0 ? `${-net} out` : '0'}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        Counts cover the last 10 seconds. They jump around because every molecule moves at random. Watch the trend.
      </p>
    </div>
  );
};

export default MembraneWindow;
