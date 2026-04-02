import React, { useState, useRef, useCallback, useEffect } from 'react';
import { computeBeam } from '../engine/laserEngine.js';

const CELL_TYPES = {
  source: { label: '◉', color: '#00F5FF' },
  crystal: { label: '◆', color: '#BF5FFF' },
  blocker: { label: '■', color: '#FF2D78' },
  'movable-blocker': { label: '■', color: '#FF7B00' },
  'mirror-forward': { label: '/', color: '#BF5FFF' },
  'mirror-backward': { label: '\\', color: '#BF5FFF' },
  'movable-mirror-forward': { label: '/', color: '#E08FFF' },
  'movable-mirror-backward': { label: '\\', color: '#E08FFF' },
};

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

export default function GameGrid({
  levelDef,
  grid,
  onMove,
  onRotate,
  moveCount,
  isComplete,
}) {
  const [selected, setSelected] = useState(null); // { row, col }
  const [dragSource, setDragSource] = useState(null);
  const [dragPos, setDragPos] = useState(null);
  const containerRef = useRef(null);
  const { gridSize, source } = levelDef;

  const beam = computeBeam(grid, source, gridSize);

  const isMovable = useCallback((cell) => {
    if (!cell) return false;
    return cell.type.startsWith('movable-');
  }, []);

  const handleCellPointerDown = useCallback((e, row, col) => {
    e.preventDefault();
    const cell = grid[row][col];

    if (selected) {
      // Something is already selected
      if (selected.row === row && selected.col === col) {
        // Tap selected cell again → rotate
        onRotate(row, col);
        setSelected(null);
      } else if (!cell) {
        // Tap empty cell → move selected object here
        onMove(selected.row, selected.col, row, col);
        setSelected(null);
      } else if (isMovable(cell)) {
        // Tap a different movable → switch selection
        setSelected({ row, col });
      } else {
        // Tap fixed cell → deselect
        setSelected(null);
      }
      return;
    }

    // Nothing selected yet — select movable
    if (isMovable(cell)) {
      setSelected({ row, col });
    }
  }, [grid, selected, onRotate, onMove, isMovable]);

  // eslint-disable-next-line no-unused-vars
  const handleCellPointerUp = useCallback((e, row, col) => {
    // Drag-and-drop handled via pointerDown logic above
  }, []);

  // eslint-disable-next-line no-unused-vars
  const handleSelectedCellClick = useCallback((row, col) => {
    // All logic handled in pointerDown
  }, []);

  // Calculate beam segments as canvas drawing instructions
  const beamSegments = beam.segments;

  return (
    <div ref={containerRef} style={styles.wrapper}>
      <div
        style={{
          ...styles.grid,
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          gridTemplateRows: `repeat(${gridSize}, 1fr)`,
        }}
      >
        {/* Beam overlay SVG */}
        <svg
          style={styles.beamSvg}
          viewBox={`0 0 ${gridSize} ${gridSize}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="beam-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.08" result="blur1"/>
              <feGaussianBlur stdDeviation="0.04" result="blur2"/>
              <feMerge>
                <feMergeNode in="blur1"/>
                <feMergeNode in="blur2"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <filter id="crystal-glow" x="-100%" y="-100%" width="300%" height="300%">
              <feGaussianBlur stdDeviation="0.15" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {beamSegments.map((seg, i) => {
            const x1 = seg.c1 + 0.5;
            const y1 = seg.r1 + 0.5;
            let x2, y2;
            if (seg.exit) {
              // Clamp to grid boundary
              x2 = clamp(seg.c2 + 0.5, 0, gridSize);
              y2 = clamp(seg.r2 + 0.5, 0, gridSize);
            } else {
              x2 = seg.c2 + 0.5;
              y2 = seg.r2 + 0.5;
            }
            return (
              <g key={i}>
                {/* Outer glow */}
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={beam.hitCrystal ? '#00F5FF' : '#00C4CC'}
                  strokeWidth="0.18"
                  strokeLinecap="round"
                  opacity="0.4"
                  filter="url(#beam-glow)"
                  style={{ animation: 'beamPulse 2s ease-in-out infinite' }}
                />
                {/* Core beam */}
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#00F5FF"
                  strokeWidth="0.07"
                  strokeLinecap="round"
                  opacity="0.95"
                />
              </g>
            );
          })}

          {/* Crystal hit burst */}
          {beam.hitCrystal && (
            <circle
              cx={levelDef.crystal.col + 0.5}
              cy={levelDef.crystal.row + 0.5}
              r="0.35"
              fill="none"
              stroke="#BF5FFF"
              strokeWidth="0.06"
              opacity="0.7"
              style={{ animation: 'crystalGlow 1.5s ease-in-out infinite' }}
            />
          )}
        </svg>

        {/* Grid cells */}
        {Array.from({ length: gridSize }, (_, row) =>
          Array.from({ length: gridSize }, (_, col) => {
            const cell = grid[row][col];
            const isSelectedCell = selected && selected.row === row && selected.col === col;
            const isValidTarget = selected && !cell && !(row === selected.row && col === selected.col);

            return (
              <div
                key={`${row}-${col}`}
                style={{
                  ...styles.cell,
                  ...(isSelectedCell ? styles.cellSelected : {}),
                  ...(isValidTarget ? styles.cellTarget : {}),
                }}
                onPointerDown={e => handleCellPointerDown(e, row, col)}
                onPointerUp={e => handleCellPointerUp(e, row, col)}
                onClick={() => selected && handleSelectedCellClick(row, col)}
              >
                {cell && renderCell(cell, row, col, isSelectedCell, beam.hitCrystal, levelDef)}
              </div>
            );
          })
        )}
      </div>

      {/* Selected object hint */}
      {selected && (
        <div style={styles.hint}>
          Tap empty cell to move · Tap again to rotate
        </div>
      )}
    </div>
  );
}

function renderCell(cell, row, col, isSelected, hitCrystal, levelDef) {
  const isCrystal = cell.type === 'crystal';
  const isSource = cell.type === 'source';
  const isBlocker = cell.type === 'blocker' || cell.type === 'movable-blocker';
  const isMirror = cell.type.includes('mirror');

  if (isSource) {
    const dirs = ['→', '↓', '←', '↑'];
    return (
      <div style={styles.source}>
        <div style={styles.sourceInner}>{dirs[cell.direction]}</div>
      </div>
    );
  }

  if (isCrystal) {
    return (
      <div style={{
        ...styles.crystal,
        animation: hitCrystal ? 'crystalGlow 1s ease-in-out infinite' : 'crystalGlow 2s ease-in-out infinite',
        filter: hitCrystal
          ? 'drop-shadow(0 0 8px #00F5FF) drop-shadow(0 0 16px #BF5FFF) drop-shadow(0 0 4px #FF2D78)'
          : 'drop-shadow(0 0 4px #BF5FFF)',
        transform: hitCrystal ? 'scale(1.2)' : 'scale(1)',
        transition: 'transform 0.3s, filter 0.3s',
      }}>
        ◆
      </div>
    );
  }

  if (isBlocker) {
    return (
      <div style={{
        ...styles.blocker,
        background: cell.type === 'movable-blocker'
          ? 'linear-gradient(135deg, #CC4400, #FF7B00)'
          : 'linear-gradient(135deg, #880022, #FF2D78)',
        borderColor: cell.type === 'movable-blocker' ? '#FF7B00' : '#FF2D78',
        boxShadow: isSelected ? '0 0 12px #FF7B00' : 'none',
        cursor: cell.type === 'movable-blocker' ? 'pointer' : 'default',
      }}>
        {cell.type === 'movable-blocker' && <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>DRAG</span>}
      </div>
    );
  }

  if (isMirror) {
    const isForward = cell.type.includes('forward');
    const isMovableCell = cell.type.startsWith('movable-');
    return (
      <div style={{
        ...styles.mirror,
        borderColor: isSelected ? '#FFD700' : '#BF5FFF',
        boxShadow: isSelected
          ? '0 0 16px #FFD700, inset 0 0 8px rgba(255,215,0,0.2)'
          : '0 0 8px rgba(191,95,255,0.4)',
        background: isSelected
          ? 'linear-gradient(135deg, rgba(255,215,0,0.15), rgba(191,95,255,0.1))'
          : isMovableCell
          ? 'linear-gradient(135deg, rgba(191,95,255,0.15), rgba(100,0,180,0.1))'
          : 'linear-gradient(135deg, rgba(100,0,180,0.3), rgba(50,0,100,0.3))',
      }}>
        <span style={{
          fontSize: 'clamp(16px, 4vw, 24px)',
          color: isSelected ? '#FFD700' : '#BF5FFF',
          fontWeight: 900, lineHeight: 1,
          filter: isSelected ? 'drop-shadow(0 0 4px #FFD700)' : 'drop-shadow(0 0 4px #BF5FFF)',
          userSelect: 'none',
        }}>
          {isForward ? '/' : '\\'}
        </span>
        {isMovableCell && (
          <div style={styles.movableBadge}>DRAG</div>
        )}
      </div>
    );
  }

  return null;
}

const styles = {
  wrapper: {
    position: 'relative',
    width: '100%',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  grid: {
    display: 'grid',
    width: '100%',
    aspectRatio: '1',
    gap: '3px',
    padding: '3px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: 12,
    border: '1px solid rgba(0,245,255,0.1)',
    position: 'relative',
  },
  beamSvg: {
    position: 'absolute',
    top: '3px', left: '3px',
    width: 'calc(100% - 6px)',
    height: 'calc(100% - 6px)',
    pointerEvents: 'none',
    zIndex: 10,
    borderRadius: 10,
  },
  cell: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative',
    cursor: 'pointer',
    transition: 'background 0.15s',
    border: '1px solid rgba(255,255,255,0.06)',
    minWidth: 0, minHeight: 0,
  },
  cellSelected: {
    background: 'rgba(255,215,0,0.1)',
    border: '1px solid rgba(255,215,0,0.4)',
  },
  cellTarget: {
    background: 'rgba(0,245,255,0.06)',
    border: '1px dashed rgba(0,245,255,0.4)',
    animation: 'pulse-glow 1.5s ease-in-out infinite',
  },
  source: {
    width: '80%', height: '80%',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,245,255,0.3) 0%, rgba(0,100,100,0.2) 100%)',
    border: '2px solid #00F5FF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 12px rgba(0,245,255,0.5)',
  },
  sourceInner: {
    fontSize: 'clamp(12px, 3vw, 18px)',
    color: '#00F5FF',
    fontWeight: 700,
    filter: 'drop-shadow(0 0 4px #00F5FF)',
  },
  crystal: {
    fontSize: 'clamp(16px, 5vw, 28px)',
    lineHeight: 1,
    userSelect: 'none',
  },
  blocker: {
    width: '80%', height: '80%',
    borderRadius: 6,
    border: '2px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: 2,
  },
  mirror: {
    width: '80%', height: '80%',
    borderRadius: 8,
    border: '2px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column',
    position: 'relative',
    cursor: 'pointer',
    transition: 'box-shadow 0.2s, border-color 0.2s',
  },
  movableBadge: {
    position: 'absolute', bottom: 2,
    fontSize: 7, color: 'rgba(191,95,255,0.6)',
    letterSpacing: '0.05em',
  },
  hint: {
    marginTop: 8,
    fontSize: 11, color: 'rgba(0,245,255,0.6)',
    letterSpacing: '0.05em', textAlign: 'center',
  },
};
