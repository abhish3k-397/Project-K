import { BaseLevel } from '../BaseLevel.js';
import './style.css';

/**
 * Level 2 — Sequence Memory
 * Repeat a flashing sequence of tiles.
 * Deep ocean aesthetic — dark navy, bioluminescent glows.
 */
export class SequenceMemory extends BaseLevel {
  async init(container, sublevel, callbacks) {
    await super.init(container, sublevel, callbacks);

    const config = this.getConfig([
      { steps: 3, flashDuration: 600, pauseBetween: 300, gridSize: 9 },
      { steps: 5, flashDuration: 450, pauseBetween: 250, gridSize: 9 },
      { steps: 7, flashDuration: 300, pauseBetween: 200, gridSize: 12 }
    ]);

    const cols = config.gridSize === 12 ? 4 : 3;

    this.container.innerHTML = `
      <div class="seq-mem-level">
        <div class="seq-bubbles" id="seq-bubbles"></div>
        <div class="seq-status" id="seq-status">WATCH CAREFULLY</div>
        <div class="seq-counter" id="seq-counter"></div>
        <div class="seq-grid" style="grid-template-columns: repeat(${cols}, 1fr)" id="seq-grid">
          ${Array(config.gridSize).fill(0).map((_, i) => `
            <button class="seq-tile" data-idx="${i}" id="seq-tile-${i}"></button>
          `).join('')}
        </div>
      </div>
    `;

    // Spawn bubbles
    const bubblesEl = this.container.querySelector('#seq-bubbles');
    for (let i = 0; i < 20; i++) {
      const b = document.createElement('div');
      b.className = 'seq-bubble';
      b.style.left = Math.random() * 100 + '%';
      b.style.animationDelay = Math.random() * 8 + 's';
      b.style.animationDuration = (6 + Math.random() * 8) + 's';
      b.style.width = (3 + Math.random() * 8) + 'px';
      b.style.height = b.style.width;
      bubblesEl.appendChild(b);
    }

    const statusEl = this.container.querySelector('#seq-status');
    const counterEl = this.container.querySelector('#seq-counter');
    const tiles = this.container.querySelectorAll('.seq-tile');

    // Generate sequence
    const sequence = [];
    for (let i = 0; i < config.steps; i++) {
      let next;
      do { next = Math.floor(Math.random() * config.gridSize); }
      while (sequence.length > 0 && sequence[sequence.length - 1] === next);
      sequence.push(next);
    }

    // Play sequence
    let inputEnabled = false;
    let playerIndex = 0;

    const playSequence = async () => {
      inputEnabled = false;
      statusEl.textContent = 'WATCH CAREFULLY';
      counterEl.textContent = `${config.steps} steps`;

      for (let i = 0; i < sequence.length; i++) {
        await this._wait(config.pauseBetween);
        tiles[sequence[i]].classList.add('seq-active');
        await this._wait(config.flashDuration);
        tiles[sequence[i]].classList.remove('seq-active');
      }

      await this._wait(300);
      statusEl.textContent = 'YOUR TURN';
      counterEl.textContent = `0 / ${config.steps}`;
      inputEnabled = true;
    };

    // Handle tile clicks
    tiles.forEach(tile => {
      this.addEvent(tile, 'click', () => {
        if (!inputEnabled) return;
        const idx = parseInt(tile.dataset.idx);

        tile.classList.add('seq-pressed');
        this.setTimeout(() => tile.classList.remove('seq-pressed'), 200);

        if (idx === sequence[playerIndex]) {
          playerIndex++;
          counterEl.textContent = `${playerIndex} / ${config.steps}`;

          if (playerIndex >= sequence.length) {
            inputEnabled = false;
            statusEl.textContent = 'PERFECT!';
            tiles.forEach(t => t.classList.add('seq-success'));
            this.setTimeout(() => this.onWin(), 800);
          }
        } else {
          inputEnabled = false;
          tile.classList.add('seq-wrong');
          statusEl.textContent = 'WRONG!';
          // Show correct sequence
          sequence.forEach((s, i) => {
            this.setTimeout(() => {
              tiles[s].classList.add('seq-reveal');
            }, i * 100);
          });
          this.setTimeout(() => this.onLose(), 1000);
        }
      });
    });

    this.setTimeout(() => playSequence(), 800);
  }

  _wait(ms) {
    return new Promise(resolve => {
      this.setTimeout(resolve, ms);
    });
  }
}
