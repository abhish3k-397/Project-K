import { BaseLevel } from '../BaseLevel.js';
import './style.css';

/**
 * Level 13 — Tile Slide
 * Solve a sliding puzzle (15-puzzle variant).
 * Wabi-sabi aesthetic — earth tones, cracked ceramic, imperfect.
 */
export class TileSlide extends BaseLevel {
  async init(container, sublevel, callbacks) {
    await super.init(container, sublevel, callbacks);

    const config = this.getConfig([
      { size: 3, timed: false, moveLimit: Infinity },
      { size: 4, timed: false, moveLimit: Infinity },
      { size: 4, timed: true, timeLimit: 120000, moveLimit: 80 }
    ]);

    const totalTiles = config.size * config.size;
    const tiles = this._generatePuzzle(config.size);
    let emptyIdx = tiles.indexOf(0);
    let moves = 0;

    this.container.innerHTML = `
      <div class="slide-level">
        <div class="slide-texture"></div>
        <div class="slide-header">
          <span class="slide-label">ARRANGE IN ORDER</span>
          <span class="slide-moves" id="slide-moves">Moves: 0${config.moveLimit < Infinity ? ` / ${config.moveLimit}` : ''}</span>
        </div>
        ${config.timed ? '<div class="slide-timer-wrap" id="slide-timer-wrap"></div>' : ''}
        <div class="slide-grid" id="slide-grid" style="grid-template-columns: repeat(${config.size}, 1fr)">
          ${tiles.map((t, i) => `
            <button class="slide-tile ${t === 0 ? 'slide-empty' : ''}" data-idx="${i}" data-val="${t}" id="slide-tile-${i}">
              ${t === 0 ? '' : t}
            </button>
          `).join('')}
        </div>
      </div>
    `;

    const gridEl = this.container.querySelector('#slide-grid');
    const movesEl = this.container.querySelector('#slide-moves');
    let gameOver = false;

    // Timer for sublevel 3
    if (config.timed) {
      const timerWrap = this.container.querySelector('#slide-timer-wrap');
      const timer = this.createTimer(config.timeLimit, () => {
        gameOver = true;
        this.setTimeout(() => this.onLose(), 500);
      });
      timerWrap.appendChild(timer.el);
      timer.start();
    }

    // Tile click handler
    gridEl.querySelectorAll('.slide-tile').forEach(tile => {
      this.addEvent(tile, 'click', () => {
        if (gameOver) return;
        const idx = parseInt(tile.dataset.idx);
        if (!this._isAdjacent(idx, emptyIdx, config.size)) return;

        // Swap
        [tiles[idx], tiles[emptyIdx]] = [tiles[emptyIdx], tiles[idx]];
        const oldEmpty = emptyIdx;
        emptyIdx = idx;
        moves++;

        movesEl.textContent = `Moves: ${moves}${config.moveLimit < Infinity ? ` / ${config.moveLimit}` : ''}`;

        // Update DOM
        this._renderTiles(gridEl, tiles, config.size);

        // Check move limit
        if (moves >= config.moveLimit) {
          if (!this._isSolved(tiles)) {
            gameOver = true;
            this.setTimeout(() => this.onLose(), 500);
            return;
          }
        }

        // Check win
        if (this._isSolved(tiles)) {
          gameOver = true;
          gridEl.classList.add('slide-solved');
          this.setTimeout(() => this.onWin(), 600);
        }
      });
    });
  }

  _generatePuzzle(size) {
    const total = size * size;
    const tiles = Array.from({ length: total }, (_, i) => i); // 0 = empty
    
    // Shuffle by making random valid moves (ensures solvability)
    let emptyIdx = 0;
    const shuffleMoves = size * size * 20;
    for (let m = 0; m < shuffleMoves; m++) {
      const neighbors = this._getAdjacent(emptyIdx, size);
      const randNeighbor = neighbors[Math.floor(Math.random() * neighbors.length)];
      [tiles[emptyIdx], tiles[randNeighbor]] = [tiles[randNeighbor], tiles[emptyIdx]];
      emptyIdx = randNeighbor;
    }
    
    return tiles;
  }

  _getAdjacent(idx, size) {
    const row = Math.floor(idx / size);
    const col = idx % size;
    const adj = [];
    if (row > 0) adj.push(idx - size);
    if (row < size - 1) adj.push(idx + size);
    if (col > 0) adj.push(idx - 1);
    if (col < size - 1) adj.push(idx + 1);
    return adj;
  }

  _isAdjacent(idx1, idx2, size) {
    return this._getAdjacent(idx1, size).includes(idx2);
  }

  _isSolved(tiles) {
    for (let i = 0; i < tiles.length - 1; i++) {
      if (tiles[i] !== i + 1) return false;
    }
    return tiles[tiles.length - 1] === 0;
  }

  _renderTiles(gridEl, tiles, size) {
    const buttons = gridEl.querySelectorAll('.slide-tile');
    buttons.forEach((btn, i) => {
      btn.dataset.val = tiles[i];
      btn.textContent = tiles[i] === 0 ? '' : tiles[i];
      btn.classList.toggle('slide-empty', tiles[i] === 0);
    });
  }
}
