import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../context/GameContext.jsx';
import { getLevelById } from '../data/levels.js';
import { getTodaysChallenge } from '../data/dailyChallenges.js';
import { computeBeam, getStarRating } from '../engine/laserEngine.js';
import GameGrid from '../components/GameGrid.jsx';
import HintModal from '../components/HintModal.jsx';
import InterstitialAd from '../components/InterstitialAd.jsx';
import {
  playMirrorRotate, playMirrorPlace, playCrystalHit,
  startLaserHum, stopLaserHum,
} from '../audio/audioEngine.js';

function initGridState(levelDef) {
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
    if (!grid[pos.row][pos.col]) {
      grid[pos.row][pos.col] = { type: obj.type, id: obj.id };
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
  const {
    currentLevelId, isDailyChallenge, setScreen, completeLevel,
    save, useHint, interstitialPending, setInterstitialPending,
  } = useGame();

  const levelDef = isDailyChallenge ? getTodaysChallenge() : getLevelById(currentLevelId);

  const [state, setState] = useState(() => initGridState(levelDef));
  const [movableTypes, setMovableTypes] = useState(() => {
    const types = {};
    for (const obj of levelDef.movable) types[obj.id] = obj.type;
    return types;
  });
  const [moveCount, setMoveCount] = useState(0);
  const [hintUsedThisLevel, setHintUsedThisLevel] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showPause, setShowPause] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showTutorial, setShowTutorial] = useState(levelDef.tutorial && !isDailyChallenge && currentLevelId <= 7);
  const completingRef = useRef(false);
  const beamHumRef = useRef(false);

  const currentLevelDef = {
    ...levelDef,
    movable: levelDef.movable.map(obj => ({
      ...obj,
      type: movableTypes[obj.id] || obj.type,
    })),
  };

  const grid = buildGridFromState(currentLevelDef, state.movablePositions);
  const beam = computeBeam(grid, levelDef.source, levelDef.gridSize);

  // Laser hum when crystal is hit
  useEffect(() => {
    if (beam.hitCrystal && !beamHumRef.current) {
      startLaserHum();
      playCrystalHit();
      beamHumRef.current = true;
    } else if (!beam.hitCrystal && beamHumRef.current) {
      stopLaserHum();
      beamHumRef.current = false;
    }
  }, [beam.hitCrystal]);

  useEffect(() => () => stopLaserHum(), []);

  // 0.75s crystal hold → complete
  useEffect(() => {
    if (beam.hitCrystal && !isCompleting && !completingRef.current) {
      completingRef.current = true;
      const timer = setTimeout(() => {
        if (completingRef.current) {
          setIsCompleting(true);
          const stars = getStarRating(moveCount, levelDef);
          completeLevel(
            isDailyChallenge ? levelDef.id : currentLevelId,
            stars, moveCount, isDailyChallenge, hintUsedThisLevel,
          );
        }
      }, 750);
      return () => clearTimeout(timer);
    } else if (!beam.hitCrystal && completingRef.current && !isCompleting) {
      completingRef.current = false;
    }
  }, [beam.hitCrystal]);

  const handleMove = useCallback((fromRow, fromCol, toRow, toCol) => {
    let movedId = null;
    for (const [id, pos] of Object.entries(state.movablePositions)) {
      if (pos.row === fromRow && pos.col === fromCol) { movedId = id; break; }
    }
    if (!movedId) return;
    if (grid[toRow][toCol]) return;

    playMirrorPlace();
    setState(s => ({
      ...s,
      movablePositions: { ...s.movablePositions, [movedId]: { row: toRow, col: toCol } },
    }));
    setMoveCount(c => c + 1);
    if (showTutorial) setShowTutorial(false);
  }, [state.movablePositions, grid, showTutorial]);

  const handleRotate = useCallback((row, col) => {
    let rotatedId = null;
    for (const [id, pos] of Object.entries(state.movablePositions)) {
      if (pos.row === row && pos.col === col) { rotatedId = id; break; }
    }
    if (!rotatedId) return;

    playMirrorRotate();
    setMovableTypes(t => ({
      ...t,
      [rotatedId]: buildRotatedType(t[rotatedId] || levelDef.movable.find(m => m.id === rotatedId)?.type),
    }));
    setMoveCount(c => c + 1);
    if (showTutorial) setShowTutorial(false);
  }, [state.movablePositions, levelDef.movable, showTutorial]);

  const handleRestart = useCallback(() => {
    completingRef.current = false;
    setIsCompleting(false);
    stopLaserHum();
    beamHumRef.current = false;
    setState(initGridState(levelDef));
    setMovableTypes(() => {
      const types = {};
      for (const obj of levelDef.movable) types[obj.id] = obj.type;
      return types;
    });
    setMoveCount(0);
    setHintUsedThisLevel(false);
    setShowPause(false);
    setShowTutorial(levelDef.tutorial && !isDailyChallenge && currentLevelId <= 7);
  }, [levelDef, currentLevelId, isDailyChallenge]);

  const moveLimit = levelDef.moveLimit;
  const movesLeft = moveLimit ? Math.max(0, moveLimit - moveCount) : null;
  const overLimit = moveLimit && moveCount > moveLimit;
  const stars = beam.hitCrystal ? getStarRating(moveCount, levelDef) : null;

  // Show interstitial ad before going to completion
  if (interstitialPending) {
    return (
      <InterstitialAd onClose={() => {
        setInterstitialPending(false);
        setScreen('completion');
      }} />
    );
  }

  return (
    <div style={styles.container}>

      {/* ── TOP BAR ── */}
      <div style={styles.topBar}>

        {/* Left: level info */}
        <div style={styles.levelInfo}>
          <div style={styles.levelLabel}>
            {isDailyChallenge ? '⚡ DAILY' : `LEVEL ${currentLevelId}`}
          </div>
          <div style={styles.levelName}>{levelDef.name}</div>
        </div>

        {/* Center: move counter */}
        <div style={styles.moveBox}>
          <div style={{
            ...styles.moveNum,
            color: overLimit ? '#FF2D78' : movesLeft !== null && movesLeft <= 2 ? '#FFD700' : '#00F5FF',
          }}>
            {moveLimit !== null ? movesLeft : moveCount}
          </div>
          <div style={styles.moveLabel}>
            {moveLimit !== null ? 'moves left' : 'moves'}
          </div>
        </div>

        {/* Right: control buttons */}
        <div style={styles.controls}>
          <button style={styles.ctrlBtn} onClick={() => setShowHint(true)}>
            <span style={styles.ctrlIcon}>💡</span>
            <span style={styles.ctrlLabel}>Hint ({save.hints})</span>
          </button>
          <button style={styles.ctrlBtn} onClick={handleRestart}>
            <span style={styles.ctrlIcon}>↺</span>
            <span style={styles.ctrlLabel}>Restart</span>
          </button>
          <button style={styles.ctrlBtn} onClick={() => setShowPause(true)}>
            <span style={styles.ctrlIcon}>⏸</span>
            <span style={styles.ctrlLabel}>Pause</span>
          </button>
        </div>
      </div>

      {/* Tutorial banner */}
      {showTutorial && (
        <div style={styles.tutorialBar}>
          <span>👆</span>
          <span style={{ flex: 1 }}>{levelDef.tutorial}</span>
          <button style={styles.tutorialClose} onClick={() => setShowTutorial(false)}>✕</button>
        </div>
      )}

      {/* Over-limit warning */}
      {overLimit && (
        <div style={styles.warningBar}>
          ⚠️ Move limit exceeded — you can still finish, but max 1 ★
        </div>
      )}

      {/* Star preview row (only when there's a move limit) */}
      {moveLimit && (
        <div style={styles.starRow}>
          {[1, 2, 3].map(s => (
            <span key={s} style={{
              fontSize: 16,
              opacity: s <= (stars ?? 0) ? 1 : overLimit && s > 1 ? 0.08 : 0.2,
              filter: s <= (stars ?? 0) ? 'drop-shadow(0 0 5px #FFD700)' : 'none',
              transition: 'opacity 0.2s',
            }}>⭐</span>
          ))}
          <span style={styles.starHint}>⭐⭐⭐ in ≤ {levelDef.perfectMoves} moves</span>
        </div>
      )}

      {/* Game grid */}
      <div style={styles.gridArea}>
        <GameGrid
          key={`${currentLevelId}-${isDailyChallenge}`}
          levelDef={currentLevelDef}
          grid={grid}
          beam={beam}
          onMove={handleMove}
          onRotate={handleRotate}
          moveCount={moveCount}
          isComplete={beam.hitCrystal}
        />
        {beam.hitCrystal && <div style={styles.crystalFlash} />}
      </div>

      {/* ── HINT MODAL ── */}
      {showHint && (
        <HintModal
          hint={levelDef.hint}
          hintCount={save.hints}
          onClose={() => setShowHint(false)}
          onHintUsed={() => setHintUsedThisLevel(true)}
        />
      )}

      {/* ── PAUSE MODAL ── */}
      {showPause && (
        <div style={styles.overlay} onClick={() => setShowPause(false)}>
          <div style={styles.pauseModal} onClick={e => e.stopPropagation()}>
            <div style={styles.pauseTitle}>⏸ Paused</div>
            <div style={styles.pauseSub}>
              {isDailyChallenge ? 'Daily Challenge' : `Level ${currentLevelId} · ${levelDef.pack}`}
              {' · '}{moveCount} move{moveCount !== 1 ? 's' : ''} used
            </div>
            <button style={{ ...styles.pauseBtn, ...styles.pauseBtnPrimary }} onClick={() => setShowPause(false)}>
              ▶ Resume
            </button>
            <button style={styles.pauseBtn} onClick={handleRestart}>↺ Restart Level</button>
            <button style={styles.pauseBtn} onClick={() => setScreen('level-select')}>📋 Level Select</button>
            <button style={styles.pauseBtn} onClick={() => setScreen('home')}>🏠 Home</button>
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

  // ── Top bar ──
  topBar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 12px 8px',
    background: 'rgba(0,0,0,0.5)',
    borderBottom: '1px solid rgba(0,245,255,0.1)',
    flexShrink: 0, gap: 8,
  },
  levelInfo: { display: 'flex', flexDirection: 'column', gap: 1, minWidth: 70 },
  levelLabel: {
    fontSize: 9, fontWeight: 700, color: '#00F5FF',
    letterSpacing: '0.12em', textTransform: 'uppercase',
  },
  levelName: { fontSize: 13, fontWeight: 700, color: '#E8EAFF', lineHeight: 1.2 },

  moveBox: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  moveNum: {
    fontSize: 28, fontWeight: 900, lineHeight: 1,
    fontFamily: 'Orbitron, monospace',
    transition: 'color 0.3s',
  },
  moveLabel: { fontSize: 9, color: '#7B8DB0', marginTop: 1, letterSpacing: '0.05em' },

  // Control buttons — clearly labeled, large enough to tap
  controls: { display: 'flex', gap: 6 },
  ctrlBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 2, padding: '6px 8px',
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 10, cursor: 'pointer',
    minWidth: 48, minHeight: 48,
    transition: 'background 0.15s, border-color 0.15s',
  },
  ctrlIcon: { fontSize: 20, lineHeight: 1 },
  ctrlLabel: { fontSize: 8, color: '#7B8DB0', letterSpacing: '0.04em', textAlign: 'center' },

  // Banners
  tutorialBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '9px 12px',
    background: 'rgba(0,245,255,0.07)',
    borderBottom: '1px solid rgba(0,245,255,0.15)',
    fontSize: 12, color: 'rgba(0,245,255,0.9)',
    flexShrink: 0,
  },
  tutorialClose: {
    background: 'none', border: 'none', color: 'rgba(0,245,255,0.4)',
    fontSize: 14, cursor: 'pointer', padding: '0 4px',
  },
  warningBar: {
    padding: '7px 12px',
    background: 'rgba(255,45,120,0.1)',
    borderBottom: '1px solid rgba(255,45,120,0.2)',
    fontSize: 11, color: '#FF2D78', textAlign: 'center', flexShrink: 0,
  },

  // Star preview
  starRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    padding: '6px 12px', flexShrink: 0,
  },
  starHint: { fontSize: 10, color: '#4A5568', marginLeft: 6 },

  // Grid
  gridArea: {
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '8px 12px', position: 'relative', minHeight: 0,
  },
  crystalFlash: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at center, rgba(0,245,255,0.1) 0%, transparent 65%)',
    pointerEvents: 'none',
    animation: 'pulse-glow 0.75s ease-in-out',
  },

  // Pause modal
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.88)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100, padding: 24,
  },
  pauseModal: {
    background: '#111827', border: '1px solid rgba(0,245,255,0.2)',
    borderRadius: 20, padding: '28px 24px',
    maxWidth: 300, width: '100%',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  pauseTitle: {
    fontSize: 20, fontWeight: 700, color: '#E8EAFF',
    fontFamily: 'Orbitron, monospace', letterSpacing: '0.1em',
    textAlign: 'center',
  },
  pauseSub: {
    fontSize: 11, color: '#7B8DB0', textAlign: 'center', marginBottom: 4,
  },
  pauseBtn: {
    padding: '13px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, color: '#E8EAFF',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    textAlign: 'center',
  },
  pauseBtnPrimary: {
    background: 'rgba(0,245,255,0.1)',
    border: '1px solid rgba(0,245,255,0.4)',
    color: '#00F5FF',
  },
};
