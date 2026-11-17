import {
  Agent,
  AGENT_TYPES,
  EcosystemParameters,
  EcosystemState,
  GRID_COLS,
  GRID_ROWS,
  SIM,
} from './ecosystemConstants';



const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Helpers ---

function cellKey(col: number, row: number): string {
  return `${col},${row}`;
}

function buildSpatialIndex(agents: Agent[]): Map<string, Agent[]> {
  const map = new Map<string, Agent[]>();
  for (const agent of agents) {
    const key = cellKey(agent.col, agent.row);
    const list = map.get(key);
    if (list) {
      list.push(agent);
    } else {
      map.set(key, [agent]);
    }
  }
  return map;
}

function getNeighborCells(col: number, row: number): Array<[number, number]> {
  const neighbors: Array<[number, number]> = [];
  const dirs: Array<[number, number]> = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (const [dc, dr] of dirs) {
    const nc = col + dc;
    const nr = row + dr;
    if (nc >= 0 && nc < GRID_COLS && nr >= 0 && nr < GRID_ROWS) {
      neighbors.push([nc, nr]);
    }
  }
  return neighbors;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createGrid(): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < GRID_ROWS; r++) {
    grid.push(new Array(GRID_COLS).fill(0));
  }
  return grid;
}

function countPlants(grid: number[][]): number {
  let count = 0;
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (grid[r][c] === 0) count++;
    }
  }
  return count;
}

// --- Public API ---

export const initializeEcosystem = (): EcosystemState => {
  return {
    agents: [],
    grid: createGrid(),
    plantCount: 0,
    herbivoreCount: 0,
    carnivoreCount: 0,
    tick: 0,
  };
};

export const seedEcosystem = (params: EcosystemParameters): EcosystemState => {
  const grid = createGrid(); // all 0 = all plants

  // Set bare cells (non-plant) with countdown timer
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (Math.random() >= params.seedPlantDensity) {
        // Bare cell: random countdown so regrowth is staggered (like NetLogo)
        grid[r][c] = Math.floor(Math.random() * params.plantRegrowthTime) + 1;
      }
    }
  }

  const agents: Agent[] = [];

  // Herbivores with randomized starting energy (NetLogo: random(2 * gain))
  for (let i = 0; i < params.seedHerbivores; i++) {
    agents.push({
      id: generateId(),
      type: AGENT_TYPES.HERBIVORE,
      col: Math.floor(Math.random() * GRID_COLS),
      row: Math.floor(Math.random() * GRID_ROWS),
      energy: Math.floor(Math.random() * 2 * params.herbivoreEnergyFromPlant) + 1,
    });
  }

  // Carnivores with randomized starting energy (NetLogo: random(2 * gain))
  for (let i = 0; i < params.seedCarnivores; i++) {
    agents.push({
      id: generateId(),
      type: AGENT_TYPES.CARNIVORE,
      col: Math.floor(Math.random() * GRID_COLS),
      row: Math.floor(Math.random() * GRID_ROWS),
      energy: Math.floor(Math.random() * 2 * params.carnivoreEnergyFromHerbivore) + 1,
    });
  }

  return {
    agents,
    grid,
    plantCount: countPlants(grid),
    herbivoreCount: params.seedHerbivores,
    carnivoreCount: params.seedCarnivores,
    tick: 0,
  };
};

