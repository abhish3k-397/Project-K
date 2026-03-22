import { BaseLevel } from '../BaseLevel.js';
import './style.css';

/**
 * Level 9 — Light Switch
 * Toggle lights; toggling one affects neighbors.
 * Noir aesthetic — high contrast B&W, film grain.
 */
export class LightSwitch extends BaseLevel {
  async init(container, sublevel, callbacks) {
    await super.init(container, sublevel, callbacks);

    const config = this.getConfig([
      { size: 3, locked: 0 },
      { size: 4, locked: 0 },
      { size: 5, locked: 3 }
    ]);

    // Generate solvable puzzle by starting from "all off" and doing random toggles
    const grid = Array(config.size).fill(null).map(() => Array(config.size).fill(false));
    const locked = new Set();

    // Random toggles to create puzzle
    const toggleCount = config.size * 2;
    for (let t = 0; t < toggleCount; t++) {
      const r = Math.floor(Math.random() * config.size);
      const c = Math.floor(Math.random() * config.size);
      this._toggle(grid, r, c, config.size, locked);
    }

    // Lock some cells for sublevel 3
    if (config.locked > 0) {
      while (locked.size < config.locked) {
        const r = Math.floor(Math.random() * config.size);
        const c = Math.floor(Math.random() * config.size);
        locked.add(`${r},${c}`);
      }
    }

    let moves = 0;

    this.container.innerHTML = `
      <div class="light-level">
        <div class="light-grain"></div>
        <div class="light-header">
          <div class="light-label">TURN ALL LIGHTS ON</div>
          <div class="light-moves" id="light-moves">MOVES: 0</div>
        </div>
        <div class="light-grid" id="light-grid" style="grid-template-columns: repeat(${config.size}, 1fr)">
          ${grid.map((row, r) => row.map((cell, c) => {
            const isLocked = locked.has(`${r},${c}`);
            return `<button class="light-cell ${cell ? 'light-on' : ''} ${isLocked ? 'light-locked' : ''}" 
                     data-r="${r}" data-c="${c}" id="light-${r}-${c}"
                     ${isLocked ? 'disabled' : ''}></button>`;
          }).join('')).join('')}
        </div>
      </div>
    `;

    const movesEl = this.container.querySelector('#light-moves');

    this.container.querySelectorAll('.light-cell:not(.light-locked)').forEach(cell => {
      this.addEvent(cell, 'click', () => {
        const r = parseInt(cell.dataset.r);
        const c = parseInt(cell.dataset.c);

        this._toggle(grid, r, c, config.size, locked);
        moves++;
        movesEl.textContent = `MOVES: ${moves}`;

        // Update visuals
        this._updateGrid(grid, config.size, locked);

        // Check win
        if (grid.every(row => row.every(cell => cell === true))) {
          this.setTimeout(() => this.onWin(), 500);
        }
      });
    });
  }

  _toggle(grid, r, c, size, locked) {
    const targets = [[r, c], [r-1, c], [r+1, c], [r, c-1], [r, c+1]];
    for (const [tr, tc] of targets) {
      if (tr >= 0 && tr < size && tc >= 0 && tc < size && !locked.has(`${tr},${tc}`)) {
        grid[tr][tc] = !grid[tr][tc];
      }
    }
  }

  _updateGrid(grid, size, locked) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const el = this.container.querySelector(`#light-${r}-${c}`);
        if (el) {
          el.classList.toggle('light-on', grid[r][c]);
        }
      }
    }
  }
}
