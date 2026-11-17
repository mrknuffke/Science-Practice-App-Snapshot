import React from 'react';
import { Agent, AGENT_TYPES, COLORS, GRID_COLS, GRID_ROWS, CELL_SIZE } from './ecosystemConstants';

interface EcosystemCanvasProps {
  agents: Agent[];
  grid: number[][];
  width: number;
  height: number;
}

const PlantGrid = React.memo(({ grid }: { grid: number[][] }) => {
  const cells: React.ReactNode[] = [];

  for (let r = 0; r < GRID_ROWS; r++) {
    for (let c = 0; c < GRID_COLS; c++) {
      const x = c * CELL_SIZE;
      const y = r * CELL_SIZE;
      const hasPlant = grid[r][c] === 0;

      cells.push(
        <g key={`cell-${c}-${r}`}>
          {/* Base cell */}
          <rect
            x={x}
            y={y}
            width={CELL_SIZE}
            height={CELL_SIZE}
            fill={hasPlant ? '#86EFAC' : '#E8D5B7'}
            stroke="#d4c5a9"
            strokeWidth={0.5}
            strokeOpacity={0.3}
          />
          {/* Plant texture details */}
          {hasPlant && (
            <>
              <line
                x1={x + 5} y1={y + CELL_SIZE}
                x2={x + 4} y2={y + CELL_SIZE - 8}
                stroke="#059669" strokeWidth={1.5} strokeLinecap="round"
              />
              <line
                x1={x + 10} y1={y + CELL_SIZE}
                x2={x + 12} y2={y + CELL_SIZE - 10}
                stroke="#10B981" strokeWidth={1.2} strokeLinecap="round"
              />
              <line
                x1={x + 15} y1={y + CELL_SIZE}
                x2={x + 14} y2={y + CELL_SIZE - 7}
                stroke="#059669" strokeWidth={1} strokeLinecap="round"
              />
            </>
          )}
          {/* Bare ground texture */}
          {!hasPlant && (
            <circle
              cx={x + 10} cy={y + 10} r={1.5}
              fill="#C4A882" opacity={0.5}
            />
          )}
        </g>
      );
    }
  }
  return <>{cells}</>;
});

PlantGrid.displayName = 'PlantGrid';

export const EcosystemCanvas: React.FC<EcosystemCanvasProps> = ({
  agents,
  grid,
  width,
  height,
}) => {
  return (
    <div className="relative bg-emerald-50/20 rounded-2xl border-2 border-emerald-100/50 overflow-hidden shadow-inner">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
      >
        {/* Plant Grid */}
        <PlantGrid grid={grid} />

        {/* Agent Layer */}
        {agents.map((agent) => {
          const cx = agent.col * CELL_SIZE + CELL_SIZE / 2;
          const cy = agent.row * CELL_SIZE + CELL_SIZE / 2;

          if (agent.type === AGENT_TYPES.HERBIVORE) {
            return (
              <g
                key={agent.id}
                transform={`translate(${cx - 7}, ${cy - 7})`}
              >
                {/* Simple herbivore shape: oval body + small head */}
                <ellipse cx="7" cy="8" rx="5.5" ry="4.5" fill={COLORS.HERBIVORE} stroke="#1d4ed8" strokeWidth="0.8" />
                <circle cx="11" cy="5" r="2.5" fill={COLORS.HERBIVORE} stroke="#1d4ed8" strokeWidth="0.8" />
              </g>
            );
          } else {
            return (
              <g
                key={agent.id}
                transform={`translate(${cx - 7}, ${cy - 7})`}
              >
                <path
                  d="M1 3.5C1 3 1.3 2.4 1.7 2L3.5 0.4C3.9 0.1 4.4 0 4.9 0.15L6.2 0.8L7.5 0.15C8 0 8.5 0.1 8.9 0.4L10.7 2C11.1 2.4 11.4 3 11.4 3.5C11.4 4.1 11.2 4.6 10.7 5L10 5.7V7.3C10 7.9 9.5 8.4 8.8 8.4H8L7 9.5C6.5 10 5.9 10 5.4 9.5L4.4 8.4H3.6C2.9 8.4 2.4 7.9 2.4 7.3V5.7L1.7 5C1.2 4.6 1 4.1 1 3.5Z"
                  fill={COLORS.CARNIVORE}
                  stroke="#1e293b"
                  strokeWidth="0.8"
                />
              </g>
            );
          }
        })}
      </svg>
    </div>
  );
};
