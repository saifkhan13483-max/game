import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../context/GameContext.jsx';
import { getLevelById } from '../data/levels.js';
import { playLevelComplete, playStarReveal } from '../audio/audioEngine.js';

function Confetti({ reduced }) {
  if (reduced) return null;
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: ['#00F5FF', '#BF5FFF', '#FFD700', '#FF2D78', '#39FF14'][i % 5],
    delay: `${Math.random() * 0.8}s`,
    duration: `${1.5 + Math.random() * 1.2}s`,
    size: `${5 + Math.random() * 8}px`,
  }));

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>
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

function StarAnimation({ count, delay = 0, reduced }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    playLevelComplete(count);
    const timers = [];
    for (let i = 1; i <= count; i++) {
      timers.push(setTimeout(() => {
        setShown(i);
        playStarReveal();
      }, delay + i * (reduced ? 100 : 420)));
    }
    return () => timers.forEach(t => clearTimeout(t));
  }, [count, delay, reduced]);

  return (
    <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
      {[1, 2, 3].map(i => (
        <span key={i} style={{
          fontSize: 46,
          opacity: i <= shown ? 1 : 0.1,
          transform: i <= shown ? 'scale(1)' : 'scale(0.4)',
          transition: reduced ? 'none' : 'opacity 0.35s, transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          filter: i <= shown ? 'drop-shadow(0 0 16px #FFD700)' : 'none',
          display: 'inline-block',
        }}>⭐</span>
      ))}
    </div>
  );
}

async function shareResult(stars, levelName) {
  const starStr = '⭐'.repeat(stars);
  const text = `I just solved "${levelName}" with ${stars} star${stars !== 1 ? 's' : ''} in Shadow Shift! ${starStr} 🎮✨`;
  try {
    if (navigator.share) {
      await navigator.share({ title: 'Shadow Shift', text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(text);
      alert('Result copied to clipboard!');
    }
  } catch {}
}

export default function CompletionScreen() {
  const { completionData, setScreen, openLevel, save } = useGame();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Guard: if no completionData, redirect home safely via effect
  useEffect(() => {
    if (!completionData) setScreen('home');
  }, [completionData, setScreen]);

  if (!completionData) return null;

  const { levelId, stars, moveCount, coinsEarned, isDaily, nextLevelId, previousBest = 0 } = completionData;
  const levelDef = isDaily ? null : getLevelById(levelId);
  const isNewBest = stars > previousBest;
  const reduced = save.settings?.reducedMotion;

  const starMessages = { 3: 'Perfect!', 2: 'Great Job!', 1: 'Solved!' };
  const levelName = isDaily ? 'Daily Challenge' : (levelDef?.name || `Level ${levelId}`);

  return (
    <div style={styles.container}>
      {stars === 3 && <Confetti reduced={reduced} />}

      <div style={{ ...styles.content, opacity: ready ? 1 : 0, transform: ready ? 'translateY(0)' : 'translateY(20px)', transition: reduced ? 'none' : 'opacity 0.4s, transform 0.4s' }}>

        {/* Header */}
        <div style={styles.header}>
          <div className="orbitron glow-cyan" style={styles.solvedText}>
            {starMessages[stars]}
          </div>
          <div style={styles.levelName}>{levelName}</div>
          {isNewBest && stars > 1 && (
            <div style={styles.newBest}>✦ New Best!</div>
          )}
        </div>

        {/* Stars */}
        <StarAnimation count={stars} delay={200} reduced={reduced} />

        {/* Stats */}
        <div style={styles.statsGrid}>
          <div style={styles.statCard}>
            <div style={styles.statValue}>{moveCount}</div>
            <div style={styles.statLabel}>Moves Used</div>
          </div>
          {levelDef?.moveLimit && (
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

        {/* Improvement tip */}
        {stars < 3 && levelDef?.moveLimit && (
          <div style={styles.tipBox}>
            💡 {stars === 1
              ? `Try ${levelDef.optimalMoves} moves for ⭐⭐`
              : `Try ${levelDef.perfectMoves} moves for ⭐⭐⭐`}
          </div>
        )}

        {/* Action buttons */}
        <div style={styles.ctas}>
          {nextLevelId && !isDaily && (
            <button style={styles.primaryBtn} onClick={() => openLevel(nextLevelId)}>
              Next Level →
            </button>
          )}
          {isDaily && (
            <button style={styles.primaryBtn} onClick={() => setScreen('home')}>
              Back to Home
            </button>
          )}
          {!isDaily && !nextLevelId && (
            <button style={styles.primaryBtn} onClick={() => setScreen('home')}>
              All Complete! 🎉
            </button>
          )}

          <div style={styles.secondaryBtns}>
            <button style={styles.secondaryBtn} onClick={() => openLevel(levelId, isDaily)}>
              Replay
            </button>
            <button style={styles.secondaryBtn} onClick={() => shareResult(stars, levelName)}
              title="Share your result">
              Share 📤
            </button>
            <button style={styles.secondaryBtn} onClick={() => setScreen('level-select')}>
              Levels
            </button>
          </div>
        </div>

        {/* Coin total */}
        <div style={styles.coinsTotal}>
          <span style={{ color: '#FFD700' }}>💎 {save.coins}</span>
          <span style={{ color: '#7B8DB0', marginLeft: 6 }}>total coins</span>
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
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22,
    position: 'relative', zIndex: 1,
  },
  header: { textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  solvedText: {
    fontSize: 'clamp(30px, 8vw, 46px)',
    fontWeight: 900, letterSpacing: '0.1em',
  },
  levelName: { fontSize: 13, color: '#7B8DB0' },
  newBest: {
    fontSize: 13, fontWeight: 700, color: '#39FF14',
    background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.3)',
    borderRadius: 20, padding: '3px 14px',
  },
  statsGrid: { display: 'flex', gap: 10, width: '100%', justifyContent: 'center' },
  statCard: {
    flex: 1, maxWidth: 110,
    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,245,255,0.12)',
    borderRadius: 12, padding: '12px 8px', textAlign: 'center',
  },
  statValue: {
    fontSize: 22, fontWeight: 700, color: '#00F5FF',
    fontFamily: 'Orbitron, monospace',
  },
  statLabel: {
    fontSize: 9, color: '#7B8DB0', marginTop: 4,
    textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  tipBox: {
    padding: '10px 16px', width: '100%',
    background: 'rgba(255,215,0,0.08)', border: '1px solid rgba(255,215,0,0.2)',
    borderRadius: 10, fontSize: 12, color: '#FFD700', textAlign: 'center',
  },
  ctas: { width: '100%', display: 'flex', flexDirection: 'column', gap: 10 },
  primaryBtn: {
    width: '100%', padding: '15px 24px',
    background: 'linear-gradient(135deg, #004A4A, #006868)',
    border: '1px solid rgba(0,245,255,0.5)',
    borderRadius: 14, color: '#00F5FF',
    fontSize: 17, fontWeight: 700,
    fontFamily: 'Orbitron, monospace', letterSpacing: '0.05em', cursor: 'pointer',
    boxShadow: '0 0 20px rgba(0,245,255,0.2)',
  },
  secondaryBtns: { display: 'flex', gap: 8 },
  secondaryBtn: {
    flex: 1, padding: '11px 6px',
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 12, color: '#E8EAFF',
    fontSize: 13, fontWeight: 600, cursor: 'pointer',
  },
  coinsTotal: { fontSize: 13 },
};
