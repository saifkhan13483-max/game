import React from 'react';
import { useGame } from '../context/GameContext.jsx';
import { LEVELS, PACKS } from '../data/levels.js';

function StarDisplay({ count, size = 14 }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1, 2, 3].map(i => (
        <span key={i} style={{
          fontSize: size,
          opacity: i <= count ? 1 : 0.2,
          filter: i <= count ? 'drop-shadow(0 0 4px #FFD700)' : 'none',
        }}>⭐</span>
      ))}
    </div>
  );
}

export default function LevelSelectScreen() {
  const { setScreen, openLevel, save } = useGame();
  const maxUnlocked = Math.max(1, ...Object.keys(save.stars).map(Number), 1);
  const nextUnlocked = Math.min(maxUnlocked + 1, LEVELS.length);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => setScreen('home')}>← Back</button>
        <h1 className="orbitron" style={styles.title}>Levels</h1>
        <div style={styles.headerRight}>
          <span style={styles.coins}>💎 {save.coins}</span>
        </div>
      </div>

      <div style={styles.scrollArea} className="scrollable">
        {PACKS.map(pack => {
          const packLevels = LEVELS.filter(l => l.id >= pack.levelRange[0] && l.id <= pack.levelRange[1]);
          const packStars = packLevels.reduce((sum, l) => sum + (save.stars[l.id] || 0), 0);
          const packMaxStars = packLevels.length * 3;
          const isUnlocked = packLevels[0].id <= nextUnlocked;

          return (
            <div key={pack.id} style={styles.packSection}>
              <div style={styles.packHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ ...styles.packDot, background: pack.color, boxShadow: `0 0 10px ${pack.color}` }} />
                  <div>
                    <div className="orbitron" style={{ ...styles.packName, color: pack.color }}>{pack.name}</div>
                    <div style={styles.packInfo}>Levels {pack.levelRange[0]}–{pack.levelRange[1]}</div>
                  </div>
                </div>
                <div style={styles.packStars}>
                  <span style={{ color: '#FFD700', fontSize: 13 }}>⭐</span>
                  <span style={{ color: '#E8EAFF', fontWeight: 700, fontSize: 14 }}>{packStars}/{packMaxStars}</span>
                </div>
              </div>

              <div style={styles.levelGrid}>
                {packLevels.map(level => {
                  const stars = save.stars[level.id] || 0;
                  const isLevelUnlocked = level.id <= nextUnlocked;
                  const isCompleted = stars > 0;

                  return (
                    <button
                      key={level.id}
                      style={{
                        ...styles.levelCard,
                        ...(isCompleted ? styles.levelCardCompleted : {}),
                        ...(!isLevelUnlocked ? styles.levelCardLocked : {}),
                        borderColor: isCompleted
                          ? pack.color
                          : isLevelUnlocked ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
                      }}
                      onClick={() => isLevelUnlocked && openLevel(level.id)}
                      disabled={!isLevelUnlocked}
                    >
                      {isLevelUnlocked ? (
                        <>
                          <div style={styles.levelNum}>{level.id}</div>
                          {isCompleted && (
                            <StarDisplay count={stars} size={11} />
                          )}
                          {!isCompleted && (
                            <div style={styles.levelDot}>▶</div>
                          )}
                        </>
                      ) : (
                        <>
                          <div style={styles.levelLock}>🔒</div>
                          <div style={styles.levelNum}>{level.id}</div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
    background: 'radial-gradient(ellipse at top, #0D1B3E 0%, #0A0A1A 60%)',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(0,245,255,0.1)',
  },
  backBtn: {
    background: 'none', border: 'none', color: '#00F5FF',
    fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '4px 8px',
  },
  title: {
    fontSize: 18, color: '#E8EAFF', letterSpacing: '0.1em',
  },
  headerRight: { minWidth: 80, textAlign: 'right' },
  coins: { fontSize: 14, color: '#FFD700', fontWeight: 600 },
  scrollArea: {
    flex: 1, overflowY: 'auto', padding: '16px 20px',
  },
  packSection: {
    marginBottom: 28,
  },
  packHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14,
  },
  packDot: { width: 10, height: 10, borderRadius: '50%' },
  packName: { fontSize: 14, fontWeight: 700, letterSpacing: '0.08em' },
  packInfo: { fontSize: 11, color: '#7B8DB0', marginTop: 1 },
  packStars: {
    display: 'flex', alignItems: 'center', gap: 4,
    background: 'rgba(0,0,0,0.3)',
    padding: '4px 10px', borderRadius: 8,
  },
  levelGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 10,
  },
  levelCard: {
    aspectRatio: '1',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 4,
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid',
    borderRadius: 12,
    cursor: 'pointer', transition: 'transform 0.1s',
  },
  levelCardCompleted: {
    background: 'rgba(0,245,255,0.06)',
  },
  levelCardLocked: {
    opacity: 0.4, cursor: 'not-allowed',
  },
  levelNum: {
    fontSize: 16, fontWeight: 700, color: '#E8EAFF',
    fontFamily: 'Orbitron, monospace',
  },
  levelDot: { fontSize: 10, color: '#00F5FF' },
  levelLock: { fontSize: 14, marginBottom: 2 },
};
