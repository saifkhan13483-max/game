import React, { useState, useEffect } from 'react';

export default function InterstitialAd({ onClose }) {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          clearInterval(interval);
          setCanSkip(true);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={styles.overlay}>
      <div style={styles.adBox}>
        <div style={styles.adLabel}>Advertisement</div>

        {/* Simulated ad creative */}
        <div style={styles.adCreative}>
          <div style={styles.adGlow} />
          <div style={styles.adEmoji}>🎮</div>
          <div style={styles.adTitle}>Enjoy Shadow Shift?</div>
          <div style={styles.adSubtitle}>Remove all ads forever with Premium</div>
          <div style={styles.adPrice}>Just $3.99</div>
        </div>

        <div style={styles.bottomRow}>
          {canSkip ? (
            <button style={styles.skipBtn} onClick={onClose}>
              Continue →
            </button>
          ) : (
            <div style={styles.countdown}>
              <div style={styles.countdownNum}>{countdown}</div>
              <div style={styles.countdownLabel}>Ad ends in...</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.95)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 500, padding: 24,
  },
  adBox: {
    width: '100%', maxWidth: 360,
    background: '#111827',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 20, overflow: 'hidden',
    display: 'flex', flexDirection: 'column',
  },
  adLabel: {
    padding: '8px 16px',
    background: 'rgba(255,255,255,0.05)',
    fontSize: 10, color: '#4A5568', textAlign: 'center',
    letterSpacing: '0.1em', textTransform: 'uppercase',
    borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  adCreative: {
    padding: 32, textAlign: 'center', position: 'relative',
    background: 'linear-gradient(135deg, #0D1B3E, #1a0030)',
    minHeight: 220, display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', gap: 10,
  },
  adGlow: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at center, rgba(191,95,255,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  adEmoji: { fontSize: 52, filter: 'drop-shadow(0 0 12px #BF5FFF)' },
  adTitle: { fontSize: 20, fontWeight: 700, color: '#E8EAFF', fontFamily: 'Orbitron, monospace' },
  adSubtitle: { fontSize: 13, color: '#7B8DB0' },
  adPrice: {
    fontSize: 24, fontWeight: 900, color: '#FFD700',
    fontFamily: 'Orbitron, monospace',
    filter: 'drop-shadow(0 0 8px #FFD700)',
  },
  bottomRow: {
    padding: '16px 24px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  skipBtn: {
    padding: '12px 32px',
    background: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(0,100,100,0.2))',
    border: '1px solid rgba(0,245,255,0.4)',
    borderRadius: 12, color: '#00F5FF',
    fontSize: 15, fontWeight: 700, cursor: 'pointer',
    fontFamily: 'Orbitron, monospace', letterSpacing: '0.05em',
  },
  countdown: { textAlign: 'center' },
  countdownNum: {
    fontSize: 32, fontWeight: 900, color: '#BF5FFF',
    fontFamily: 'Orbitron, monospace',
  },
  countdownLabel: { fontSize: 11, color: '#7B8DB0', marginTop: 2 },
};
