// Alla ljud syntetiseras i webbläsaren — inga ljudfiler att ladda, inget
// som kan fastna på en långsam uppkoppling mitt i ett kundmöte.

let ctx = null;
let muted = false;

function context() {
  if (!ctx) ctx = new (window.AudioContext ?? window.webkitAudioContext)();
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setMuted(value) {
  muted = value;
}

export function isMuted() {
  return muted;
}

function tone({ freq, endFreq, duration, type = 'square', volume = 0.05, delay = 0 }) {
  if (muted) return;
  const audio = context();
  const start = audio.currentTime + delay;

  const osc = audio.createOscillator();
  const gain = audio.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (endFreq) osc.frequency.exponentialRampToValueAtTime(endFreq, start + duration);

  gain.gain.setValueAtTime(volume, start);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain).connect(audio.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function noise({ duration, volume = 0.04, delay = 0 }) {
  if (muted) return;
  const audio = context();
  const frames = Math.floor(audio.sampleRate * duration);
  const buffer = audio.createBuffer(1, frames, audio.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames);
  }

  const source = audio.createBufferSource();
  const gain = audio.createGain();
  source.buffer = buffer;
  gain.gain.value = volume;
  source.connect(gain).connect(audio.destination);
  source.start(audio.currentTime + delay);
}

export const sfx = {
  jump: () => tone({ freq: 340, endFreq: 620, duration: 0.12, volume: 0.035 }),
  doubleJump: () => tone({ freq: 520, endFreq: 880, duration: 0.14, volume: 0.035 }),
  land: () => noise({ duration: 0.07, volume: 0.02 }),
  coin: () => {
    tone({ freq: 988, duration: 0.07, volume: 0.045 });
    tone({ freq: 1319, duration: 0.16, volume: 0.045, delay: 0.07 });
  },
  gear: () => {
    [523, 659, 784, 1047].forEach((freq, i) =>
      tone({ freq, duration: 0.16, volume: 0.04, delay: i * 0.075 }),
    );
  },
  zone: () => {
    tone({ freq: 392, duration: 0.14, volume: 0.03, type: 'triangle' });
    tone({ freq: 587, duration: 0.22, volume: 0.03, type: 'triangle', delay: 0.12 });
  },
  rocket: () => {
    noise({ duration: 1.6, volume: 0.05 });
    tone({ freq: 160, endFreq: 1200, duration: 1.5, type: 'sawtooth', volume: 0.03 });
  },
};
