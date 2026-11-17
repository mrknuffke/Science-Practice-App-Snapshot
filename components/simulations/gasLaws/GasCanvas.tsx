import React, { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { CANVAS_WIDTH, CANVAS_HEIGHT, VESSEL_LEFT, VESSEL_RIGHT, VESSEL_BOTTOM, VESSEL_MIN_HEIGHT, VENT_OFFSET_TOP, VENT_OFFSET_BOTTOM } from './gasLawsConstants';
import { GasState, getParticleColor, computeMeanKE } from './gasLawsEngine';

const PISTON_MAX = VESSEL_BOTTOM - 80;

interface GasCanvasProps {
  stateRef: React.RefObject<GasState | null>;
  onPistonDrag?: (y: number) => void;
}

export const GasCanvas = forwardRef<HTMLCanvasElement, GasCanvasProps>(
  ({ stateRef, onPistonDrag }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const isDraggingRef = useRef(false);
    const dragStartYRef = useRef(0);
    const pistonStartYRef = useRef(0);

    useImperativeHandle(ref, () => canvasRef.current!);

    // DPR scaling: set canvas backing store to devicePixelRatio so particles are crisp on retina
    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const setupBackingStore = () => {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = CANVAS_WIDTH * dpr;
        canvas.height = CANVAS_HEIGHT * dpr;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.scale(dpr, dpr);
        }
      };

      setupBackingStore();
      window.addEventListener('resize', setupBackingStore);
      return () => window.removeEventListener('resize', setupBackingStore);
    }, []);

    // Convert client Y to canvas Y
    const clientToCanvasY = useCallback((clientY: number): number => {
      const canvas = canvasRef.current;
      if (!canvas) return 0;
      const rect = canvas.getBoundingClientRect();
      const scaleY = CANVAS_HEIGHT / rect.height;
      return (clientY - rect.top) * scaleY;
    }, []);

    const isPistonHit = useCallback((canvasY: number): boolean => {
      const state = stateRef.current;
      if (!state) return false;
      return Math.abs(canvasY - state.pistonY) < 18;
    }, [stateRef]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas || !onPistonDrag) return;

      const handleMouseDown = (e: MouseEvent) => {
        const cy = clientToCanvasY(e.clientY);
        if (isPistonHit(cy)) {
          isDraggingRef.current = true;
          dragStartYRef.current = e.clientY;
          pistonStartYRef.current = stateRef.current?.pistonY ?? cy;
          e.preventDefault();
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDraggingRef.current) return;
        const deltaClientY = e.clientY - dragStartYRef.current;
        const canvas2 = canvasRef.current;
        if (!canvas2) return;
        const rect = canvas2.getBoundingClientRect();
        const scaleY = CANVAS_HEIGHT / rect.height;
        const deltaCanvasY = deltaClientY * scaleY;
        const newY = Math.max(VESSEL_MIN_HEIGHT, Math.min(PISTON_MAX, pistonStartYRef.current + deltaCanvasY));
        onPistonDrag(newY);
      };

      const handleMouseUp = () => {
        isDraggingRef.current = false;
      };

      const handleTouchStart = (e: TouchEvent) => {
        const cy = clientToCanvasY(e.touches[0].clientY);
        if (isPistonHit(cy)) {
          isDraggingRef.current = true;
          dragStartYRef.current = e.touches[0].clientY;
          pistonStartYRef.current = stateRef.current?.pistonY ?? cy;
          e.preventDefault();
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (!isDraggingRef.current) return;
        const deltaClientY = e.touches[0].clientY - dragStartYRef.current;
        const canvas2 = canvasRef.current;
        if (!canvas2) return;
        const rect = canvas2.getBoundingClientRect();
        const scaleY = CANVAS_HEIGHT / rect.height;
        const deltaCanvasY = deltaClientY * scaleY;
        const newY = Math.max(VESSEL_MIN_HEIGHT, Math.min(PISTON_MAX, pistonStartYRef.current + deltaCanvasY));
        onPistonDrag(newY);
        e.preventDefault();
      };

      const handleTouchEnd = () => {
        isDraggingRef.current = false;
      };

      canvas.addEventListener('mousedown', handleMouseDown);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);

      return () => {
        canvas.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('touchstart', handleTouchStart);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }, [stateRef, onPistonDrag, clientToCanvasY, isPistonHit]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      let animFrame: number;

      const draw = () => {
        const state = stateRef.current;
        if (!state) { animFrame = requestAnimationFrame(draw); return; }

        ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Clean white/light background
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Subtle grid
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x < CANVAS_WIDTH; x += 50) { ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); }
        for (let y = 0; y < CANVAS_HEIGHT; y += 50) { ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); }
        ctx.stroke();

        const { pistonY, isBroken, breakProgress, particles } = state;
        const dragging = isDraggingRef.current;

        if (isBroken) {
          drawBrokenVessel(ctx, pistonY, breakProgress, particles, computeMeanKE(particles));
        } else {
          drawVessel(ctx, pistonY, dragging, state.ventOpen);
          drawParticles(ctx, particles, computeMeanKE(particles));
        }

        // Draw color key in top-right corner of canvas
        const ks = 8; // key dot size
        const kx = CANVAS_WIDTH - 10;
        const ky = 14;
        ctx.save();
        ctx.font = 'bold 11px sans-serif';
        ctx.textBaseline = 'middle';

        // Gas A key
        ctx.beginPath();
        ctx.arc(kx - 60, ky, ks, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();
        ctx.fillStyle = '#334155';
        ctx.textAlign = 'left';
        ctx.fillText('Gas A', kx - 48, ky);

        // Gas B key
        ctx.beginPath();
        ctx.arc(kx - 60, ky + 20, ks * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
        ctx.fillStyle = '#334155';
        ctx.fillText('Gas B', kx - 48, ky + 20);

        ctx.restore();

        animFrame = requestAnimationFrame(draw);
      };

      animFrame = requestAnimationFrame(draw);
      return () => cancelAnimationFrame(animFrame);
    }, [stateRef]);

    return (
      <div className="w-full aspect-[8/5]">
        <canvas
          ref={canvasRef}
          className="w-full h-full rounded-2xl cursor-ns-resize bg-slate-50 block"
        />
      </div>
    );
  }
);

