// Web Audio API synthesized sound engine for Shadow Shift

let ctx = null;
let masterGain = null;
let musicGain = null;
let sfxGain = null;
let ambientOsc = null;
let ambientIsPlaying = false;

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 1.0;
    masterGain.connect(ctx.destination);

    musicGain = ctx.createGain();
    musicGain.gain.value = 0.5;
    musicGain.connect(masterGain);

    sfxGain = ctx.createGain();
    sfxGain.gain.value = 0.8;
    sfxGain.connect(masterGain);
  }
  return ctx;
}

function resume() {
  const c = getCtx();
  if (c.state === 'suspended') c.resume();
}

export function setMusicVolume(vol) {
  resume();
  if (musicGain) musicGain.gain.setTargetAtTime(vol, getCtx().currentTime, 0.1);
}

export function setSfxVolume(vol) {
  resume();
  if (sfxGain) sfxGain.gain.setTargetAtTime(vol, getCtx().currentTime, 0.1);
}

export function setMasterVolume(vol) {
  resume();
  if (masterGain) masterGain.gain.setTargetAtTime(vol, getCtx().currentTime, 0.1);
}

// ─── SOUND EFFECTS ────────────────────────────────────────

export function playMirrorRotate() {
  try {
    resume();
    const c = getCtx();
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(sfxGain);
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch {}
}

export function playMirrorPlace() {
  try {
    resume();
    const c = getCtx();
    const now = c.currentTime;
    // Click sound
    const buf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (data.length * 0.1));
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const gain = c.createGain();
    src.connect(gain);
    gain.connect(sfxGain);
    gain.gain.setValueAtTime(0.3, now);
    src.start(now);
  } catch {}
}

export function playCrystalHit() {
  try {
    resume();
    const c = getCtx();
    const now = c.currentTime;
    const freqs = [880, 1100, 1320, 1760];
    freqs.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(sfxGain);
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * 0.05);
      gain.gain.linearRampToValueAtTime(0.15, now + i * 0.05 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.6);
      osc.start(now + i * 0.05);
      osc.stop(now + i * 0.05 + 0.7);
    });
  } catch {}
}

export function playLevelComplete(stars) {
  try {
    resume();
    const c = getCtx();
    const now = c.currentTime;

    // Fanfare: ascending arpeggio, scale with stars
    const baseFreqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const count = stars === 3 ? 4 : stars === 2 ? 3 : 2;
    const noteLen = stars === 3 ? 0.18 : 0.15;

    for (let i = 0; i < count; i++) {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(sfxGain);
      osc.type = 'triangle';
      osc.frequency.value = baseFreqs[i];
      const t = now + i * noteLen;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.25, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteLen * 2);
      osc.start(t);
      osc.stop(t + noteLen * 2);
    }

    if (stars === 3) {
      // Extra sparkle for 3 stars
      setTimeout(() => {
        try {
          const n = c.currentTime;
          [1047, 1319, 1568].forEach((freq, i) => {
            const o = c.createOscillator();
            const g = c.createGain();
            o.connect(g); g.connect(sfxGain);
            o.type = 'sine'; o.frequency.value = freq;
            g.gain.setValueAtTime(0.18, n + i * 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, n + i * 0.1 + 0.4);
            o.start(n + i * 0.1); o.stop(n + i * 0.1 + 0.5);
          });
        } catch {}
      }, count * noteLen * 1000);
    }
  } catch {}
}

export function playStarReveal() {
  try {
    resume();
    const c = getCtx();
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(sfxGain);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(700, now);
    osc.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.start(now); osc.stop(now + 0.3);
  } catch {}
}

export function playError() {
  try {
    resume();
    const c = getCtx();
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(sfxGain);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.15);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
    osc.start(now); osc.stop(now + 0.25);
  } catch {}
}

export function playButtonTap() {
  try {
    resume();
    const c = getCtx();
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(sfxGain);
    osc.type = 'sine';
    osc.frequency.value = 440;
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.start(now); osc.stop(now + 0.15);
  } catch {}
}

export function playAchievementUnlock() {
  try {
    resume();
    const c = getCtx();
    const now = c.currentTime;
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain); gain.connect(sfxGain);
      osc.type = 'triangle';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.18, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.1 + 0.3);
      osc.start(now + i * 0.1); osc.stop(now + i * 0.1 + 0.4);
    });
  } catch {}
}

// ─── AMBIENT LASER HUM ─────────────────────────────────────

let laserHumOsc = null;
let laserHumGain = null;
let laserHumActive = false;

export function startLaserHum() {
  if (laserHumActive) return;
  try {
    resume();
    const c = getCtx();
    laserHumOsc = c.createOscillator();
    laserHumGain = c.createGain();
    const filter = c.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    laserHumOsc.connect(filter);
    filter.connect(laserHumGain);
    laserHumGain.connect(sfxGain);

    laserHumOsc.type = 'sawtooth';
    laserHumOsc.frequency.value = 60;
    laserHumGain.gain.value = 0;
    laserHumGain.gain.linearRampToValueAtTime(0.04, c.currentTime + 0.3);
    laserHumOsc.start();
    laserHumActive = true;
  } catch {}
}

export function stopLaserHum() {
  if (!laserHumActive) return;
  try {
    const c = getCtx();
    laserHumGain.gain.setTargetAtTime(0, c.currentTime, 0.3);
    setTimeout(() => {
      try { laserHumOsc.stop(); } catch {}
      laserHumActive = false;
      laserHumOsc = null;
      laserHumGain = null;
    }, 1000);
  } catch {
    laserHumActive = false;
  }
}

// ─── AMBIENT MUSIC ─────────────────────────────────────────

let ambientNodes = [];
let ambientActive = false;
let ambientInterval = null;

const ambientScale = [130.81, 146.83, 164.81, 174.61, 196, 220, 246.94, 261.63];

function playAmbientNote() {
  try {
    const c = getCtx();
    const freq = ambientScale[Math.floor(Math.random() * ambientScale.length)];
    const now = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain); gain.connect(musicGain);
    osc.type = 'sine';
    osc.frequency.value = freq;
    const duration = 2 + Math.random() * 3;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.5);
    gain.gain.setValueAtTime(0.06, now + duration - 0.5);
    gain.gain.linearRampToValueAtTime(0, now + duration);
    osc.start(now);
    osc.stop(now + duration);
  } catch {}
}

export function startAmbientMusic() {
  if (ambientActive) return;
  ambientActive = true;
  resume();
  playAmbientNote();
  ambientInterval = setInterval(playAmbientNote, 1500);
}

export function stopAmbientMusic() {
  if (!ambientActive) return;
  ambientActive = false;
  if (ambientInterval) { clearInterval(ambientInterval); ambientInterval = null; }
}
