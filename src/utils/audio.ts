let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play tick-tock sound for the active clock.
 * @param isTick High tone tick versus lower tone tock
 * @param volume Volume level from 0 to 1
 */
export function playTickTockSound(isTick: boolean, volume: number = 0.5) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Short wooden woodblock click
    osc.type = 'triangle';
    const freq = isTick ? 1400 : 900;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Fast decay envelope
    gainNode.gain.setValueAtTime(volume * 0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.02);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch (err) {
    console.warn('Audio Context TICK TOCK failed:', err);
  }
}

/**
 * Synthesize alarm based on selected style.
 */
export function playAlarmSound(type: 'digital-alarm' | 'crystal-bell' | 'zen-gong' | 'birds-chirping', volume: number = 0.5) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const mainGain = ctx.createGain();
    mainGain.gain.setValueAtTime(volume, ctx.currentTime);
    mainGain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'digital-alarm': {
        // Multi-pulsed buzzer beep-beep-beep
        const numBeeps = 4;
        const beepDuration = 0.15;
        const beepGap = 0.15;

        for (let i = 0; i < numBeeps; i++) {
          const beepStart = now + i * (beepDuration + beepGap);
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const localGain = ctx.createGain();

          osc1.connect(localGain);
          osc2.connect(localGain);
          localGain.connect(mainGain);

          osc1.type = 'square';
          osc1.frequency.setValueAtTime(980, beepStart);

          osc2.type = 'sawtooth';
          osc2.frequency.setValueAtTime(985, beepStart);

          // Pulsing volume envelope for current beep
          localGain.gain.setValueAtTime(0, beepStart);
          localGain.gain.linearRampToValueAtTime(0.5, beepStart + 0.02);
          localGain.gain.setValueAtTime(0.5, beepStart + beepDuration - 0.02);
          localGain.gain.linearRampToValueAtTime(0, beepStart + beepDuration);

          osc1.start(beepStart);
          osc1.stop(beepStart + beepDuration);

          osc2.start(beepStart);
          osc2.stop(beepStart + beepDuration);
        }
        break;
      }

      case 'crystal-bell': {
        // Multi-layered pure bells (fundamental + harmonics) for deep rich crystalline sound
        const frequencies = [880, 1100, 1485, 2200];
        const gains = [0.4, 0.3, 0.2, 0.15];
        const duration = 2.5;

        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const bellGain = ctx.createGain();

          osc.connect(bellGain);
          bellGain.connect(mainGain);

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          // Metallic attack and ring decay
          bellGain.gain.setValueAtTime(0, now);
          bellGain.gain.linearRampToValueAtTime(gains[idx] * 0.8, now + 0.005);
          bellGain.gain.exponentialRampToValueAtTime(0.0001, now + duration - (idx * 0.4));

          osc.start(now);
          osc.stop(now + duration);
        });
        break;
      }

      case 'zen-gong': {
        // Deep relaxing Buddhist bowl gong
        const baseFreq = 120;
        const overtones = [
          { f: 120, g: 0.6, decay: 4.5 },
          { f: 180, g: 0.3, decay: 3.5 },
          { f: 275, g: 0.25, decay: 3.0 },
          { f: 395, g: 0.15, decay: 2.5 },
          { f: 550, g: 0.1, decay: 1.8 }
        ];

        overtones.forEach((overtone) => {
          const osc = ctx.createOscillator();
          const gongGain = ctx.createGain();

          osc.connect(gongGain);
          gongGain.connect(mainGain);

          osc.type = overtone.f === baseFreq ? 'triangle' : 'sine';
          // Detune slightly for lush warmth
          osc.frequency.setValueAtTime(overtone.f + (Math.random() * 0.8 - 0.4), now);

          gongGain.gain.setValueAtTime(0, now);
          gongGain.gain.linearRampToValueAtTime(overtone.g, now + 0.03);
          gongGain.gain.exponentialRampToValueAtTime(0.0001, now + overtone.decay);

          osc.start(now);
          osc.stop(now + overtone.decay);
        });
        break;
      }

      case 'birds-chirping': {
        // Simulate a natural sequence of morning birds
        const totalDuration = 2.5;
        // Generate multiple bird chirps
        const chirps = [
          { start: 0, length: 0.15, fStart: 2100, fEnd: 3600 },
          { start: 0.22, length: 0.18, fStart: 2200, fEnd: 3800 },
          { start: 0.45, length: 0.16, fStart: 2150, fEnd: 3700 },
          { start: 0.9, length: 0.15, fStart: 2500, fEnd: 3950 },
          { start: 1.1, length: 0.2, fStart: 2300, fEnd: 4100 },
          { start: 1.7, length: 0.18, fStart: 2400, fEnd: 3800 },
          { start: 1.9, length: 0.15, fStart: 2450, fEnd: 4000 }
        ];

        chirps.forEach((c) => {
          const chirpStart = now + c.start;
          const chirpEnd = chirpStart + c.length;

          const osc = ctx.createOscillator();
          const chirpGain = ctx.createGain();

          osc.connect(chirpGain);
          chirpGain.connect(mainGain);

          osc.type = 'sine';
          
          // Frequency pitch slide ramp for chirp effect
          osc.frequency.setValueAtTime(c.fStart, chirpStart);
          osc.frequency.exponentialRampToValueAtTime(c.fEnd, chirpEnd);

          // Fast chirp swell envelope
          chirpGain.gain.setValueAtTime(0, chirpStart);
          chirpGain.gain.linearRampToValueAtTime(0.2, chirpStart + 0.02);
          chirpGain.gain.exponentialRampToValueAtTime(0.0001, chirpEnd);

          osc.start(chirpStart);
          osc.stop(chirpEnd + 0.01);
        });
        break;
      }
    }
  } catch (err) {
    console.warn('Synthesis of alarm audio failed:', err);
  }
}
