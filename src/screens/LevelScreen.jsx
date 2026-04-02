import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../context/GameContext.jsx';
import { getLevelById } from '../data/levels.js';
import { getTodaysChallenge } from '../data/dailyChallenges.js';
import { buildGrid, computeBeam, getStarRating } from '../engine/laserEngine.js';
import GameGrid from '../components/GameGrid.jsx';
import HintModal from '../components/HintModal.jsx';

function initGridState(levelDef) {
  // Build movable positions map: id → {row, col}
  const movablePositions = {};
  for (const obj of levelDef.movable) {
    movablePositions[obj.id] = { row: obj.row, col: obj.col };
  }
  return { movablePositions };
}

function buildGridFromState(levelDef, movablePositions) {
  const { gridSize, source, crystal, fixed = [], movable = [] } = levelDef;
  const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));

  grid[source.row][source.col] = { type: 'source', direction: source.direction };
  grid[crystal.row][crystal.col] = { type: 'crystal' };

  for (const obj of fixed) {
    grid[obj.row][obj.col] = { type: obj.type, id: obj.id };
  }

  for (const obj of movable) {
    const pos = movablePositions[obj.id] || { row: obj.row, col: obj.col };
    const cellData = { type: obj.type, id: obj.id };
    // Check slot is free
    if (!grid[pos.row][pos.col]) {
      grid[pos.row][pos.col] = cellData;
    }
  }

  return grid;
}

function buildRotatedType(type) {
  if (type === 'movable-mirror-forward') return 'movable-mirror-backward';
  if (type === 'movable-mirror-backward') return 'movable-mirror-forward';
  if (type === 'mirror-forward') return 'mirror-backward';
  if (type === 'mirror-backward') return 'mirror-forward';
  return type;
}

