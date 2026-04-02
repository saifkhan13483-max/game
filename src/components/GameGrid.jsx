import React, { useState, useCallback } from 'react';

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)); }

const DIR_ARROW = ['→', '↓', '←', '↑'];

export default function GameGrid({
  levelDef,
  grid,
  beam,
  onMove,
  onRotate,
}) {
  const [selected, setSelected] = useState(null); // { row, col }
  const { gridSize } = levelDef;

  const isMovable = useCallback((cell) => {
    if (!cell) return false;
    return cell.type.startsWith('movable-');
  }, []);

  const handleCellPointerDown = useCallback((e, row, col) => {
    e.preventDefault();
    const cell = grid[row][col];

    if (selected) {
      if (selected.row === row && selected.col === col) {
        // Tap selected again → rotate it
        onRotate(row, col);
        setSelected(null);
      } else if (!cell) {
        // Tap empty cell → move selected here
        onMove(selected.row, selected.col, row, col);
        setSelected(null);
      } else if (isMovable(cell)) {
        // Switch selection to different movable
        setSelected({ row, col });
      } else {
        // Tap fixed cell → deselect
        setSelected(null);
      }
      return;
    }

    // Nothing selected — tap a movable to select it
    if (isMovable(cell)) {
      setSelected({ row, col });
    }
  }, [grid, selected, onRotate, onMove, isMovable]);

  const beamSegments = beam?.segments ?? [];

  return (
    <div style={styles.wrapper}>
      {/* Selection instruction banner */}
      {selected && (
        <div style={styles.instructionBanner}>
          Tap an empty cell to <strong>move</strong> · Tap the mirror again to <strong>rotate</strong>
        </div>
      )}

      <div style={{
        ...styles.grid,
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
      }}>
        {/* Beam SVG overlay */}
        <svg
          style={styles.beamSvg}
          viewBox={`0 0 ${gridSize} ${gridSize}`}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="beam-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="0.1" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {beamSegments.map((seg, i) => {
            const x1 = seg.c1 + 0.5;
            const y1 = seg.r1 + 0.5;
            const x2 = seg.exit ? clamp(seg.c2 + 0.5, 0, gridSize) : seg.c2 + 0.5;
            const y2 = seg.exit ? clamp(seg.r2 + 0.5, 0, gridSize) : seg.r2 + 0.5;
            return (
              <g key={i}>
                {/* Glow halo */}
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#00F5FF" strokeWidth="0.22" strokeLinecap="round"
                  opacity="0.25" filter="url(#beam-glow)"
                />
                {/* Core beam */}
                <line x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="#00F5FF" strokeWidth="0.08" strokeLinecap="round"
                  opacity="0.95"
                />
              </g>
            );
          })}

          {/* Crystal pulse ring when hit */}
          {beam?.hitCrystal && (
            <circle
              cx={levelDef.crystal.col + 0.5}
              cy={levelDef.crystal.row + 0.5}
              r="0.38"
              fill="none" stroke="#BF5FFF" strokeWidth="0.07" opacity="0.7"
              style={{ animation: 'crystalGlow 1.2s ease-in-out infinite' }}
            />
          )}
        </svg>

        {/* Grid cells */}
        {Array.from({ length: gridSize }, (_, row) =>
          Array.from({ length: gridSize }, (_, col) => {
            const cell = grid[row][col];
            const isSelectedCell = selected?.row === row && selected?.col === col;
            const isValidTarget = selected && !cell;

            return (
              <div
                key={`${row}-${col}`}
                style={{
                  ...styles.cell,
                  ...(isSelectedCell ? styles.cellSelected : {}),
                  ...(isValidTarget ? styles.cellTarget : {}),
                  cursor: (isMovable(cell) || (selected && !cell)) ? 'pointer' : 'default',
                }}
                onPointerDown={e => handleCellPointerDown(e, row, col)}
              >
                {cell && renderCell(cell, isSelectedCell, beam?.hitCrystal, levelDef)}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function renderCell(cell, isSelected, hitCrystal) {
  const { type } = cell;

  // ── SOURCE ──
  if (type === 'source') {
    return (
      <div style={styles.source}>
        <div style={styles.sourceArrow}>{DIR_ARROW[cell.direction] ?? '→'}</div>
      </div>
    );
  }

  // ── CRYSTAL ──
  if (type === 'crystal') {
    return (
      <div style={{
        ...styles.crystal,
        filter: hitCrystal
          ? 'drop-shadow(0 0 10px #00F5FF) drop-shadow(0 0 18px #BF5FFF)'
          : 'drop-shadow(0 0 5px #BF5FFF)',
        transform: hitCrystal ? 'scale(1.25)' : 'scale(1)',
        transition: 'transform 0.3s, filter 0.3s',
        animation: 'crystalGlow 2s ease-in-out infinite',
      }}>
        ◆
      </div>
    );
  }

  // ── BLOCKER ──
  if (type === 'blocker' || type === 'movable-blocker') {
    const movable = type === 'movable-blocker';
    return (
      <div style={{
        ...styles.blocker,
        background: movable
          ? 'linear-gradient(135deg, #8B3000, #FF7B00)'
          : 'linear-gradient(135deg, #6B0020, #CC2255)',
        borderColor: movable ? '#FF7B00' : '#FF2D78',
        boxShadow: isSelected ? `0 0 14px ${movable ? '#FF7B00' : '#FF2D78'}` : 'none',
      }}>
        {movable && <div style={styles.movableTag}>MOVE</div>}
      </div>
    );
  }

  // ── MIRROR ──
  if (type.includes('mirror')) {
    const isForward = type.includes('forward');
    const movable = type.startsWith('movable-');
    return (
      <div style={{
        ...styles.mirror,
        borderColor: isSelected ? '#FFD700' : '#BF5FFF',
        background: isSelected
          ? 'rgba(255,215,0,0.12)'
          : movable
            ? 'rgba(191,95,255,0.1)'
            : 'rgba(80,0,160,0.2)',
        boxShadow: isSelected
          ? '0 0 18px rgba(255,215,0,0.5), inset 0 0 8px rgba(255,215,0,0.1)'
          : '0 0 8px rgba(191,95,255,0.3)',
      }}>
        <span style={{
          fontSize: 'clamp(18px, 5vw, 28px)',
          color: isSelected ? '#FFD700' : '#E08FFF',
          fontWeight: 900, lineHeight: 1,
          filter: isSelected ? 'drop-shadow(0 0 5px #FFD700)' : 'drop-shadow(0 0 4px #BF5FFF)',
          userSelect: 'none',
        }}>
          {isForward ? '/' : '\\'}
        </span>
        {movable && !isSelected && (
          <div style={styles.movableMirrorTag}>TAP</div>
        )}
        {isSelected && (
          <div style={{ ...styles.movableMirrorTag, color: '#FFD700' }}>SELECTED</div>
        )}
      </div>
    );
  }

  return null;
}

const styles = {
  wrapper: {
    width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  },
  instructionBanner: {
    width: '100%', padding: '8px 14px',
    background: 'rgba(255,215,0,0.08)',
    border: '1px solid rgba(255,215,0,0.2)',
    borderRadius: 10,
    fontSize: 12, color: '#FFD700', textAlign: 'center',
    animation: 'pulse-glow 2s ease-in-out infinite',
  },
  grid: {
    display: 'grid', width: '100%', aspectRatio: '1',
    gap: '4px', padding: '4px',
    background: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
    border: '1px solid rgba(0,245,255,0.1)',
    position: 'relative',
  },
  beamSvg: {
    position: 'absolute', top: '4px', left: '4px',
    width: 'calc(100% - 8px)', height: 'calc(100% - 8px)',
    pointerEvents: 'none', zIndex: 10, borderRadius: 10,
  },
  cell: {
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 9,
    border: '1px solid rgba(255,255,255,0.07)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', minWidth: 0, minHeight: 0,
    transition: 'background 0.12s, border-color 0.12s',
    userSelect: 'none', WebkitUserSelect: 'none',
    touchAction: 'none',
  },
  cellSelected: {
    background: 'rgba(255,215,0,0.08)',
    border: '1px solid rgba(255,215,0,0.5)',
  },
  cellTarget: {
    background: 'rgba(0,245,255,0.05)',
    border: '1.5px dashed rgba(0,245,255,0.45)',
  },

  // Source
  source: {
    width: '76%', height: '76%', borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,245,255,0.25) 0%, rgba(0,80,80,0.2) 100%)',
    border: '2.5px solid #00F5FF',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 0 14px rgba(0,245,255,0.5)',
  },
  sourceArrow: {
    fontSize: 'clamp(14px, 3.5vw, 22px)', color: '#00F5FF',
    fontWeight: 700, filter: 'drop-shadow(0 0 4px #00F5FF)',
  },

  // Crystal
  crystal: {
    fontSize: 'clamp(18px, 5.5vw, 30px)', lineHeight: 1, userSelect: 'none',
  },

  // Blocker
  blocker: {
    width: '78%', height: '78%', borderRadius: 7,
    border: '2.5px solid', display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column', gap: 2,
  },
  movableTag: {
    fontSize: 7, color: 'rgba(255,255,255,0.5)',
    fontWeight: 700, letterSpacing: '0.05em',
  },

  // Mirror
  mirror: {
    width: '82%', height: '82%', borderRadius: 9,
    border: '2px solid',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexDirection: 'column',
    cursor: 'pointer',
    transition: 'box-shadow 0.15s, border-color 0.15s, background 0.15s',
    position: 'relative',
  },
  movableMirrorTag: {
    fontSize: 7, color: 'rgba(191,95,255,0.6)',
    fontWeight: 700, letterSpacing: '0.06em', marginTop: 1,
    position: 'absolute', bottom: 3,
  },
};
