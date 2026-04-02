import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext.jsx';
import { getTimeUntilReset } from '../data/dailyChallenges.js';
import SettingsModal from '../components/SettingsModal.jsx';

function formatCountdown(ms) {
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function HomeScreen() {
  const { setScreen, openLevel, getNextUnlockedLevel, save, isDailyCompleted, todaysChallenge, purchasePremium, totalStars } = useGame();
  const [countdown, setCountdown] = useState(formatCountdown(getTimeUntilReset()));
  const [showSettings, setShowSettings] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(formatCountdown(getTimeUntilReset()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const dailyDone = isDailyCompleted();
  const nextLevel = getNextUnlockedLevel();

  return (
    <div style={styles.container}>
      {/* Background particles */}
      <div style={styles.bg}>
        {[...Array(20)].map((_, i) => (
          <div key={i} style={{
            ...styles.particle,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 3}s`,
            width: `${2 + Math.random() * 3}px`,
            height: `${2 + Math.random() * 3}px`,
            opacity: 0.3 + Math.random() * 0.4,
          }} />
        ))}
      </div>

      {/* Grid decoration lines */}
      <svg style={styles.gridDecor} viewBox="0 0 400 400" preserveAspectRatio="xMidYMid slice">
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Decorative beam lines */}
        <line x1="50" y1="200" x2="200" y2="200" stroke="#00F5FF" strokeWidth="1.5" opacity="0.3" filter="url(#glow)"/>
        <line x1="200" y1="200" x2="200" y2="50" stroke="#00F5FF" strokeWidth="1.5" opacity="0.3" filter="url(#glow)"/>
        <circle cx="200" cy="200" r="8" fill="none" stroke="#BF5FFF" strokeWidth="1.5" opacity="0.5"/>
        <circle cx="50" cy="200" r="5" fill="#00F5FF" opacity="0.6"/>
        <polygon points="200,42 194,58 206,58" fill="#BF5FFF" opacity="0.5"/>
        <circle cx="350" cy="100" r="10" fill="none" stroke="#00F5FF" strokeWidth="1" opacity="0.2"/>
        <line x1="10" y1="350" x2="100" y2="350" stroke="#BF5FFF" strokeWidth="1" opacity="0.15"/>
        <line x1="300" y1="300" x2="380" y2="380" stroke="#00F5FF" strokeWidth="1" opacity="0.1"/>
      </svg>

      <div style={styles.content}>
        {/* Header */}
        <div style={styles.header} className="fade-in">
          <div style={styles.logo}>
            <span className="orbitron glow-cyan" style={styles.logoText}>SHADOW</span>
            <span className="orbitron" style={styles.logoSub}>SHIFT</span>
          </div>
          <p style={styles.tagline}>Guide the beam. Solve the puzzle.</p>
        </div>

        {/* Stats bar */}
        <div style={styles.statsBar} className="fade-in">
          <div style={styles.statItem}>
            <span style={styles.statValue}>{totalStars}</span>
            <span style={styles.statLabel}>⭐ Stars</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statValue}>{save.coins}</span>
            <span style={styles.statLabel}>💎 Coins</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statValue}>{save.streak}</span>
            <span style={styles.statLabel}>🔥 Streak</span>
          </div>
        </div>

        {/* Main buttons */}
        <div style={styles.buttons}>
          <button style={styles.playBtn} className="slide-up" onClick={() => openLevel(nextLevel)}>
            <div style={styles.playBtnInner}>
              <span style={styles.playIcon}>▶</span>
              <div>
                <div style={styles.playBtnText}>Play</div>
                <div style={styles.playBtnSub}>Level {nextLevel} · {nextLevel <= 10 ? 'Tutorial' : nextLevel <= 20 ? 'Refraction' : nextLevel <= 25 ? 'Prism' : 'Singularity'}</div>
              </div>
            </div>
            <div style={styles.playBtnGlow} />
          </button>

          <button
            style={{ ...styles.secondaryBtn, borderColor: dailyDone ? '#39FF14' : '#FFD700', opacity: 1 }}
            className="slide-up"
            onClick={() => setScreen('daily')}
          >
            <div style={styles.secondaryBtnContent}>
              <span style={{ fontSize: 20 }}>{dailyDone ? '✓' : '⚡'}</span>
              <div>
                <div style={styles.secondaryBtnText}>Daily Challenge</div>
                <div style={styles.secondaryBtnSub}>
                  {dailyDone ? 'Completed!' : `Resets in ${countdown}`}
                </div>
              </div>
            </div>
          </button>

          <button style={styles.secondaryBtn} className="slide-up" onClick={() => setScreen('level-select')}>
            <div style={styles.secondaryBtnContent}>
              <span style={{ fontSize: 20 }}>🗂</span>
              <div>
                <div style={styles.secondaryBtnText}>Level Select</div>
                <div style={styles.secondaryBtnSub}>{Object.keys(save.stars).length} / 30 completed</div>
              </div>
            </div>
          </button>
        </div>

        {/* Bottom buttons */}
        <div style={styles.bottomRow}>
          {!save.isPremium && (
            <button style={styles.premiumBtn} onClick={() => setShowPremium(true)}>
              ✦ Go Premium
            </button>
          )}
          {save.isPremium && (
            <div style={styles.premiumBadge}>✦ Premium</div>
          )}
          <button style={styles.settingsBtn} onClick={() => setShowSettings(true)}>
            ⚙
          </button>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      {showPremium && (
        <div style={styles.overlay} onClick={() => setShowPremium(false)}>
          <div style={styles.premiumModal} onClick={e => e.stopPropagation()} className="scale-in">
            <div style={styles.premiumTitle} className="orbitron">Go Premium</div>
            <div style={styles.premiumPrice}>$3.99</div>
            <ul style={styles.premiumList}>
              <li>🚫 Remove all ads forever</li>
              <li>💎 +10 bonus hints</li>
              <li>✨ Exclusive Holographic skin</li>
              <li>❤️ Support indie game development</li>
            </ul>
            <button style={styles.buyBtn} onClick={() => { purchasePremium(); setShowPremium(false); }}>
              Unlock Now
            </button>
            <button style={styles.cancelBtn} onClick={() => setShowPremium(false)}>
              Maybe Later
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
    alignItems: 'center', justifyContent: 'center',
    position: 'relative', overflow: 'hidden',
    background: 'radial-gradient(ellipse at center top, #0D1B3E 0%, #0A0A1A 60%)',
  },
  bg: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    borderRadius: '50%',
    background: '#00F5FF',
    animation: 'pulse-glow 3s ease-in-out infinite',
  },
  gridDecor: {
    position: 'absolute', inset: 0, width: '100%', height: '100%',
    pointerEvents: 'none', opacity: 0.8,
  },
  content: {
    position: 'relative', zIndex: 1,
    width: '100%', maxWidth: 420,
    padding: '0 24px',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 20,
  },
  header: {
    textAlign: 'center', marginBottom: 4,
  },
  logo: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0,
    lineHeight: 1,
  },
  logoText: {
    fontSize: 'clamp(36px, 10vw, 52px)',
    fontWeight: 900, letterSpacing: '0.15em',
    animation: 'pulse-glow 3s ease-in-out infinite',
  },
  logoSub: {
    fontSize: 'clamp(24px, 7vw, 36px)',
    fontWeight: 600, letterSpacing: '0.3em',
    color: '#BF5FFF',
    textShadow: '0 0 10px #BF5FFF',
    marginTop: -4,
  },
  tagline: {
    color: '#7B8DB0', fontSize: 13, letterSpacing: '0.1em',
    marginTop: 8, textTransform: 'uppercase',
  },
  statsBar: {
    display: 'flex', gap: 0, alignItems: 'center',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(0,245,255,0.15)',
    borderRadius: 12, padding: '10px 20px',
    width: '100%',
  },
  statItem: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
  },
  statValue: {
    fontSize: 18, fontWeight: 700, color: '#E8EAFF',
    fontFamily: 'Orbitron, monospace',
  },
  statLabel: {
    fontSize: 11, color: '#7B8DB0', textTransform: 'uppercase', letterSpacing: '0.05em',
  },
  statDivider: {
    width: 1, height: 36, background: 'rgba(0,245,255,0.15)',
  },
  buttons: {
    width: '100%', display: 'flex', flexDirection: 'column', gap: 12,
  },
  playBtn: {
    width: '100%', padding: '18px 24px',
    background: 'linear-gradient(135deg, #004A4A, #006868)',
    border: '1px solid rgba(0,245,255,0.5)',
    borderRadius: 16,
    position: 'relative', overflow: 'hidden',
    boxShadow: '0 0 20px rgba(0,245,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
    transition: 'transform 0.1s, box-shadow 0.2s',
    cursor: 'pointer',
  },
  playBtnInner: {
    display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1,
  },
  playIcon: {
    fontSize: 28, color: '#00F5FF',
    filter: 'drop-shadow(0 0 8px #00F5FF)',
  },
  playBtnText: {
    fontSize: 20, fontWeight: 700, color: '#00F5FF',
    fontFamily: 'Orbitron, monospace', textAlign: 'left',
  },
  playBtnSub: {
    fontSize: 12, color: '#7B8DB0', textAlign: 'left', marginTop: 2,
  },
  playBtnGlow: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at 20% 50%, rgba(0,245,255,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  secondaryBtn: {
    width: '100%', padding: '14px 20px',
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(0,245,255,0.2)',
    borderRadius: 14,
    cursor: 'pointer',
    transition: 'transform 0.1s, border-color 0.2s',
  },
  secondaryBtnContent: {
    display: 'flex', alignItems: 'center', gap: 14,
  },
  secondaryBtnText: {
    fontSize: 15, fontWeight: 600, color: '#E8EAFF', textAlign: 'left',
  },
  secondaryBtnSub: {
    fontSize: 11, color: '#7B8DB0', marginTop: 2, textAlign: 'left',
  },
  bottomRow: {
    display: 'flex', gap: 12, width: '100%', justifyContent: 'space-between', alignItems: 'center',
  },
  premiumBtn: {
    flex: 1, padding: '12px 16px',
    background: 'linear-gradient(135deg, rgba(191,95,255,0.2), rgba(255,45,120,0.2))',
    border: '1px solid rgba(191,95,255,0.5)',
    borderRadius: 12, color: '#BF5FFF',
    fontSize: 14, fontWeight: 600, letterSpacing: '0.05em',
    cursor: 'pointer',
  },
  premiumBadge: {
    flex: 1, padding: '12px 16px', textAlign: 'center',
    background: 'linear-gradient(135deg, rgba(191,95,255,0.15), rgba(255,45,120,0.15))',
    border: '1px solid rgba(191,95,255,0.3)',
    borderRadius: 12, color: '#BF5FFF',
    fontSize: 14, fontWeight: 600,
  },
  settingsBtn: {
    width: 48, height: 48,
    background: 'rgba(0,0,0,0.4)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 12, color: '#7B8DB0',
    fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer',
  },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.8)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 100, padding: 24,
  },
  premiumModal: {
    background: '#111827',
    border: '1px solid rgba(191,95,255,0.4)',
    borderRadius: 20, padding: 32,
    maxWidth: 360, width: '100%',
    boxShadow: '0 0 40px rgba(191,95,255,0.3)',
    textAlign: 'center',
  },
  premiumTitle: {
    fontSize: 22, fontWeight: 700, color: '#BF5FFF',
    marginBottom: 8, letterSpacing: '0.1em',
  },
  premiumPrice: {
    fontSize: 36, fontWeight: 900, color: '#FFD700',
    fontFamily: 'Orbitron, monospace', marginBottom: 20,
  },
  premiumList: {
    listStyle: 'none', textAlign: 'left', marginBottom: 24,
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  buyBtn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #6B35AA, #BF5FFF)',
    border: 'none', borderRadius: 12,
    color: '#fff', fontSize: 16, fontWeight: 700,
    cursor: 'pointer', marginBottom: 10,
  },
  cancelBtn: {
    width: '100%', padding: '10px',
    background: 'transparent', border: 'none',
    color: '#7B8DB0', fontSize: 13, cursor: 'pointer',
  },
};