GasCanvas.displayName = 'GasCanvas';

function drawVessel(ctx: CanvasRenderingContext2D, pistonY: number, dragging: boolean = false, ventOpen: boolean = false) {
  ctx.save();

  // Vessel interior fill (very light tint)
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(VESSEL_LEFT, pistonY, VESSEL_RIGHT - VESSEL_LEFT, VESSEL_BOTTOM - pistonY);

  // Vessel walls: clean slate style
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Left + bottom in one path
  ctx.beginPath();
  ctx.moveTo(VESSEL_LEFT, pistonY);
  ctx.lineTo(VESSEL_LEFT, VESSEL_BOTTOM);
  ctx.lineTo(VESSEL_RIGHT, VESSEL_BOTTOM);
  ctx.stroke();

  // Right wall: split into segments around the vent when open
  const ventTop = pistonY + VENT_OFFSET_TOP;
  const ventBottom = pistonY + VENT_OFFSET_BOTTOM;
  if (ventOpen) {
    ctx.beginPath();
    ctx.moveTo(VESSEL_RIGHT, pistonY);
    ctx.lineTo(VESSEL_RIGHT, ventTop);
    ctx.moveTo(VESSEL_RIGHT, ventBottom);
    ctx.lineTo(VESSEL_RIGHT, VESSEL_BOTTOM);
    ctx.stroke();

    // Vent indicator: orange arrow + label outside the wall
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('VENT OPEN →', VESSEL_RIGHT + 6, (ventTop + ventBottom) / 2);

    // Dashed escape path
    ctx.strokeStyle = '#fb923c';
    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(VESSEL_RIGHT, (ventTop + ventBottom) / 2);
    ctx.lineTo(VESSEL_RIGHT + 80, (ventTop + ventBottom) / 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#475569';
  } else {
    ctx.beginPath();
    ctx.moveTo(VESSEL_RIGHT, pistonY);
    ctx.lineTo(VESSEL_RIGHT, VESSEL_BOTTOM);
    ctx.stroke();
  }

  // Piston: thicker, colored when dragging
  const pistonColor = dragging ? '#3b82f6' : '#334155';
  ctx.fillStyle = pistonColor;
  ctx.fillRect(VESSEL_LEFT, pistonY - 6, VESSEL_RIGHT - VESSEL_LEFT, 12);

  // Piston grip lines
  ctx.strokeStyle = dragging ? '#93c5fd' : '#94a3b8';
  ctx.lineWidth = 1.5;
  const midX = (VESSEL_LEFT + VESSEL_RIGHT) / 2;
  for (let i = -3; i <= 3; i++) {
    const x = midX + i * 16;
    ctx.beginPath();
    ctx.moveTo(x, pistonY - 4);
    ctx.lineTo(x, pistonY + 4);
    ctx.stroke();
  }

  // Drag label
  ctx.fillStyle = dragging ? '#3b82f6' : '#94a3b8';
  ctx.font = 'bold 11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('⇅ drag piston to change volume', midX, pistonY - 12);

  ctx.restore();
}

function drawParticles(
  ctx: CanvasRenderingContext2D,
  particles: ReturnType<typeof import('./gasLawsEngine').createParticle>[],
  meanKE: number
) {
  for (const p of particles) {
    const color = getParticleColor(p, meanKE);

    ctx.save();

    // Main sphere
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // 3D highlight (top-left bright spot)
    ctx.beginPath();
    ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.35, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.fill();

    ctx.restore();
  }
}

function drawBrokenVessel(
  ctx: CanvasRenderingContext2D,
  pistonY: number,
  progress: number,
  particles: ReturnType<typeof import('./gasLawsEngine').createParticle>[],
  meanKE: number
) {
  // Draw cracked/exploding vessel
  const alpha = Math.max(0, 1 - progress * 1.5);
  const W = 6;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = W;

  // Jagged left wall
  ctx.beginPath();
  ctx.moveTo(VESSEL_LEFT, pistonY);
  ctx.lineTo(VESSEL_LEFT - progress * 20, pistonY + (VESSEL_BOTTOM - pistonY) * 0.3);
  ctx.lineTo(VESSEL_LEFT + progress * 15, pistonY + (VESSEL_BOTTOM - pistonY) * 0.6);
  ctx.lineTo(VESSEL_LEFT - progress * 25, VESSEL_BOTTOM);
  ctx.stroke();

  // Jagged right wall
  ctx.beginPath();
  ctx.moveTo(VESSEL_RIGHT, pistonY);
  ctx.lineTo(VESSEL_RIGHT + progress * 20, pistonY + (VESSEL_BOTTOM - pistonY) * 0.4);
  ctx.lineTo(VESSEL_RIGHT - progress * 15, pistonY + (VESSEL_BOTTOM - pistonY) * 0.7);
  ctx.lineTo(VESSEL_RIGHT + progress * 25, VESSEL_BOTTOM);
  ctx.stroke();

  // Bottom wall cracking
  ctx.beginPath();
  ctx.moveTo(VESSEL_LEFT, VESSEL_BOTTOM);
  ctx.lineTo(VESSEL_LEFT + (VESSEL_RIGHT - VESSEL_LEFT) * 0.3, VESSEL_BOTTOM + progress * 12);
  ctx.lineTo(VESSEL_LEFT + (VESSEL_RIGHT - VESSEL_LEFT) * 0.7, VESSEL_BOTTOM - progress * 8);
  ctx.lineTo(VESSEL_RIGHT, VESSEL_BOTTOM);
  ctx.stroke();

  // Crack lines radiating from center
  ctx.strokeStyle = '#fca5a5';
  ctx.lineWidth = 2;
  const cx = (VESSEL_LEFT + VESSEL_RIGHT) / 2;
  const cy = (pistonY + VESSEL_BOTTOM) / 2;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const len = progress * 80;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.restore();

  // Particles fly outward during break
  for (const p of particles) {
    const escapedX = p.x + (p.x - (VESSEL_LEFT + VESSEL_RIGHT) / 2) * progress * 3;
    const escapedY = p.y + (p.y - (pistonY + VESSEL_BOTTOM) / 2) * progress * 3;
    const color = getParticleColor(p, meanKE);
    const alpha2 = Math.max(0, 1 - progress);

    ctx.save();
    ctx.globalAlpha = alpha2;
    ctx.beginPath();
    ctx.arc(escapedX, escapedY, p.radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  // "VESSEL EXCEEDED PRESSURE LIMIT" text
  if (progress > 0.2) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, (progress - 0.2) * 3);
    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('⚠ PRESSURE LIMIT EXCEEDED', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 - 16);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText('Click Reset to start over', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 14);
    ctx.restore();
  }
}
