import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext.jsx';
import { getLevelById } from '../data/levels.js';

function Confetti() {
  const pieces = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: ['#00F5FF', '#BF5FFF', '#FFD700', '#FF2D78', '#39FF14'][i % 5],
    delay: `${Math.random() * 0.8}s`,
    duration: `${1.5 + Math.random() * 1}s`,
    size: `${6 + Math.random() * 8}px`,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: p.left, top: '-20px',
          width: p.size, height: p.size,
          background: p.color,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
          animation: `confetti-fall ${p.duration} ${p.delay} forwards`,
          boxShadow: `0 0 6px ${p.color}`,
        }} />
      ))}
    </div>
  );
}

function StarAnimation({ count, delay = 0 }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const timers = [];
    for (let i = 1; i <= count; i++) {
      timers.push(setTimeout(() => setShown(i), delay + i * 400));
    }
    return () => timers.forEach(t => clearTimeout(t));
  }, [count, delay]);

  return (
    <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
      {[1, 2, 3].map(i => (
        <span key={i} style={{
          fontSize: 44,
          opacity: i <= shown ? 1 : 0.15,
          transform: i <= shown ? 'scale(1)' : 'scale(0.5)',
          transition: 'opacity 0.3s, transform 0.3s',
          filter: i <= shown ? 'drop-shadow(0 0 12px #FFD700)' : 'none',
          animation: i <= shown ? 'starBurst 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'none',
        }}>⭐</span>
      ))}
    </div>
  );
}

export default function CompletionScreen() {
  const { completionData, setScreen, openLevel, save } = useGame();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  if (!completionData) {
    setScreen('home');
    return null;
  }

  const { levelId, stars, moveCount, coinsEarned, isDaily, nextLevelId } = completionData;
  const levelDef = isDaily ? null : getLevelById(levelId);
  const previousBest = save.stars[levelId] || 0;
  const isNewBest = stars > previousBest;

  const starMessages = {
    3: 'Perfect!',
    2: 'Great job!',
    1: 'Solved!',
  };

  return (
    <div style={styles.container}>
      {stars === 3 && <Confetti />}

      <div style={styles.content} className="slide-up">
        {/* Header */}
        <div style={styles.header}>
          <div className="orbitron glow-cyan" style={styles.solvedText}>
            {starMessages[stars]}
          </div>
          {levelDef && (
            <div style={styles.levelName}>{levelDef.name}</div>
          )}
          {isDaily && (
            <div style={styles.levelName}>Daily Challenge</div>
          )}
        </div>

        {/* Stars */}
        <div style={styles.starsSection}>
          <StarAnimation count={stars} delay={300} />
          {isNewBest && stars > 1 && (
            <div style={styles.newBest} className="bounce-in">New Best!</div>
          )}
        </div>

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{moveCount}</div>
            <div style={styles.statLabel}>Moves Used</div>
          </div>
          {levelDef && levelDef.moveLimit && (
            <div style={styles.statCard}>
              <div style={{ ...styles.statValue, color: moveCount <= levelDef.perfectMoves ? '#39FF14' : '#FFD700' }}>
                {levelDef.perfectMoves}
              </div>
              <div style={styles.statLabel}>Perfect Moves</div>
            </div>
          )}
          <div style={styles.statCard}>
            <div style={{ ...styles.statValue, color: '#FFD700' }}>+{coinsEarned}</div>
            <div style={styles.statLabel}>Coins Earned</div>
          </div>
        </div>

        {/* Stars message */}
        {stars < 3 && levelDef?.moveLimit && (
          <div style={styles.tipBox}>
            💡 {stars === 1
              ? `Complete in ${levelDef.optimalMoves} moves for ⭐⭐`
              : `Complete in ${levelDef.perfectMoves} moves for ⭐⭐⭐`}
          </div>
        )}

        {/* CTAs */}
        <div style={styles.ctas}>
          {nextLevelId && !isDaily && (
            <button style={styles.primaryBtn} onClick={() => openLevel(nextLevelId)}>
              <span>Next Level</span>
              <span style={{ opacity: 0.7 }}>→</span>
            </button>
          )}
          {isDaily && (
            <button style={styles.primaryBtn} onClick={() => setScreen('home')}>
              Back to Home
            </button>
          )}
          {!isDaily && !nextLevelId && (
            <button style={styles.primaryBtn} onClick={() => setScreen('home')}>
              All Done! 🎉
            </button>
          )}
          <div style={styles.secondaryBtns}>
            <button style={styles.secondaryBtn} onClick={() => openLevel(levelId, isDaily)}>
              Replay
            </button>
            <button style={styles.secondaryBtn} onClick={() => setScreen('level-select')}>
              Level Select
            </button>
          </div>
        </div>

        {/* Coins display */}
        <div style={styles.coinsTotal}>
          <span style={{ color: '#FFD700' }}>💎 {save.coins}</span>
          <span style={{ color: '#7B8DB0', marginLeft: 8 }}>total coins</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%', height: '100%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'radial-gradient(ellipse at center, #0D1B3E 0%, #0A0A1A 70%)',
    position: 'relative', overflow: 'hidden',
  },
  content: {
    width: '100%', maxWidth: 400, padding: '0 24px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24,
    position: 'relative', zIndex: 1,
  },
  header: {
    textAlign: 'center',
  },
  solvedText: {
    fontSize: 'clamp(32px, 8vw, 48px)',
    fontWeight: 900, letterSpacing: '0.1em',
  },
  levelName: {
    fontSize: 14, color: '#7B8DB0', marginTop: 4,
  },
  starsSection: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
  },
  newBest: {
    fontSize: 13, fontWeight: 700,
    color: '#39FF14',
    background: 'rgba(57,255,20,0.1)',
    border: '1px solid rgba(57,255,20,0.3)',
    borderRadius: 20, padding: '4px 16px',
    letterSpacing: '0.08em',
  },
  statsGrid: {
    display: 'flex', gap: 12, width: '100%', justifyContent: 'center',
  },
  statCard: {
    flex: 1, maxWidth: 100,
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(0,245,255,0.15)',
    borderRadius: 12, padding: '12px 8px',
    textAlign: 'center',
  },
  statValue: {
    fontSize: 22, fontWeight: 700, color: '#00F5FF',
    fontFamily: 'Orbitron, monospace',
  },
  statLabel: {
    fontSize: 10, color: '#7B8DB0', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  tipBox: {
    padding: '10px 16px',
    background: 'rgba(255,215,0,0.08)',
    border: '1px solid rgba(255,215,0,0.2)',
    borderRadius: 10, fontSize: 12, color: '#FFD700',
    width: '100%', textAlign: 'center',
  },
  ctas: {
    width: '100%', display: 'flex', flexDirection: 'column', gap: 12,
  },
  primaryBtn: {
    width: '100%', padding: '16px 24px',
    background: 'linear-gradient(135deg, #004A4A, #006868)',
    border: '1px solid rgba(0,245,255,0.5)',
    borderRadius: 14, color: '#00F5FF',
    fontSize: 18, fontWeight: 700,
    fontFamily: 'Orbitron, monospace', letterSpacing: '0.05em',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    boxShadow: '0 0 20px rgba(0,245,255,0.2)',
  },
  secondaryBtns: {
    display: 'flex', gap: 12,
  },
  secondaryBtn: {
    flex: 1, padding: '12px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: 12, color: '#E8EAFF',
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
  },
  coinsTotal: {
    fontSize: 14,
  },
};
