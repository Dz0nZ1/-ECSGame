// Tiny WebAudio sound engine — all SFX are synthesized, so there are no audio
// asset files to ship. A single AudioContext is lazily created and must be
// resumed from a user gesture (we call SFX.resume() on the Start click).
const SFX = (function audioEngine() {
  let ctx = null;
  let muted = false;

  const ac = () => {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ctx = new AC();
    }
    return ctx;
  };

  // A short oscillator blip with an exponential volume decay, optionally
  // gliding from `freq` to `slideTo`.
  const tone = (freq, dur, type, gain, slideTo) => {
    const c = ac();
    if (!c || muted) return;
    const now = c.currentTime;
    const osc = c.createOscillator();
    const amp = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    osc.connect(amp).connect(c.destination);
    osc.start(now);
    osc.stop(now + dur);
  };

  // A burst of filtered white noise — the "impact" part of a hit.
  const noise = (dur, gain) => {
    const c = ac();
    if (!c || muted) return;
    const now = c.currentTime;
    const frames = Math.floor(c.sampleRate * dur);
    const buffer = c.createBuffer(1, frames, c.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buffer;
    const amp = c.createGain();
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1800;
    src.connect(lp).connect(amp).connect(c.destination);
    src.start(now);
    src.stop(now + dur);
  };

  return {
    resume() {
      const c = ac();
      if (c && c.state === "suspended") c.resume();
    },
    toggleMute() {
      muted = !muted;
      return muted;
    },
    isMuted() {
      return muted;
    },
    swing() {
      tone(240, 0.08, "triangle", 0.05, 120);
    },
    hit() {
      noise(0.13, 0.22);
      tone(150, 0.13, "square", 0.09, 60);
    },
    block() {
      tone(360, 0.07, "square", 0.06, 300);
      noise(0.05, 0.08);
    },
    ko() {
      tone(180, 0.5, "sawtooth", 0.13, 40);
      noise(0.25, 0.18);
    },
    roundStart() {
      tone(520, 0.1, "square", 0.06, 660);
    },
  };
})();

window.SFX = SFX;
