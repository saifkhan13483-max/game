import React from 'react';
import { useGame } from '../context/GameContext.jsx';

const STREAK_MILESTONES = [
  { days: 3, coins: 50, label: '3-Day Bonus' },
  { days: 7, coins: 100, label: 'Week Warrior' },
  { days: 14, coins: 200, label: 'Fortnight' },
  { days: 30, coins: 500, label: 'Monthly Master' },
];

export default function DailyChallengeScreen() {
  const { setScreen, openLevel, isDailyCompleted, todaysChallenge, save, claimStreakReward } = useGame();
  const isCompleted = isDailyCompleted();
  const claimed = save.streakRewardsClaimed || {};

  const nextMilestone = STREAK_MILESTONES.find(m => save.streak < m.days);
  const claimable = STREAK_MILESTONES.find(m => save.streak >= m.days && !claimed[m.days]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => setScreen('home')}>← Back</button>
        <h1 className="orbitron" style={styles.title}>Daily Challenge</h1>
        <div style={{ minWidth: 60 }} />
      </div>

      <div style={styles.content} className="fade-in">
        {/* Challenge Card */}
        <div style={styles.challengeCard}>
          <div style={styles.cardGlow} />
          <div style={styles.dayBadge}>Today's Puzzle</div>
          <div className="orbitron" style={styles.challengeName}>{todaysChallenge.name}</div>

          <div style={styles.rewardRow}>
            <div style={styles.rewardItem}>
              <span style={styles.rewardIcon}>💎</span>
              <span style={styles.rewardValue}>{todaysChallenge.coinReward}</span>
              <span style={styles.rewardLabel}>coins</span>
            </div>
            <div style={styles.rewardItem}>
              <span style={styles.rewardIcon}>⭐</span>
              <span style={styles.rewardValue}>3</span>
              <span style={styles.rewardLabel}>stars max</span>
            </div>
          </div>

          <div style={styles.gridPreview}>
            <div style={{ fontSize: 11, color: '#7B8DB0', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {todaysChallenge.gridSize}×{todaysChallenge.gridSize} Grid
            </div>
            <div style={{ fontSize: 12, color: '#4A5568' }}>
              {todaysChallenge.movable.length} movable · {(todaysChallenge.fixed || []).length} fixed blockers
            </div>
          </div>

          {isCompleted ? (
            <div style={styles.completedBadge}>✓ Completed Today! Come back tomorrow.</div>
          ) : (
            <button style={styles.playBtn} onClick={() => openLevel(todaysChallenge.id, true)}>
              <span>Start Challenge</span>
              <span>⚡</span>
            </button>
          )}
        </div>

        {/* Streak Card */}
        <div style={styles.streakCard}>
          <div style={styles.streakHeader}>
            <div style={styles.streakTitle}>🔥 Daily Streak</div>
            <div className="orbitron" style={styles.streakCount}>{save.streak}</div>
            <div style={styles.streakLabel}>days</div>
          </div>

          {/* Dot indicators */}
          <div style={styles.streakDots}>
            {[...Array(7)].map((_, i) => (
              <div key={i} style={{
                ...styles.streakDot,
                background: i < Math.min(save.streak % 7, 7) ? '#FFD700' : 'rgba(255,255,255,0.1)',
                boxShadow: i < Math.min(save.streak % 7, 7) ? '0 0 8px #FFD700' : 'none',
              }} />
            ))}
          </div>

          {/* Claimable reward */}
          {claimable && (
            <button style={styles.claimBtn} onClick={() => claimStreakReward(claimable.days)}>
              🎁 Claim {claimable.label}! +{claimable.coins} coins
            </button>
          )}

          {/* Milestones */}
          <div style={styles.milestones}>
            {STREAK_MILESTONES.map(m => {
              const reached = save.streak >= m.days;
              const wasClaimed = claimed[m.days];
              return (
                <div key={m.days} style={{ ...styles.milestone, opacity: reached ? 1 : 0.4 }}>
                  <div style={{ ...styles.milestoneDot, background: reached ? '#FFD700' : 'rgba(255,255,255,0.1)' }}>
                    {wasClaimed ? '✓' : m.days}
                  </div>
                  <div style={styles.milestoneText}>
                    <div style={{ fontSize: 11, color: reached ? '#E8EAFF' : '#4A5568' }}>{m.label}</div>
                    <div style={{ fontSize: 10, color: '#FFD700' }}>+{m.coins}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {nextMilestone && (
            <div style={styles.nextMilestone}>
              {nextMilestone.days - save.streak} more day{nextMilestone.days - save.streak !== 1 ? 's' : ''} until <span style={{ color: '#FFD700' }}>+{nextMilestone.coins} coins</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: '100%', height: '100%',
    display: 'flex', flexDirection: 'column',
    background: 'radial-gradient(ellipse at top, #0D1B3E 0%, #0A0A1A 60%)',
    overflowY: 'auto',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid rgba(0,245,255,0.1)',
    flexShrink: 0,
  },
  backBtn: {
    background: 'none', border: 'none', color: '#00F5FF',
    fontSize: 15, fontWeight: 600, cursor: 'pointer', padding: '4px 8px',
  },
  title: { fontSize: 16, color: '#E8EAFF', letterSpacing: '0.08em' },
  content: {
    flex: 1, padding: '20px 16px',
    display: 'flex', flexDirection: 'column', gap: 16,
    alignItems: 'center',
  },
  challengeCard: {
    width: '100%', maxWidth: 380,
    background: 'linear-gradient(135deg, rgba(13,27,62,0.8), rgba(10,10,26,0.9))',
    border: '1px solid rgba(0,245,255,0.25)',
    borderRadius: 20, padding: '24px 20px',
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 0 30px rgba(0,245,255,0.1)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
  },
  cardGlow: {
    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
    width: '80%', height: 1,
    background: 'linear-gradient(90deg, transparent, #00F5FF, transparent)', opacity: 0.6,
  },
  dayBadge: {
    fontSize: 11, fontWeight: 600, color: '#FFD700',
    background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.3)',
    borderRadius: 20, padding: '4px 14px', letterSpacing: '0.08em', textTransform: 'uppercase',
  },
  challengeName: { fontSize: 22, color: '#00F5FF', letterSpacing: '0.1em', textShadow: '0 0 10px rgba(0,245,255,0.5)' },
  rewardRow: { display: 'flex', gap: 24 },
  rewardItem: { display: 'flex', alignItems: 'center', gap: 6 },
  rewardIcon: { fontSize: 18 },
  rewardValue: { fontSize: 20, fontWeight: 700, color: '#E8EAFF', fontFamily: 'Orbitron, monospace' },
  rewardLabel: { fontSize: 11, color: '#7B8DB0' },
  gridPreview: {
    width: '100%', background: 'rgba(0,0,0,0.3)', borderRadius: 10,
    padding: '10px 16px', textAlign: 'center',
  },
  completedBadge: {
    width: '100%', padding: '13px',
    background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.3)',
    borderRadius: 12, color: '#39FF14', fontSize: 14, fontWeight: 700, textAlign: 'center',
  },
  playBtn: {
    width: '100%', padding: '13px 24px',
    background: 'linear-gradient(135deg, #004A4A, #006868)',
    border: '1px solid rgba(0,245,255,0.5)', borderRadius: 14, color: '#00F5FF',
    fontSize: 16, fontWeight: 700, fontFamily: 'Orbitron, monospace', letterSpacing: '0.05em',
    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    boxShadow: '0 0 20px rgba(0,245,255,0.2)',
  },
  streakCard: {
    width: '100%', maxWidth: 380,
    background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,215,0,0.15)',
    borderRadius: 16, padding: '20px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
  },
  streakHeader: { textAlign: 'center' },
  streakTitle: { fontSize: 14, color: '#E8EAFF', fontWeight: 600, marginBottom: 4 },
  streakCount: { fontSize: 44, color: '#FFD700', fontWeight: 900, lineHeight: 1 },
  streakLabel: { fontSize: 12, color: '#7B8DB0' },
  streakDots: { display: 'flex', gap: 8, marginTop: 4 },
  streakDot: { width: 10, height: 10, borderRadius: '50%', transition: 'background 0.3s, box-shadow 0.3s' },
  claimBtn: {
    width: '100%', padding: '12px',
    background: 'linear-gradient(135deg, rgba(255,215,0,0.2), rgba(255,165,0,0.2))',
    border: '1px solid rgba(255,215,0,0.5)', borderRadius: 12,
    color: '#FFD700', fontSize: 14, fontWeight: 700, cursor: 'pointer',
    animation: 'pulse-glow 2s ease-in-out infinite',
  },
  milestones: {
    width: '100%', display: 'flex', justifyContent: 'space-between', padding: '4px 0',
  },
  milestone: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  milestoneDot: {
    width: 32, height: 32, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 11, fontWeight: 700, color: '#0A0A1A',
  },
  milestoneText: { textAlign: 'center' },
  nextMilestone: {
    fontSize: 12, color: '#7B8DB0', textAlign: 'center',
    borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 12, width: '100%',
  },
};
