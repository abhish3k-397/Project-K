import { BaseLevel } from '../BaseLevel.js';
import './style.css';

/**
 * Level 1 — Color Match
 * Click the tile matching the shown color.
 * Zen garden aesthetic — cream, sage, soft shadows.
 */
export class ColorMatch extends BaseLevel {
  async init(container, sublevel, callbacks) {
    await super.init(container, sublevel, callbacks);

    const config = this.getConfig([
      { tiles: 4, time: 5000, cols: 2 },
      { tiles: 6, time: 4000, cols: 3 },
      { tiles: 9, time: 3000, cols: 3 }
    ]);

    const COLORS = [
      { name: 'Sage', hex: '#87A878' },
      { name: 'Terracotta', hex: '#C4675C' },
      { name: 'Sand', hex: '#D4B896' },
      { name: 'Sky', hex: '#7BA7BC' },
      { name: 'Plum', hex: '#8B6F8E' },
      { name: 'Amber', hex: '#D4A44C' },
      { name: 'Slate', hex: '#6B7F8E' },
      { name: 'Rose', hex: '#C48B8B' },
      { name: 'Moss', hex: '#6A7F5A' }
    ];

    // Pick colors for tiles
    const shuffled = [...COLORS].sort(() => Math.random() - 0.5);
    const tileColors = shuffled.slice(0, config.tiles);
    const targetColor = tileColors[Math.floor(Math.random() * tileColors.length)];

    // Shuffle tile order
    const displayColors = [...tileColors].sort(() => Math.random() - 0.5);

    this.container.innerHTML = `
      <div class="color-match-level">
        <div class="cm-target">
          <div class="cm-target-label">MATCH THIS COLOR</div>
          <div class="cm-target-swatch" style="background:${targetColor.hex}"></div>
          <div class="cm-target-name">${targetColor.name}</div>
        </div>
        <div class="cm-timer-wrap"></div>
        <div class="cm-grid" style="grid-template-columns: repeat(${config.cols}, 1fr)">
          ${displayColors.map((c, i) => `
            <button class="cm-tile" data-color="${c.name}" style="background:${c.hex}" id="cm-tile-${i}">
              <span class="cm-tile-name">${c.name}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;

    // Timer
    const timerWrap = this.container.querySelector('.cm-timer-wrap');
    const timer = this.createTimer(config.time, () => {
      this.onLose();
    });
    timerWrap.appendChild(timer.el);

    // Tile clicks
    let answered = false;
    this.container.querySelectorAll('.cm-tile').forEach(tile => {
      this.addEvent(tile, 'click', () => {
        if (answered) return;
        answered = true;
        timer.stop();

        if (tile.dataset.color === targetColor.name) {
          tile.classList.add('cm-correct');
          this.setTimeout(() => this.onWin(), 600);
        } else {
          tile.classList.add('cm-wrong');
          // Highlight correct one
          this.container.querySelectorAll('.cm-tile').forEach(t => {
            if (t.dataset.color === targetColor.name) t.classList.add('cm-correct');
          });
          this.setTimeout(() => this.onLose(), 800);
        }
      });
    });

    // Start timer
    timer.start();
  }
}
