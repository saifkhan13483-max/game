import React from 'react';
import { useGame } from '../context/GameContext.jsx';

export default function HintModal({ hint, hintCount, onClose, onHintUsed }) {
  const { useHint, watchAdForHint } = useGame();

  const handleUseHint = () => {
    const used = useHint();
    if (!used) return;
    if (onHintUsed) onHintUsed();
    onClose();
  };

  const handleWatchAd = () => {
    // Simulate ad watch
    setTimeout(() => {
      watchAdForHint();
    }, 1000);
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()} className="scale-in">
        <div style={styles.icon}>💡</div>
        <div className="orbitron" style={styles.title}>Hint</div>

        {hintCount > 0 ? (
          <>
            <div style={styles.hintText}>{hint}</div>
            <div style={styles.hintCount}>You have <span style={{ color: '#FFD700' }}>{hintCount}</span> hint{hintCount !== 1 ? 's' : ''} remaining</div>
            <button style={styles.useBtn} onClick={handleUseHint}>
              Use Hint (−1)
            </button>
          </>
        ) : (
          <>
            <div style={styles.noHints}>You're out of hints!</div>
            <div style={styles.adOffer}>
              Watch a short video to unlock a hint for free.
            </div>
            <button style={styles.adBtn} onClick={handleWatchAd}>
              📺 Watch Ad for Hint
            </button>
          </>
        )}

        <button style={styles.closeBtn} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 200, padding: 24,
  },
  modal: {
    background: '#111827',
    border: '1px solid rgba(0,245,255,0.25)',
    borderRadius: 20, padding: '28px 28px 24px',
    maxWidth: 340, width: '100%',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
    boxShadow: '0 0 40px rgba(0,245,255,0.15)',
  },
  icon: { fontSize: 36 },
  title: {
    fontSize: 18, color: '#00F5FF', letterSpacing: '0.15em',
  },
  hintText: {
    fontSize: 14, color: '#E8EAFF', textAlign: 'center', lineHeight: 1.6,
    padding: '12px 16px',
    background: 'rgba(0,245,255,0.06)',
    border: '1px solid rgba(0,245,255,0.15)',
    borderRadius: 10,
  },
  hintCount: {
    fontSize: 12, color: '#7B8DB0',
  },
  useBtn: {
    width: '100%', padding: '12px',
    background: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(0,100,100,0.2))',
    border: '1px solid rgba(0,245,255,0.4)',
    borderRadius: 12, color: '#00F5FF',
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
  noHints: {
    fontSize: 15, color: '#FF2D78', fontWeight: 600,
  },
  adOffer: {
    fontSize: 13, color: '#7B8DB0', textAlign: 'center', lineHeight: 1.5,
  },
  adBtn: {
    width: '100%', padding: '12px',
    background: 'linear-gradient(135deg, rgba(191,95,255,0.2), rgba(100,0,180,0.2))',
    border: '1px solid rgba(191,95,255,0.4)',
    borderRadius: 12, color: '#BF5FFF',
    fontSize: 14, fontWeight: 700, cursor: 'pointer',
  },
  closeBtn: {
    width: '100%', padding: '10px',
    background: 'transparent', border: 'none',
    color: '#7B8DB0', fontSize: 13, cursor: 'pointer',
  },
};
