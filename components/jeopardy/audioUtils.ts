/**
 * Audio utility functions for Jeopardy game sound effects
 */

/** Safari before 14.1 only has the prefixed constructor. */
const createAudioContext = (): AudioContext => {
    const Ctor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) throw new Error('Web Audio is not available');
    return new Ctor();
};

export const playChime = () => {
    try {
        const audioCtx = createAudioContext();
        const now = audioCtx.currentTime;

        // Create a nice major triad arpeggio (C5 - E5 - G5)
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

        notes.forEach((freq, i) => {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'sine';
            oscillator.frequency.value = freq;

            // Stagger start times slightly for a "strum" or "roll" effect
            const startTime = now + (i * 0.05);

            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 1.0);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start(startTime);
            oscillator.stop(startTime + 1.0);
        });
    } catch (e) {
        console.error("Audio chime failed", e);
    }
};

export const playBuzz = () => {
    try {
        const audioCtx = createAudioContext();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.type = 'sawtooth'; // Harsh buzzer sound
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        oscillator.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + 0.5);

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
        console.error("Audio buzzer failed", e);
    }
};

export const playWinSound = () => {
    try {
        const audioCtx = createAudioContext();
        const now = audioCtx.currentTime;
        const notes = [
            { freq: 523.25, start: 0, dur: 0.4 },   // C5
            { freq: 659.25, start: 0.2, dur: 0.4 }, // E5
            { freq: 783.99, start: 0.4, dur: 0.4 }, // G5
            { freq: 1046.50, start: 0.6, dur: 1.0 } // C6
        ];

        notes.forEach(n => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(n.freq, now + n.start);

            const time = now + n.start;
            gain.gain.setValueAtTime(0, time);
            gain.gain.linearRampToValueAtTime(0.2, time + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, time + n.dur);

            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start(time);
            osc.stop(time + n.dur);
        });
    } catch (e) {
        console.error("Win sound failed", e);
    }
};

export const playTimeUp = () => {
    try {
        const audioCtx = createAudioContext();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {
        console.error("Time up sound failed", e);
    }
};

export const playBeep = () => {
    try {
        const audioCtx = createAudioContext();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.value = 800;
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
    } catch (e) {
        console.error("Beep failed", e);
    }
};
