import React, { useEffect, useRef } from 'react';
import { DiffusionParticle, MembraneProtein } from '../../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, MEMBRANE_Y, MEMBRANE_THICKNESS, PROTEIN_WIDTH, PROTEIN_HEIGHT, PARTICLE_CONFIGS } from './diffusionConstants';

interface DiffusionCanvasProps {
  particlesRef: React.MutableRefObject<DiffusionParticle[]>;
  proteins: MembraneProtein[];
}

export const DiffusionCanvas: React.FC<DiffusionCanvasProps> = ({
  particlesRef,
  proteins
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // We only need to draw the background once ideally, but it's simpler to just clear and redraw
    // To make it look nice, let's draw a phospholipid bilayer pattern.
    let animationFrameId: number;

    const drawMembrane = (ctx: CanvasRenderingContext2D) => {
      ctx.save();
      
      // Draw the squishy center (hydrophobic tails)
      ctx.fillStyle = '#fef08a'; // Light yellow
      ctx.globalAlpha = 0.4;
      ctx.fillRect(0, MEMBRANE_Y - MEMBRANE_THICKNESS / 2, CANVAS_WIDTH, MEMBRANE_THICKNESS);
      
      // Draw lipid heads (hydrophilic)
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#fb923c'; // Orange
      const HEAD_RADIUS = 6;
      for (let x = 0; x <= CANVAS_WIDTH; x += HEAD_RADIUS * 2.5) {
        // Top layer
        let skip = false;
        // Check if there is a protein here, to break the membrane
        proteins.forEach(prot => {
           if (Math.abs(x - prot.x) < PROTEIN_WIDTH / 2) skip = true;
        });

        if (!skip) {
          ctx.beginPath();
          ctx.arc(x, MEMBRANE_Y - MEMBRANE_THICKNESS / 2, HEAD_RADIUS, 0, Math.PI * 2);
          ctx.fill();
        }

        skip = false;
        proteins.forEach(prot => {
           if (Math.abs(x - prot.x) < PROTEIN_WIDTH / 2) skip = true;
        });

        if (!skip) {
          // Bottom layer
          ctx.beginPath();
          ctx.arc(x, MEMBRANE_Y + MEMBRANE_THICKNESS / 2, HEAD_RADIUS, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.restore();
    };

    const drawProteins = (ctx: CanvasRenderingContext2D) => {
      proteins.forEach(prot => {
         ctx.save();
         
         if (prot.type === 'channel') {
           // Draw a channel (two pillars)
           ctx.fillStyle = PARTICLE_CONFIGS[prot.allowedParticle].color;
           ctx.globalAlpha = 0.8;
           
           // Left pillar
           ctx.beginPath();
           ctx.roundRect(prot.x - PROTEIN_WIDTH/2, MEMBRANE_Y - PROTEIN_HEIGHT/2, 15, PROTEIN_HEIGHT, 5);
           ctx.fill();
           
           // Right pillar
           ctx.beginPath();
           ctx.roundRect(prot.x + PROTEIN_WIDTH/2 - 15, MEMBRANE_Y - PROTEIN_HEIGHT/2, 15, PROTEIN_HEIGHT, 5);
           ctx.fill();
           
           // Draw faint label
           ctx.fillStyle = '#fff';
           ctx.font = '10px Arial';
           ctx.textAlign = 'center';
           ctx.fillText('CHANNEL', prot.x, MEMBRANE_Y - PROTEIN_HEIGHT/2 - 10);
           
         } else if (prot.type === 'pump') {
           const phase = prot.pumpPhase ?? 'idle';
           const phaseProgress = prot.pumpPhaseProgress ?? 0;
           const pumpColor = PARTICLE_CONFIGS[prot.allowedParticle].color;

           // Phase-based visual transformations
           // idle: closed/grey; binding: mouth opens on input side; pumping: interior lit; releasing: mouth opens on output side
           const isPumping = phase === 'pumping';
           const isBinding = phase === 'binding';
           const isReleasing = phase === 'releasing';

           const dir = prot.pumpDirection ?? 'out';
           const openTop = (dir === 'in' && isBinding) || (dir === 'out' && isReleasing);
           const openBottom = (dir === 'out' && isBinding) || (dir === 'in' && isReleasing);
           const openProgress = isBinding || isReleasing ? phaseProgress : 0;

           ctx.globalAlpha = 0.9;

           // Outer body
           ctx.fillStyle = prot.hasATP ? pumpColor : '#94a3b8';
           ctx.beginPath();
           ctx.roundRect(prot.x - PROTEIN_WIDTH/2, MEMBRANE_Y - PROTEIN_HEIGHT/2, PROTEIN_WIDTH, PROTEIN_HEIGHT, 5);
           ctx.fill();

           // Inner channel (conformational change)
           ctx.globalCompositeOperation = 'destination-out';
           ctx.globalAlpha = isPumping ? 0.7 : 0.9;
           const openH = PROTEIN_HEIGHT * 0.45 * openProgress;
           if (openTop) {
             ctx.beginPath();
             ctx.roundRect(prot.x - PROTEIN_WIDTH/2 + 14, MEMBRANE_Y - PROTEIN_HEIGHT/2, PROTEIN_WIDTH - 28, openH, 4);
             ctx.fill();
           }
           if (openBottom) {
             ctx.beginPath();
             ctx.roundRect(prot.x - PROTEIN_WIDTH/2 + 14, MEMBRANE_Y + PROTEIN_HEIGHT/2 - openH, PROTEIN_WIDTH - 28, openH, 4);
             ctx.fill();
           }
           ctx.globalCompositeOperation = 'source-over';
           ctx.globalAlpha = 1;

           // Pumping: glow interior
           if (isPumping) {
             const grd = ctx.createRadialGradient(prot.x, MEMBRANE_Y, 4, prot.x, MEMBRANE_Y, 18);
             grd.addColorStop(0, 'rgba(251,191,36,0.8)');
             grd.addColorStop(1, 'rgba(251,191,36,0)');
             ctx.fillStyle = grd;
             ctx.beginPath();
             ctx.arc(prot.x, MEMBRANE_Y, 18, 0, Math.PI * 2);
             ctx.fill();
           }

           // Directional arrow
           ctx.fillStyle = prot.hasATP ? '#fff' : '#e2e8f0';
           ctx.font = 'bold 14px sans-serif';
           ctx.textAlign = 'center';
           ctx.textBaseline = 'middle';
           const arrowChar = dir === 'out' ? '↑' : '↓';
           ctx.globalAlpha = isPumping ? 0.5 + Math.sin(phaseProgress * Math.PI * 4) * 0.5 : 0.7;
           ctx.fillText(arrowChar, prot.x, MEMBRANE_Y);
           ctx.globalAlpha = 1;

           // Labels
           ctx.font = 'bold 9px sans-serif';
           ctx.fillStyle = '#475569';
           ctx.textBaseline = 'alphabetic';
           ctx.fillText('PUMP', prot.x, MEMBRANE_Y - PROTEIN_HEIGHT/2 - 4);

           if (prot.hasATP) {
             ctx.fillStyle = '#f59e0b';
             ctx.font = 'bold 9px sans-serif';
             ctx.fillText('⚡ATP', prot.x, MEMBRANE_Y + PROTEIN_HEIGHT/2 + 12);
           }

           // Phase badge
           if (phase !== 'idle') {
             const phaseLabels: Record<string, string> = { binding: 'binding', pumping: 'active', releasing: 'release' };
             ctx.font = '8px sans-serif';
             ctx.fillStyle = isPumping ? '#f59e0b' : '#6366f1';
             ctx.fillText(phaseLabels[phase] ?? '', prot.x, MEMBRANE_Y + PROTEIN_HEIGHT/2 + 22);
           }

           // Ion direction labels
           const inLabel = `H⁺ ${dir === 'in' ? '→' : '←'}`;
           const outLabel = `H⁺ ${dir === 'out' ? '→' : '←'}`;
           ctx.font = '9px sans-serif';
           ctx.fillStyle = '#94a3b8';
           ctx.fillText(outLabel, prot.x + PROTEIN_WIDTH/2 + 6, MEMBRANE_Y - 8);
           ctx.fillText(inLabel, prot.x + PROTEIN_WIDTH/2 + 6, MEMBRANE_Y + 8);
         }
         
         ctx.restore();
      });
    };

    const drawParticles = (ctx: CanvasRenderingContext2D) => {
      particlesRef.current.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = PARTICLE_CONFIGS[p.type].color;
        ctx.fill();
        
        // Add a small highlight
        ctx.beginPath();
        ctx.arc(p.x - p.radius * 0.3, p.y - p.radius * 0.3, p.radius * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
      });
    };

    const render = () => {
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Draw background gradient to show extracellular vs intracellular
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#e0f2fe'); // Top/Extracellular
      gradient.addColorStop(1, '#f1f5f9'); // Bottom/Intracellular
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      drawMembrane(ctx);
      drawProteins(ctx);
      drawParticles(ctx);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [proteins, particlesRef]); // Re-bind if proteins change (we map over them directly); the ref object itself is stable

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      className="w-full h-full object-contain bg-white block"
    />
  );
};
