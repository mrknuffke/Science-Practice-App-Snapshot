import { KineticParticle, ScenarioMode } from '../../../types';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BASE_ACTIVATION_ENERGY, CATALYST_REDUCTION, BIO_ENZYME_EA, REACTANT_PROPERTIES, ENZYME_COLD_THRESHOLD } from './kineticsConstants';

// Helper for elastic 2D collisions
const resolveElasticCollision = (p1: KineticParticle, p2: KineticParticle) => {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  if (distance === 0) return; // Prevent div by 0

  // Optional: separate overlapping particles
  const minDistance = p1.radius + p2.radius;
  if (distance < minDistance) {
    const overlap = minDistance - distance;
    const nx = dx / distance;
    const ny = dy / distance;
    // Push them apart proportionately to their inverse mass
    const totalMass = p1.mass + p2.mass;
    p1.x -= nx * overlap * (p2.mass / totalMass);
    p1.y -= ny * overlap * (p2.mass / totalMass);
    p2.x += nx * overlap * (p1.mass / totalMass);
    p2.y += ny * overlap * (p1.mass / totalMass);
  }

  // Velocity calculations via 1D elastic collision along the normal
  const nx = dx / distance;
  const ny = dy / distance;
  const tx = -ny;
  const ty = nx;

  // Dot product
  const dpTan1 = p1.vx * tx + p1.vy * ty;
  const dpTan2 = p2.vx * tx + p2.vy * ty;
  const dpNorm1 = p1.vx * nx + p1.vy * ny;
  const dpNorm2 = p2.vx * nx + p2.vy * ny;

  // 1D elastic collision in normal direction
  const m1 = (dpNorm1 * (p1.mass - p2.mass) + 2 * p2.mass * dpNorm2) / (p1.mass + p2.mass);
  const m2 = (dpNorm2 * (p2.mass - p1.mass) + 2 * p1.mass * dpNorm1) / (p1.mass + p2.mass);

  p1.vx = tx * dpTan1 + nx * m1;
  p1.vy = ty * dpTan1 + ny * m1;
  p2.vx = tx * dpTan2 + nx * m2;
  p2.vy = ty * dpTan2 + ny * m2;
};

// Physics and kinetics loop
export const simulateKineticsStep = (
  particles: KineticParticle[],
  mode: ScenarioMode,
  temperatureFactor: number, // 0.1 to 2.0
  hasCatalyst: boolean,
  onReactionOccurred: () => void
) => {
  // Determine effective Activation Energy
  let Ea = BASE_ACTIVATION_ENERGY[mode];
  if (mode === 'chemistry' && hasCatalyst) Ea -= CATALYST_REDUCTION;

  // Update positions & wall bounces
  for (let i = 0; i < particles.length; i++) {
    const p = particles[i];
    
    // Slight random drift/energy maintenance to keep simulation lively based on temperature
    p.vx += (Math.random() - 0.5) * 0.1 * temperatureFactor;
    p.vy += (Math.random() - 0.5) * 0.1 * temperatureFactor;

    // Boundary bounces
    if (p.x - p.radius < 0) { p.x = p.radius; p.vx *= -1; }
    if (p.x + p.radius > CANVAS_WIDTH) { p.x = CANVAS_WIDTH - p.radius; p.vx *= -1; }
    if (p.y - p.radius < 0) { p.y = p.radius; p.vy *= -1; }
    if (p.y + p.radius > CANVAS_HEIGHT) { p.y = CANVAS_HEIGHT - p.radius; p.vy *= -1; }

    p.x += p.vx;
    p.y += p.vy;
    
    // Update kinetic energy tally (1/2 m v^2)
    p.energy = 0.5 * p.mass * (p.vx * p.vx + p.vy * p.vy);
  }

  // Broadphase collision detection O(N^2) (fine for ~100 particles)
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const p1 = particles[i];
      const p2 = particles[j];
      
      if (p1.dead || p2.dead) continue;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const distSq = dx * dx + dy * dy;
      const minDist = p1.radius + p2.radius;
      
      if (distSq < minDist * minDist) {
        // Evaluate reactive potential BEFORE resolving bounce
        const relVx = p1.vx - p2.vx;
        const relVy = p1.vy - p2.vy;
        const collisionEnergy = 0.5 * (p1.mass * p2.mass / (p1.mass + p2.mass)) * (relVx * relVx + relVy * relVy);

        // Chemistry logic: A + B -> Product
        if (mode === 'chemistry') {
          if ((p1.type === 'A' && p2.type === 'B') || (p1.type === 'B' && p2.type === 'A')) {
            if (collisionEnergy > Ea) {
              // React!
              // For simplicity, we turn BOTH into "Product" to visually conserve the particles
              // Or we turn one into Product and hide the other off-screen to delete it later
              // But modifying array length here is tricky. Let's merge them into one 'Product'
              // and mark the other for deletion.
              p1.type = 'Product';
              p1.radius = REACTANT_PROPERTIES.Product.radius;
              p1.mass = REACTANT_PROPERTIES.Product.mass;
              p1.vx = (p1.vx + p2.vx) * 0.5; // Conserve momentum roughly
              p1.vy = (p1.vy + p2.vy) * 0.5;
              
              p2.type = 'A'; // Hack: will be spliced out at the end if marked. Let's add a "dead" flag instead.
              p2.dead = true;
              p2.x = -1000; p2.y = -1000; p2.vx = 0; p2.vy = 0;
              
              onReactionOccurred();
              continue; // Don't bounce them elastically if they merged
            }
          }
        } 
        // Biology Logic: Enzyme + A (Substrate) -> Enzyme + Product
        else if (mode === 'biology') {
          // Identify if we have an Enzyme and a Substrate ('A')
          let enzyme: KineticParticle | null = null;
          let substrate: KineticParticle | null = null;
          if (p1.type === 'Enzyme' && p2.type === 'A') { enzyme = p1; substrate = p2; }
          if (p2.type === 'Enzyme' && p1.type === 'A') { enzyme = p2; substrate = p1; }

          if (enzyme && substrate) {
            // Denatured enzymes don't react
            const denatured = enzyme.enzymeDenatured;
            // Cold suppression: below threshold, reactions are blocked
            const tooCold = temperatureFactor < ENZYME_COLD_THRESHOLD;
            if (!denatured && !tooCold && collisionEnergy > BIO_ENZYME_EA) {
              substrate.type = 'Product';
              substrate.radius = REACTANT_PROPERTIES.Product.radius;
              resolveElasticCollision(p1, p2);
              onReactionOccurred();
              continue;
            }
          }
        }

        // Just standard elastic bounce if no reaction occurred
        resolveElasticCollision(p1, p2);
      }
    }
  }

  // Cleanup dead particles if any
  for (let i = particles.length - 1; i >= 0; i--) {
     if (particles[i].dead) {
       particles.splice(i, 1);
     }
  }
};