export default function LevelScreen() {
  const { currentLevelId, isDailyChallenge, setScreen, completeLevel, save, useHint } = useGame();

  const levelDef = isDailyChallenge
    ? getTodaysChallenge()
    : getLevelById(currentLevelId);

  const [state, setState] = useState(() => initGridState(levelDef));
  const [movableTypes, setMovableTypes] = useState(() => {
    const types = {};
    for (const obj of levelDef.movable) {
      types[obj.id] = obj.type;
    }
    return types;
  });
  const [moveCount, setMoveCount] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [crystalHitTime, setCrystalHitTime] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const completingRef = useRef(false);

  // Build full level def with current movable types
  const currentLevelDef = {
    ...levelDef,
    movable: levelDef.movable.map(obj => ({
      ...obj,
      type: movableTypes[obj.id] || obj.type,
    })),
  };

  const grid = buildGridFromState(currentLevelDef, state.movablePositions);
  const beam = computeBeam(grid, levelDef.source, levelDef.gridSize);

  // Check for crystal hit → 0.75s delay then complete
  useEffect(() => {
    if (beam.hitCrystal && !isCompleting && !completingRef.current) {
      const t = Date.now();
      setCrystalHitTime(t);
      completingRef.current = true;
      const timer = setTimeout(() => {
        if (completingRef.current) {
          setIsCompleting(true);
          const stars = getStarRating(moveCount, levelDef);
          completeLevel(
            isDailyChallenge ? levelDef.id : currentLevelId,
            stars,
            moveCount,
            isDailyChallenge
          );
        }
      }, 750);
      return () => clearTimeout(timer);
    } else if (!beam.hitCrystal && completingRef.current && !isCompleting) {
      completingRef.current = false;
      setCrystalHitTime(null);
    }
  }, [beam.hitCrystal]);

  const handleMove = useCallback((fromRow, fromCol, toRow, toCol) => {
    // Find which movable object is at fromRow, fromCol
    let movedId = null;
    for (const [id, pos] of Object.entries(state.movablePositions)) {
      if (pos.row === fromRow && pos.col === fromCol) {
        movedId = id; break;
      }
    }
    if (!movedId) return;

    // Check if destination is occupied
    const destCell = grid[toRow][toCol];
    if (destCell) return;

    setState(s => ({
      ...s,
      movablePositions: {
        ...s.movablePositions,
        [movedId]: { row: toRow, col: toCol },
      },
    }));
    setMoveCount(c => c + 1);
  }, [state.movablePositions, grid]);

  const handleRotate = useCallback((row, col) => {
    let rotatedId = null;
    for (const [id, pos] of Object.entries(state.movablePositions)) {
      if (pos.row === row && pos.col === col) {
        rotatedId = id; break;
      }
    }
    if (!rotatedId) return;

    setMovableTypes(t => ({
      ...t,
      [rotatedId]: buildRotatedType(t[rotatedId] || levelDef.movable.find(m => m.id === rotatedId)?.type),
    }));
    setMoveCount(c => c + 1);
  }, [state.movablePositions, levelDef.movable]);

  const handleRestart = useCallback(() => {
    completingRef.current = false;
    setIsCompleting(false);
    setCrystalHitTime(null);
    setState(initGridState(levelDef));
    setMovableTypes(() => {
      const types = {};
      for (const obj of levelDef.movable) { types[obj.id] = obj.type; }
      return types;
    });
    setMoveCount(0);
    setShowPause(false);
  }, [levelDef]);

  const moveLimit = levelDef.moveLimit;
  const movesLeft = moveLimit ? moveLimit - moveCount : null;
  const overLimit = moveLimit && moveCount > moveLimit;

  const stars = beam.hitCrystal ? getStarRating(moveCount, levelDef) : null;

  return (
    <div style={styles.container}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.levelInfo}>
          <div className="orbitron" style={styles.levelNum}>
            {isDailyChallenge ? '⚡' : `#${currentLevelId}`}
          </div>
          <div style={styles.levelName}>{levelDef.name}</div>
          <div style={styles.packName}>{levelDef.pack}</div>
        </div>

        <div style={styles.moveCounter}>
          {moveLimit !== null ? (
            <div style={{ textAlign: 'center' }}>
              <div className="orbitron" style={{
                ...styles.moveNum,
                color: overLimit ? '#FF2D78' : movesLeft <= 2 ? '#FFD700' : '#00F5FF',
              }}>
                {moveCount}
              </div>
              <div style={styles.moveLabel}>/ {moveLimit} moves</div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div className="orbitron" style={styles.moveNum}>{moveCount}</div>
              <div style={styles.moveLabel}>moves</div>
            </div>
          )}
        </div>

        <div style={styles.controls}>
          <button style={styles.controlBtn} onClick={() => setShowHint(true)} title="Hint">
            <span style={{ fontSize: 18 }}>💡</span>
            <span style={styles.controlLabel}>{save.hints}</span>
          </button>
          <button style={styles.controlBtn} onClick={handleRestart} title="Restart">
            <span style={{ fontSize: 18 }}>↺</span>
          </button>
          <button style={styles.controlBtn} onClick={() => setShowPause(true)} title="Pause">
            <span style={{ fontSize: 18 }}>⏸</span>
          </button>
        </div>
      </div>

      {/* Tutorial tooltip */}
      {levelDef.tutorial && currentLevelId <= 5 && moveCount === 0 && (
        <div style={styles.tutorialBar} className="fade-in">
          {levelDef.tutorial}
        </div>
      )}

      {/* Game grid */}
      <div style={styles.gridArea}>
        <GameGrid
          levelDef={currentLevelDef}
          grid={grid}
          onMove={handleMove}
          onRotate={handleRotate}
          moveCount={moveCount}
          isComplete={beam.hitCrystal}
        />

        {/* Crystal hit flash */}
        {beam.hitCrystal && (
          <div style={styles.crystalFlash} className="fade-in" />
        )}
      </div>

      {/* Star preview while solving */}
      {moveLimit && (
        <div style={styles.starPreview}>
          {[1, 2, 3].map(s => (
            <span key={s} style={{
              fontSize: 18,
              opacity: (stars !== null && s <= stars) ? 1 : 0.2,
              filter: s <= (stars || 0) ? 'drop-shadow(0 0 6px #FFD700)' : 'none',
              transition: 'opacity 0.3s',
            }}>⭐</span>
          ))}
          {moveLimit && (
            <span style={styles.optimalHint}>
              {levelDef.perfectMoves}★ = {levelDef.perfectMoves} moves
            </span>
          )}
        </div>
      )}

      {/* Hint Modal */}
      {showHint && (
        <HintModal
          hint={levelDef.hint}
          hintCount={save.hints}
          onClose={() => setShowHint(false)}
        />
      )}

      {/* Pause Modal */}
      {showPause && (
        <div style={styles.overlay} onClick={() => setShowPause(false)}>
          <div style={styles.pauseModal} onClick={e => e.stopPropagation()} className="scale-in">
            <div className="orbitron" style={styles.pauseTitle}>Paused</div>
            <button style={styles.pauseBtn} onClick={() => setShowPause(false)}>Resume</button>
            <button style={styles.pauseBtn} onClick={handleRestart}>Restart Level</button>
            <button style={{ ...styles.pauseBtn, borderColor: 'rgba(255,255,255,0.1)' }}
              onClick={() => setScreen('level-select')}>
              Level Select
            </button>
            <button style={{ ...styles.pauseBtn, borderColor: 'rgba(255,255,255,0.1)' }}
              onClick={() => setScreen('home')}>
              Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
    background: 'radial-gradient(ellipse at center, #0D1020 0%, #0A0A1A 100%)',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid rgba(0,245,255,0.08)',
    background: 'rgba(0,0,0,0.3)',
    flexShrink: 0,
  },
  levelInfo: {
    display: 'flex', flexDirection: 'column', gap: 1, minWidth: 80,
  },
  levelNum: {
    fontSize: 11, color: '#00F5FF', letterSpacing: '0.15em',
  },
  levelName: {
    fontSize: 14, fontWeight: 700, color: '#E8EAFF',
  },
  packName: {
    fontSize: 10, color: '#7B8DB0',
  },
  moveCounter: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  moveNum: {
    fontSize: 24, fontWeight: 700, color: '#00F5FF', lineHeight: 1,
    transition: 'color 0.3s',
  },
  moveLabel: {
    fontSize: 10, color: '#7B8DB0', textAlign: 'center', marginTop: 2,
  },
  controls: {
    display: 'flex', gap: 8, alignItems: 'center',
  },
  controlBtn: {
    width: 40, height: 40,
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 10,
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', gap: 1,
  },
  controlLabel: {
    fontSize: 9, color: '#FFD700', fontWeight: 700,
  },
  tutorialBar: {
    padding: '10px 16px',
    background: 'rgba(0,245,255,0.08)',
    borderBottom: '1px solid rgba(0,245,255,0.15)',
    fontSize: 12, color: 'rgba(0,245,255,0.9)',
    textAlign: 'center', letterSpacing: '0.02em',
    flexShrink: 0,
  },
  gridArea: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '12px 16px',
    position: 'relative', minHeight: 0,
  },
  crystalFlash: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at center, rgba(0,245,255,0.08) 0%, transparent 70%)',
    pointerEvents: 'none',
    animation: 'pulse-glow 0.75s ease-in-out',
  },
  starPreview: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '8px 16px 12px',
    flexShrink: 0,
  },
  optimalHint: {
    fontSize: 11, color: '#7B8DB0', marginLeft: 8,
  },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100, padding: 24,
  },
  pauseModal: {
    background: '#111827',
    border: '1px solid rgba(0,245,255,0.2)',
    borderRadius: 20, padding: 32,
    maxWidth: 320, width: '100%',
    display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'stretch',
  },
  pauseTitle: {
    fontSize: 20, color: '#E8EAFF', textAlign: 'center',
    marginBottom: 8, letterSpacing: '0.15em',
  },
  pauseBtn: {
    padding: '12px', background: 'transparent',
    border: '1px solid rgba(0,245,255,0.3)',
    borderRadius: 12, color: '#E8EAFF',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
};
