import React from 'react';
import { useGame } from '../context/GameContext.jsx';

export default function SettingsModal({ onClose }) {
  const { save, updateSave } = useGame();

  const updateSetting = (key, value) => {
    updateSave(s => ({
      ...s,
      settings: { ...s.settings, [key]: value },
    }));
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()} className="scale-in">
        <div className="orbitron" style={styles.title}>Settings</div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Audio</div>

          <div style={styles.settingRow}>
            <span style={styles.settingLabel}>🎵 Music</span>
            <input
              type="range" min="0" max="1" step="0.1"
              value={save.settings.musicVolume}
              onChange={e => updateSetting('musicVolume', parseFloat(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.settingValue}>{Math.round(save.settings.musicVolume * 100)}%</span>
          </div>

          <div style={styles.settingRow}>
            <span style={styles.settingLabel}>🔊 SFX</span>
            <input
              type="range" min="0" max="1" step="0.1"
              value={save.settings.sfxVolume}
              onChange={e => updateSetting('sfxVolume', parseFloat(e.target.value))}
              style={styles.slider}
            />
            <span style={styles.settingValue}>{Math.round(save.settings.sfxVolume * 100)}%</span>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Experience</div>

          <div style={styles.settingRowToggle}>
            <span style={styles.settingLabel}>📳 Haptic Feedback</span>
            <button
              style={{ ...styles.toggle, background: save.settings.haptics ? '#00F5FF' : 'rgba(255,255,255,0.1)' }}
              onClick={() => updateSetting('haptics', !save.settings.haptics)}
            >
              <div style={{ ...styles.toggleThumb, transform: save.settings.haptics ? 'translateX(18px)' : 'translateX(2px)' }} />
            </button>
          </div>

          <div style={styles.settingRowToggle}>
            <span style={styles.settingLabel}>🔔 Notifications</span>
            <button
              style={{ ...styles.toggle, background: save.settings.notifications ? '#00F5FF' : 'rgba(255,255,255,0.1)' }}
              onClick={() => updateSetting('notifications', !save.settings.notifications)}
            >
              <div style={{ ...styles.toggleThumb, transform: save.settings.notifications ? 'translateX(18px)' : 'translateX(2px)' }} />
            </button>
          </div>
        </div>

        <div style={styles.section}>
          <div style={styles.sectionTitle}>Account</div>
          <div style={styles.accountInfo}>
            <span style={{ color: '#7B8DB0', fontSize: 13 }}>Status:</span>
            <span style={{ color: save.isPremium ? '#BF5FFF' : '#7B8DB0', fontWeight: 600, fontSize: 13 }}>
              {save.isPremium ? '✦ Premium' : 'Free'}
            </span>
          </div>
          <div style={styles.accountInfo}>
            <span style={{ color: '#7B8DB0', fontSize: 13 }}>Hints:</span>
            <span style={{ color: '#FFD700', fontWeight: 600, fontSize: 13 }}>{save.hints}</span>
          </div>
        </div>

        <button style={styles.closeBtn} onClick={onClose}>Done</button>
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
    border: '1px solid rgba(0,245,255,0.2)',
    borderRadius: 20, padding: '28px 24px',
    maxWidth: 360, width: '100%',
    display: 'flex', flexDirection: 'column', gap: 20,
    boxShadow: '0 0 40px rgba(0,245,255,0.1)',
    maxHeight: '90vh', overflowY: 'auto',
  },
  title: {
    fontSize: 18, color: '#E8EAFF', letterSpacing: '0.15em', textAlign: 'center',
  },
  section: {
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  sectionTitle: {
    fontSize: 11, color: '#7B8DB0', textTransform: 'uppercase', letterSpacing: '0.12em',
    borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 6,
  },
  settingRow: {
    display: 'flex', alignItems: 'center', gap: 12,
  },
  settingRowToggle: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  settingLabel: { fontSize: 14, color: '#E8EAFF', flex: 1 },
  settingValue: { fontSize: 12, color: '#7B8DB0', minWidth: 36, textAlign: 'right' },
  slider: {
    flex: 1, accentColor: '#00F5FF', height: 4,
  },
  toggle: {
    width: 42, height: 24, borderRadius: 12,
    border: 'none', cursor: 'pointer',
    position: 'relative', transition: 'background 0.2s',
    padding: 0,
  },
  toggleThumb: {
    width: 18, height: 18, borderRadius: '50%',
    background: '#fff', position: 'absolute', top: 3,
    transition: 'transform 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },
  accountInfo: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '6px 0',
  },
  closeBtn: {
    width: '100%', padding: '12px',
    background: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(0,100,100,0.2))',
    border: '1px solid rgba(0,245,255,0.4)',
    borderRadius: 12, color: '#00F5FF',
    fontSize: 15, fontWeight: 700, cursor: 'pointer',
  },
};