export const updateEcosystem = (
  state: EcosystemState,
  params: EcosystemParameters
): EcosystemState => {
  // Deep-copy grid
  const grid = state.grid.map(row => [...row]);

  // Working copy of agents
  const alive: Agent[] = state.agents.map(a => ({ ...a }));
  const dead = new Set<string>();
  const newBorns: Agent[] = [];

  // --- 1. Process herbivores (NetLogo: ask sheep [...]) ---
  const herbivores = shuffle(alive.filter(a => a.type === AGENT_TYPES.HERBIVORE));

  for (const herb of herbivores) {
    // Move: random adjacent cell
    const neighbors = getNeighborCells(herb.col, herb.row);
    if (neighbors.length > 0) {
      const [nc, nr] = neighbors[Math.floor(Math.random() * neighbors.length)];
      herb.col = nc;
      herb.row = nr;
    }

    // Energy cost for moving
    herb.energy -= SIM.HERBIVORE_MOVE_COST;

    // Eat plant if on a grown cell (grid === 0)
    if (grid[herb.row][herb.col] === 0) {
      grid[herb.row][herb.col] = params.plantRegrowthTime; // start countdown
      herb.energy += params.herbivoreEnergyFromPlant;
    }

    // Death check (NetLogo: if energy < 0 [die])
    if (herb.energy < 0) {
      dead.add(herb.id);
      continue; // skip reproduction if dead
    }

    // Reproduce (NetLogo: random-float 100 < reproduce%, energy / 2)
    const totalAgents = (alive.length - dead.size) + newBorns.length;
    if (
      Math.random() < params.herbivoreReproduceChance &&
      totalAgents < SIM.MAX_AGENTS
    ) {
      const spawnCells = getNeighborCells(herb.col, herb.row);
      if (spawnCells.length > 0) {
        const [sc, sr] = spawnCells[Math.floor(Math.random() * spawnCells.length)];
        const childEnergy = Math.floor(herb.energy / 2);
        herb.energy = herb.energy - childEnergy;
        newBorns.push({
          id: generateId(),
          type: AGENT_TYPES.HERBIVORE,
          col: sc,
          row: sr,
          energy: childEnergy,
        });
      }
    }
  }

  // --- 2. Build spatial index of living herbivores for carnivore hunting ---
  const livingHerbivores = [
    ...herbivores.filter(h => !dead.has(h.id)),
    ...newBorns.filter(a => a.type === AGENT_TYPES.HERBIVORE),
  ];
  const herbivoreIndex = buildSpatialIndex(livingHerbivores);

  // --- 3. Process carnivores (NetLogo: ask wolves [...]) ---
  const carnivores = shuffle(alive.filter(a => a.type === AGENT_TYPES.CARNIVORE));

  for (const carn of carnivores) {
    // Move: random adjacent cell
    const neighbors = getNeighborCells(carn.col, carn.row);
    if (neighbors.length > 0) {
      const [nc, nr] = neighbors[Math.floor(Math.random() * neighbors.length)];
      carn.col = nc;
      carn.row = nr;
    }

    // Energy cost for moving
    carn.energy -= SIM.CARNIVORE_MOVE_COST;

    // Eat: grab a random herbivore on this cell (NetLogo: one-of sheep-here)
    const cellAgents = herbivoreIndex.get(cellKey(carn.col, carn.row));
    if (cellAgents && cellAgents.length > 0) {
      const prey = cellAgents.find(a => !dead.has(a.id));
      if (prey) {
        // 100% catch on co-location (NetLogo style)
        dead.add(prey.id);
        carn.energy += params.carnivoreEnergyFromHerbivore;
        // Remove from index to prevent double-eating
        const remaining = cellAgents.filter(a => a.id !== prey.id);
        herbivoreIndex.set(cellKey(carn.col, carn.row), remaining);
      }
    }

    // Death check
    if (carn.energy < 0) {
      dead.add(carn.id);
      continue;
    }

    // Reproduce (energy split)
    const totalAgents = (alive.length - dead.size) + newBorns.length;
    if (
      Math.random() < params.carnivoreReproduceChance &&
      totalAgents < SIM.MAX_AGENTS
    ) {
      const spawnCells = getNeighborCells(carn.col, carn.row);
      if (spawnCells.length > 0) {
        const [sc, sr] = spawnCells[Math.floor(Math.random() * spawnCells.length)];
        const childEnergy = Math.floor(carn.energy / 2);
        carn.energy = carn.energy - childEnergy;
        newBorns.push({
          id: generateId(),
          type: AGENT_TYPES.CARNIVORE,
          col: sc,
          row: sr,
          energy: childEnergy,
        });
      }
    }
  }

  // --- 4. Plant regrowth (NetLogo: ask patches [grow-grass]) ---
  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      if (grid[r][c] > 0) {
        grid[r][c] -= 1; // countdown; reaches 0 = regrown
      }
    }
  }

  // --- 5. Assemble final agent list ---
  const finalAgents = [
    ...alive.filter(a => !dead.has(a.id)),
    ...newBorns,
  ];

  const herbivoreCount = finalAgents.filter(a => a.type === AGENT_TYPES.HERBIVORE).length;
  const carnivoreCount = finalAgents.filter(a => a.type === AGENT_TYPES.CARNIVORE).length;

  return {
    agents: finalAgents,
    grid,
    plantCount: countPlants(grid),
    herbivoreCount,
    carnivoreCount,
    tick: state.tick + 1,
  };
};
