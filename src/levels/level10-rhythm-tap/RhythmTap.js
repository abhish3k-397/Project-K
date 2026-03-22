import { BaseLevel } from '../BaseLevel.js';
import './style.css';

/**
 * Level 10 — Rhythm Tap
 * Hit keys in time with visual beats.
 * Synthwave aesthetic — dark purple, neon orange, waveform bg.
 */
export class RhythmTap extends BaseLevel {
  async init(container, sublevel, callbacks) {
    await super.init(container, sublevel, callbacks);

    const config = this.getConfig([
      { beats: 4, bpm: 80, offbeats: false },
      { beats: 8, bpm: 110, offbeats: false },
      { beats: 16, bpm: 140, offbeats: true }
    ]);

    const beatInterval = 60000 / config.bpm;
    const keys = ['D', 'F', 'J', 'K'];
    
    // Generate beat pattern
    const pattern = [];
    for (let i = 0; i < config.beats; i++) {
      const key = keys[Math.floor(Math.random() * keys.length)];
      const time = i * beatInterval;
      pattern.push({ key, time, hit: false, missed: false });
    }

    this.container.innerHTML = `
      <div class="rhythm-level">
        <div class="rhythm-waveform"></div>
        <div class="rhythm-header">
          <span class="rhythm-bpm">${config.bpm} BPM</span>
          <span class="rhythm-score" id="rhythm-score">0 / ${config.beats}</span>
        </div>
        <div class="rhythm-lanes" id="rhythm-lanes">
          ${keys.map(k => `
            <div class="rhythm-lane" data-key="${k}">
              <div class="rhythm-lane-label">${k}</div>
              <div class="rhythm-hit-zone" id="rhythm-zone-${k}"></div>
            </div>
          `).join('')}
        </div>
        <div class="rhythm-status" id="rhythm-status">Press D, F, J, K</div>
      </div>
    `;

    const lanesEl = this.container.querySelector('#rhythm-lanes');
    const scoreEl = this.container.querySelector('#rhythm-score');
    const statusEl = this.container.querySelector('#rhythm-status');

    let hits = 0;
    let misses = 0;
    let beatIndex = 0;
    let gameActive = true;
    const tolerance = beatInterval * 0.35; // Hit window

    // Create note elements
    const noteEls = [];
    pattern.forEach((beat, i) => {
      const noteEl = document.createElement('div');
      noteEl.className = 'rhythm-note';
      noteEl.dataset.key = beat.key;
      noteEl.textContent = beat.key;
      noteEl.style.display = 'none';
      const lane = lanesEl.querySelector(`[data-key="${beat.key}"]`);
      lane.appendChild(noteEl);
      noteEls.push(noteEl);
    });

    // Start game
    const startTime = Date.now() + 1000; // 1s delay

    const animate = () => {
      if (!gameActive) return;
      const now = Date.now();
      const elapsed = now - startTime;

      // Animate notes falling
      pattern.forEach((beat, i) => {
        const noteEl = noteEls[i];
        const noteTime = beat.time;
        const timeDiff = elapsed - noteTime;
        const progress = timeDiff / (beatInterval * 4); // 4 beats to fall
        
        if (progress >= -1 && progress <= 0.5) {
          noteEl.style.display = 'flex';
          const yPos = (progress + 1) / 1.5 * 100; // 0% to 100%
          noteEl.style.top = yPos + '%';
        }

        // Auto-miss
        if (timeDiff > tolerance && !beat.hit && !beat.missed) {
          beat.missed = true;
          misses++;
          noteEl.classList.add('rhythm-note-miss');
          
          if (misses > Math.floor(config.beats * 0.4)) {
            gameActive = false;
            statusEl.textContent = 'TOO MANY MISSES!';
            this.setTimeout(() => this.onLose(), 800);
            return;
          }
        }
      });

      // Check if all beats processed
      if (elapsed > pattern[pattern.length - 1].time + tolerance + 500) {
        gameActive = false;
        if (hits >= Math.ceil(config.beats * 0.6)) {
          statusEl.textContent = 'GREAT RHYTHM!';
          this.setTimeout(() => this.onWin(), 600);
        } else {
          statusEl.textContent = 'NOT ENOUGH HITS!';
          this.setTimeout(() => this.onLose(), 600);
        }
        return;
      }

      this.requestAnimationFrame(animate);
    };

    // Key handler
    const onKey = (e) => {
      if (!gameActive) return;
      const key = e.key.toUpperCase();
      if (!keys.includes(key)) return;

      const now = Date.now();
      const elapsed = now - startTime;

      // Find closest unhit beat for this key
      let closestBeat = null;
      let closestDist = Infinity;

      pattern.forEach((beat, i) => {
        if (beat.key === key && !beat.hit && !beat.missed) {
          const dist = Math.abs(elapsed - beat.time);
          if (dist < closestDist) {
            closestDist = dist;
            closestBeat = i;
          }
        }
      });

      // Flash the lane
      const zone = this.container.querySelector(`#rhythm-zone-${key}`);
      zone.classList.add('rhythm-zone-flash');
      this.setTimeout(() => zone.classList.remove('rhythm-zone-flash'), 150);

      if (closestBeat !== null && closestDist <= tolerance) {
        pattern[closestBeat].hit = true;
        hits++;
        scoreEl.textContent = `${hits} / ${config.beats}`;
        noteEls[closestBeat].classList.add('rhythm-note-hit');
      }
    };

    this.addEvent(document, 'keydown', onKey);

    this.setTimeout(() => {
      statusEl.textContent = 'GO!';
      this.requestAnimationFrame(animate);
    }, 800);
  }
}
