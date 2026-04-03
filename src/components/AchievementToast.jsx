import React, { useEffect, useState } from 'react';

export default function AchievementToast({ achievement, onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 50);
    const t2 = setTimeout(() => {
      setVisible(false);
      setTimeout(onDone, 400);
    }, 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      ...styles.toast,
      transform: visible
        ? 'translateX(-50%) translateY(0) scale(1)'
        : 'translateX(-50%) translateY(-80px) scale(0.9)',
      opacity: visible ? 1 : 0,
    }}>
      <div style={styles.icon}>{achievement.icon}</div>
      <div style={styles.textArea}>
        <div style={styles.label}>Achievement Unlocked!</div>
        <div style={styles.name}>{achievement.name}</div>
        <div style={styles.desc}>{achievement.desc}</div>
      </div>
    </div>
  );
}

const styles = {
  toast: {
    position: 'fixed', top: 16, left: '50%',
    background: 'linear-gradient(135deg, #111827, #1a2035)',
    border: '1px solid rgba(255,215,0,0.5)',
    borderRadius: 16, padding: '12px 16px',
    display: 'flex', gap: 12, alignItems: 'center',
    minWidth: 260, maxWidth: 340,
    boxShadow: '0 4px 30px rgba(255,215,0,0.3)',
    zIndex: 9999,
    transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease',
  },
  icon: { fontSize: 32, flexShrink: 0 },
  textArea: { display: 'flex', flexDirection: 'column', gap: 1 },
  label: { fontSize: 10, color: '#FFD700', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' },
  name: { fontSize: 15, fontWeight: 700, color: '#E8EAFF', fontFamily: 'Orbitron, monospace' },
  desc: { fontSize: 11, color: '#7B8DB0', marginTop: 1 },
};
