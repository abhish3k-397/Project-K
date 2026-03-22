/**
 * AudioManager — Procedural sound effects using Web Audio API.
 * No external audio files needed.
 */
export class AudioManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  init() {
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      this.enabled = false;
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  _play(freq, type, duration, volume = 0.3) {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  success() {
    this._play(523.25, 'sine', 0.15, 0.25);
    setTimeout(() => this._play(659.25, 'sine', 0.15, 0.25), 100);
    setTimeout(() => this._play(783.99, 'sine', 0.3, 0.25), 200);
  }

  fail() {
    this._play(311.13, 'sawtooth', 0.2, 0.15);
    setTimeout(() => this._play(233.08, 'sawtooth', 0.4, 0.15), 150);
  }

  click() {
    this._play(800, 'sine', 0.05, 0.15);
  }

  tick() {
    this._play(1000, 'square', 0.03, 0.1);
  }

  levelUp() {
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      setTimeout(() => this._play(freq, 'sine', 0.2, 0.2), i * 120);
    });
  }

  gameOver() {
    const notes = [392, 349.23, 311.13, 261.63];
    notes.forEach((freq, i) => {
      setTimeout(() => this._play(freq, 'sawtooth', 0.4, 0.15), i * 200);
    });
  }

  countdown() {
    this._play(600, 'square', 0.1, 0.12);
  }
}
