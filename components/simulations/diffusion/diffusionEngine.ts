import { DiffusionParticle, MembraneProtein, PumpPhase } from '../../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, MEMBRANE_Y, MEMBRANE_THICKNESS, PROTEIN_WIDTH, PARTICLE_CONFIGS } from './diffusionConstants';

const MEMBRANE_TOP = MEMBRANE_Y - MEMBRANE_THICKNESS / 2;
const MEMBRANE_BOTTOM = MEMBRANE_Y + MEMBRANE_THICKNESS / 2;

// How fast each pump phase progresses per tick (0 to 1 per tick)
const PUMP_PHASE_SPEED: Record<PumpPhase, number> = {
  idle: 0,
  binding: 0.05,
  pumping: 0.025,
  releasing: 0.06,
};

// Advance pump state machine
export const advancePumpPhase = (
  protein: MembraneProtein,
  speedMultiplier: number = 1
): MembraneProtein => {
  if (protein.type !== 'pump') return protein;

  const phase = protein.pumpPhase ?? 'idle';
  const progress = protein.pumpPhaseProgress ?? 0;

  if (phase === 'idle') {
    // Transition to binding when actively transporting or has ATP
    if (protein.isTransporting && protein.hasATP) {
      return { ...protein, pumpPhase: 'binding', pumpPhaseProgress: 0 };
    }
    return protein;
  }

  const nextProgress = progress + PUMP_PHASE_SPEED[phase] * speedMultiplier;

  if (nextProgress >= 1) {
    // Advance to next phase
    const nextPhase: Record<PumpPhase, PumpPhase> = {
      idle: 'binding',
      binding: 'pumping',
      pumping: 'releasing',
      releasing: 'idle',
    };
    const next = nextPhase[phase];
    return { ...protein, pumpPhase: next, pumpPhaseProgress: 0 };
  }

  return { ...protein, pumpPhaseProgress: nextProgress };
};

// Check if a particle collides with the membrane boundary
const checkMembraneCollision = (p: DiffusionParticle, newY: number): 'bounce_top' | 'bounce_bottom' | null => {
  if (p.y > MEMBRANE_TOP && p.y < MEMBRANE_BOTTOM) return null;
  if (p.y <= MEMBRANE_TOP && newY + p.radius > MEMBRANE_TOP) return 'bounce_top';
  if (p.y >= MEMBRANE_BOTTOM && newY - p.radius < MEMBRANE_BOTTOM) return 'bounce_bottom';
  return null;
};

// Main physics loop, mutates particles for performance
export const simulateDiffusionStep = (
  particles: DiffusionParticle[],
  proteins: MembraneProtein[],
  onProteinStatusChange: (proteinId: string, status: 'transport_start' | 'transport_end' | 'atp_consumed') => void,
  speedMultiplier: number = 1
) => {
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    const config = PARTICLE_CONFIGS[p.type];

    if (p.isTransporting) {
      // It's inside a protein, moving strictly vertically
      let updatedY = p.y + p.vy;
      
      // Has it exited the channel?
      if ((p.vy > 0 && updatedY > MEMBRANE_BOTTOM + p.radius) || 
          (p.vy < 0 && updatedY < MEMBRANE_TOP - p.radius)) {
          
          // Finished transport!
          // Find which protein it was in based strictly on position (or we could store proteinId on particle)
          const occupyingProtein = proteins.find(prot => 
            Math.abs(prot.x - p.x) < PROTEIN_WIDTH / 2 && prot.isTransporting
          );
          
          if (occupyingProtein) {
             onProteinStatusChange(occupyingProtein.id, 'transport_end');
             if (occupyingProtein.type === 'pump') {
               onProteinStatusChange(occupyingProtein.id, 'atp_consumed');
             }
          }
          
          p.y = updatedY;
          p.isTransporting = false;
          // Randomize trajectory after exiting
          p.vx = (Math.random() > 0.5 ? 1 : -1) * (config.speed * (Math.random() * 0.5 + 0.5));
          p.vy = (Math.random() > 0.5 ? 1 : -1) * (config.speed * (Math.random() * 0.5 + 0.5));
      } else {
        p.y = updatedY;
      }
      continue;
    }

    // Normal movement
    let newX = p.x + p.vx;
    let newY = p.y + p.vy;

    // Bounce off outer walls
    if (newX - p.radius < 0) { newX = p.radius; p.vx *= -1; }
    if (newX + p.radius > CANVAS_WIDTH) { newX = CANVAS_WIDTH - p.radius; p.vx *= -1; }
    if (newY - p.radius < 0) { newY = p.radius; p.vy *= -1; }
    if (newY + p.radius > CANVAS_HEIGHT) { newY = CANVAS_HEIGHT - p.radius; p.vy *= -1; }

    // Membrane logic
    if (!config.canDiffuse) {
      const collision = checkMembraneCollision(p, newY);
      
      if (collision) {
        // Can we enter a protein?
        const candidateProtein = proteins.find(prot => 
          !prot.isTransporting && 
          prot.allowedParticle === p.type &&
          Math.abs(prot.x - newX) < PROTEIN_WIDTH / 2
        );

        if (candidateProtein) {
           let allowEntry = false;
           
           if (candidateProtein.type === 'channel') {
             allowEntry = true;
           } else if (candidateProtein.type === 'pump') {
             // Direction: 'out' (default) = intracellular→extracellular (bounce_bottom enters)
             //            'in'             = extracellular→intracellular (bounce_top enters)
             const dir = candidateProtein.pumpDirection ?? 'out';
             const requiredCollision = dir === 'out' ? 'bounce_bottom' : 'bounce_top';
             if (candidateProtein.hasATP && collision === requiredCollision) {
               allowEntry = true;
             }
           }

           if (allowEntry) {
             onProteinStatusChange(candidateProtein.id, 'transport_start');
             
             p.x = candidateProtein.x;
             p.y = collision === 'bounce_top' ? MEMBRANE_TOP : MEMBRANE_BOTTOM;
             p.vx = 0;
             p.vy = collision === 'bounce_top' ? config.speed * 0.5 : -config.speed * 0.5;
             p.isTransporting = true;
             continue; // Skip the bounce logic below
           }
        }

        // Just bounce off the squishy lipid bilayer
        p.vy *= -1;
        newY = collision === 'bounce_top' ? MEMBRANE_TOP - p.radius : MEMBRANE_BOTTOM + p.radius;
      }
    }
    
    // Add some random brownian motion jiggle, just slight
    p.vx += (Math.random() - 0.5) * 0.1;
    p.vy += (Math.random() - 0.5) * 0.1;

    // Normalize speed back to config.speed × speedMultiplier
    const speedSq = p.vx * p.vx + p.vy * p.vy;
    const effectiveSpeed = config.speed * speedMultiplier;
    const targetSpeedSq = effectiveSpeed * effectiveSpeed;
    if (speedSq > 0.01) {
       const ratio = Math.sqrt(targetSpeedSq / speedSq);
       p.vx *= ratio;
       p.vy *= ratio;
    }

    p.x = newX;
    p.y = newY;
  }
};
