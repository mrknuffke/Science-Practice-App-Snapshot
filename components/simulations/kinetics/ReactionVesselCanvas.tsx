import React, { useEffect, useRef } from 'react';
import { KineticParticle, ScenarioMode } from '../../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, REACTANT_PROPERTIES } from './kineticsConstants';

interface ReactionVesselCanvasProps {
  particlesRef: React.MutableRefObject<KineticParticle[]>;
  mode: ScenarioMode;
  avgKERef?: React.MutableRefObject<number>;
}

export const ReactionVesselCanvas: React.FC<ReactionVesselCanvasProps> = ({
  particlesRef,
  mode,
  avgKERef,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const drawEnzymeShape = (ctx: CanvasRenderingContext2D, p: KineticParticle) => {
      const r = p.radius;
      const denatured = p.enzymeDenatured;
      const denatProgress = p.denaturationProgress || 0;

      ctx.save();
      ctx.translate(p.x, p.y);

      if (denatured || denatProgress > 0) {
        // Denatured: irregular blob shape using bezier curves
        const t = Math.min(1, denatProgress);
        ctx.beginPath();
        const blobR = r * (1 + t * 0.3);
        // Randomized blob points (fixed per particle id so it doesn't jitter)
        const seed = (p.id.charCodeAt(2) || 1);
        const jitter = t * r * 0.5;
        const pts = 8;
        for (let i = 0; i <= pts; i++) {
          const angle = (i / pts) * Math.PI * 2;
          const rJit = blobR + Math.sin(angle * seed + seed) * jitter;
          const bx = Math.cos(angle) * rJit;
          const by = Math.sin(angle) * rJit;
          if (i === 0) ctx.moveTo(bx, by);
          else ctx.lineTo(bx, by);
        }
        ctx.closePath();
        ctx.fillStyle = '#94a3b8'; // grey (denatured)
        ctx.fill();
      } else {
        // Native enzyme: C-shape with active site notch
        // Draw a filled circle then cut out the notch
        ctx.beginPath();
        // Arc with gap on right side for active site
        const notchAngle = Math.PI * 0.45;
        ctx.arc(0, 0, r, notchAngle, -notchAngle);
        ctx.lineTo(r * 0.2, 0);
        ctx.closePath();
        ctx.fillStyle = REACTANT_PROPERTIES['Enzyme'].colors['biology'];
        ctx.fill();

        // Active site label
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        ctx.font = `bold ${Math.floor(r * 0.45)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('E', -r * 0.2, 0);
      }
      ctx.restore();
    };

    const drawProduct = (ctx: CanvasRenderingContext2D, p: KineticParticle) => {
      const r = p.radius;
      ctx.save();
      ctx.translate(p.x, p.y);

      // Rotate along velocity vector for natural flight orientation
      if (p.vx !== 0 || p.vy !== 0) {
        ctx.rotate(Math.atan2(p.vy, p.vx));
      }

      // Space-filling diatomic molecule: two solid overlapping spheres with zero gap
      const atomR = r * 0.68; // ~9.5px, matching single Reactant A/B scale (10px)
      const offset = r * 0.32; // Center offset; spheres overlap by ~9px

      // Left atom (Reactant A: rose/red)
      ctx.beginPath();
      ctx.arc(-offset, 0, atomR, 0, Math.PI * 2);
      ctx.fillStyle = REACTANT_PROPERTIES['A'].colors['chemistry'];
      ctx.fill();

      // Right atom (Reactant B: blue)
      ctx.beginPath();
      ctx.arc(offset, 0, atomR, 0, Math.PI * 2);
      ctx.fillStyle = REACTANT_PROPERTIES['B'].colors['chemistry'];
      ctx.fill();

      // Subtle seam arc at the bond junction
      ctx.beginPath();
      ctx.arc(-offset, 0, atomR, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // 3D specular highlight on Atom A
      ctx.beginPath();
      ctx.arc(-offset - atomR * 0.3, -atomR * 0.3, atomR * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();

      // 3D specular highlight on Atom B
      ctx.beginPath();
      ctx.arc(offset - atomR * 0.3, -atomR * 0.3, atomR * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Background
      ctx.fillStyle = mode === 'chemistry' ? '#f8fafc' : '#f0fdf4';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Grid lines
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < CANVAS_WIDTH; x += 50) { ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); }
      for (let y = 0; y < CANVAS_HEIGHT; y += 50) { ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); }
      ctx.stroke();

      // Compute avg KE for energy diagram
      const particles = particlesRef.current;
      let sumKE = 0;
      let liveCount = 0;
      particles.forEach(p => {
        if (!p.dead) {
          sumKE += p.energy;
          liveCount++;
        }
      });
      const avgKE = liveCount > 0 ? sumKE / liveCount : 0;
      if (avgKERef) avgKERef.current = avgKE;

      // Draw particles
      particles.forEach(p => {
        if (p.dead) return;

        if (p.type === 'Product' && mode === 'chemistry') {
          drawProduct(ctx, p);
          return;
        }

        if (p.type === 'Enzyme' || p.type === 'Enzyme_Complex') {
          drawEnzymeShape(ctx, p);
          return;
        }

        const props = REACTANT_PROPERTIES[p.type];

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = props.colors[mode] || props.colors['chemistry'];
        ctx.fill();

        // 3D highlight
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, avgKERef, particlesRef]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="w-full h-full object-contain bg-white block rounded-xl border-4 border-slate-200"
    />
  );
};
