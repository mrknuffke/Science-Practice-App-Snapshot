import { RegulatoryNode, RegulatoryConnection } from '../../../types';
import { DECAY_RATE, ACTIVATION_RATE, REPRESSION_RATE } from './modelerConstants';

export function calculateNextStep(
  nodes: RegulatoryNode[],
  connections: RegulatoryConnection[],
  decayRate: number = DECAY_RATE
): RegulatoryNode[] {
  // Create a map of incoming influences for each node
  const influences = new Map<string, { activation: number; repression: number }>();
  
  // Initialize influences
  nodes.forEach(n => influences.set(n.id, { activation: 0, repression: 0 }));

  // Calculate sum of incoming signals
  connections.forEach(conn => {
    const sourceNode = nodes.find(n => n.id === conn.sourceId);
    if (!sourceNode) return;

    // Fractional activity (0 to 1.0)
    const normalizedActivity = sourceNode.activationLevel / 100.0;
    
    // Only apply meaningful signals
    if (normalizedActivity < 0.05) return;

    const targetInfluence = influences.get(conn.targetId);
    if (targetInfluence) {
      if (conn.type === 'activation') {
        targetInfluence.activation += normalizedActivity * conn.strength * ACTIVATION_RATE;
      } else {
        targetInfluence.repression += normalizedActivity * conn.strength * REPRESSION_RATE;
      }
    }
  });

  // Apply influences, decay, and clamp
  return nodes.map(node => {
    // Manually toggled signal nodes do not decay or change unless the user changes them
    if (node.isManualToggle) {
      return { ...node };
    }

    const currentLevel = node.activationLevel;
    const influence = influences.get(node.id) || { activation: 0, repression: 0 };
    
    // Decay is proportional to current level (higher level = faster decay)
    const decay = currentLevel * decayRate;
    
    // Core formula: Next = Current - Decay + Activation - Repression
    let nextLevel = currentLevel - decay + influence.activation - influence.repression;

    // Clamp between 0 and 100
    if (nextLevel < 0) nextLevel = 0;
    if (nextLevel > 100) nextLevel = 100;

    return {
      ...node,
      activationLevel: nextLevel
    };
  });
}
