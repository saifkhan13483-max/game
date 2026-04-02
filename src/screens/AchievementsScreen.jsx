import React from 'react';
import { useGame } from '../context/GameContext.jsx';
import { ACHIEVEMENTS } from '../data/achievements.js';

export default function AchievementsScreen() {
  const { setScreen, save } = useGame();
  const unlockedSet = new Set(save.achievements || []);
  const unlocked = ACHIEVEMENTS.filter(a => unlockedSet.has(a.id));
  const locked = ACHIEVEMENTS.filter(a => !unlockedSet.has(a.id));

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => setScreen('home')}>← Back</button>
        <h1 className="orbitron" style={styles.title}>Achievements</h1>
        <div style={styles.badge}>{unlocked.length}/{ACHIEVEMENTS.length}</div>
      </div>

      <div style={styles.progress}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${(unlocked.length / ACHIEVEMENTS.length) * 100}%` }} />
        </div>
        <div style={styles.progressLabel}>{Math.round((unlocked.length / ACHIEVEMENTS.length) * 100)}% complete</div>
      </div>

      <div style={styles.list} className="scrollable">
        {unlocked.length > 0 && (
          <div style={styles.section}>
            <div style={styles.sectionTitle}>✅ Unlocked ({unlocked.length})</div>
            {unlocked.map(a => (
              <div key={a.id} style={{ ...styles.achCard, ...styles.achUnlocked }}>
                <div style={styles.achIcon}>{a.icon}</div>
                <div style={styles.achInfo}>
                  <div style={styles.achName}>{a.name}</div>
                  <div style={styles.achDesc}>{a.desc}</div>
                </div>
                <div style={styles.checkmark}>✓</div>
              </div>
            ))}
          </div>
        )}

        <div style={styles.section}>
          <div style={styles.sectionTitle}>🔒 Locked ({locked.length})</div>
          {locked.map(a => (
            <div key={a.id} style={{ ...styles.achCard, ...styles.achLocked }}>
              <div style={{ ...styles.achIcon, filter: 'grayscale(1)', opacity: 0.4 }}>{a.icon}</div>
              <div style={styles.achInfo}>
                <div style={{ ...styles.achName, color: '#4A5568' }}>{a.name}</div>
                <div style={styles.achDesc}>{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
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
  title: { fontSize: 16, color: '#E8EAFF', letterSpacing: '0.08em' },
  badge: {
    background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.3)',
    borderRadius: 20, padding: '4px 12px',
    fontSize: 13, fontWeight: 700, color: '#FFD700',
  },
  progress: {
    padding: '12px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  progressBar: {
    height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden',
  },
  progressFill: {
    height: '100%', background: 'linear-gradient(90deg, #00F5FF, #BF5FFF)',
    borderRadius: 3, transition: 'width 0.5s ease',
    boxShadow: '0 0 8px rgba(0,245,255,0.5)',
  },
  progressLabel: { fontSize: 11, color: '#7B8DB0', marginTop: 6 },
  list: { flex: 1, overflowY: 'auto', padding: '12px 16px' },
  section: { marginBottom: 20 },
  sectionTitle: {
    fontSize: 11, color: '#7B8DB0', textTransform: 'uppercase', letterSpacing: '0.1em',
    marginBottom: 10, paddingBottom: 6,
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  achCard: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 16px', borderRadius: 12,
    marginBottom: 8, border: '1px solid',
    transition: 'transform 0.1s',
  },
  achUnlocked: {
    background: 'rgba(0,245,255,0.05)',
    borderColor: 'rgba(0,245,255,0.2)',
  },
  achLocked: {
    background: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.06)',
  },
  achIcon: { fontSize: 28, flexShrink: 0, width: 36, textAlign: 'center' },
  achInfo: { flex: 1 },
  achName: { fontSize: 14, fontWeight: 700, color: '#E8EAFF' },
  achDesc: { fontSize: 12, color: '#7B8DB0', marginTop: 2 },
  checkmark: { fontSize: 16, color: '#39FF14', fontWeight: 700 },
};
