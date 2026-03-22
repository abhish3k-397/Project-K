import { BaseLevel } from '../BaseLevel.js';
import './style.css';

/**
 * Level 3 — Maze Runner
 * Navigate arrow keys through a procedurally generated maze.
 * Neon brutalist aesthetic — black, hot pink, glitch effects.
 */
export class MazeRunner extends BaseLevel {
  async init(container, sublevel, callbacks) {
    await super.init(container, sublevel, callbacks);

    const config = this.getConfig([
      { size: 8, fogOfWar: false },
      { size: 12, fogOfWar: false },
      { size: 16, fogOfWar: true }
    ]);

    const maze = this._generateMaze(config.size, config.size);
    const cellSize = Math.min(Math.floor(500 / config.size), 40);
    
    let playerX = 0, playerY = 0;
    const endX = config.size - 1, endY = config.size - 1;

    this.container.innerHTML = `
      <div class="maze-level">
        <div class="maze-scanlines"></div>
        <div class="maze-header">
          <span class="maze-label">LEVEL 03 — MAZE RUNNER</span>
          <span class="maze-size">${config.size}×${config.size}</span>
        </div>
        <div class="maze-instructions">Use arrow keys / WASD to move</div>
        <div class="maze-container" id="maze-container" style="width:${config.size * cellSize}px;height:${config.size * cellSize}px">
          <canvas id="maze-canvas" width="${config.size * cellSize}" height="${config.size * cellSize}"></canvas>
          <div class="maze-player" id="maze-player" style="width:${cellSize-6}px;height:${cellSize-6}px;left:3px;top:3px"></div>
          <div class="maze-end" id="maze-end" style="width:${cellSize-6}px;height:${cellSize-6}px;left:${endX*cellSize+3}px;top:${endY*cellSize+3}px"></div>
          ${config.fogOfWar ? '<div class="maze-fog" id="maze-fog"></div>' : ''}
        </div>
      </div>
    `;

    const canvas = this.container.querySelector('#maze-canvas');
    const ctx = canvas.getContext('2d');
    const playerEl = this.container.querySelector('#maze-player');
    const fogEl = config.fogOfWar ? this.container.querySelector('#maze-fog') : null;

    // Draw maze
    this._drawMaze(ctx, maze, config.size, config.size, cellSize);

    // Update player position
    const updatePlayer = () => {
      playerEl.style.left = (playerX * cellSize + 3) + 'px';
      playerEl.style.top = (playerY * cellSize + 3) + 'px';
      if (fogEl) {
        fogEl.style.background = `radial-gradient(circle ${cellSize * 2.5}px at ${playerX * cellSize + cellSize/2}px ${playerY * cellSize + cellSize/2}px, transparent 0%, rgba(0,0,0,0.97) 100%)`;
      }
    };
    updatePlayer();

    // Key handler
    let won = false;
    const onKey = (e) => {
      if (won) return;
      let dx = 0, dy = 0;
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') dy = -1;
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') dy = 1;
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') dx = -1;
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') dx = 1;
      else return;

      e.preventDefault();
      const cell = maze[playerY][playerX];
      const newX = playerX + dx, newY = playerY + dy;
      
      // Check walls
      if (dx === -1 && cell.walls.left) return;
      if (dx === 1 && cell.walls.right) return;
      if (dy === -1 && cell.walls.top) return;
      if (dy === 1 && cell.walls.bottom) return;

      playerX = newX;
      playerY = newY;
      updatePlayer();

      if (playerX === endX && playerY === endY) {
        won = true;
        playerEl.classList.add('maze-player-win');
        this.setTimeout(() => this.onWin(), 600);
      }
    };

    this.addEvent(document, 'keydown', onKey);
  }

  _generateMaze(width, height) {
    // Create grid
    const grid = [];
    for (let y = 0; y < height; y++) {
      grid[y] = [];
      for (let x = 0; x < width; x++) {
        grid[y][x] = { visited: false, walls: { top: true, right: true, bottom: true, left: true } };
      }
    }

    // Recursive backtracking
    const stack = [];
    const start = grid[0][0];
    start.visited = true;
    stack.push({ x: 0, y: 0 });

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = [];
      const dirs = [
        { dx: 0, dy: -1, wall: 'top', opposite: 'bottom' },
        { dx: 1, dy: 0, wall: 'right', opposite: 'left' },
        { dx: 0, dy: 1, wall: 'bottom', opposite: 'top' },
        { dx: -1, dy: 0, wall: 'left', opposite: 'right' }
      ];

      for (const dir of dirs) {
        const nx = current.x + dir.dx;
        const ny = current.y + dir.dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height && !grid[ny][nx].visited) {
          neighbors.push({ x: nx, y: ny, dir });
        }
      }

      if (neighbors.length > 0) {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        grid[current.y][current.x].walls[next.dir.wall] = false;
        grid[next.y][next.x].walls[next.dir.opposite] = false;
        grid[next.y][next.x].visited = true;
        stack.push({ x: next.x, y: next.y });
      } else {
        stack.pop();
      }
    }

    return grid;
  }

  _drawMaze(ctx, maze, width, height, cellSize) {
    ctx.strokeStyle = '#ff2d6f';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#ff2d6f';
    ctx.shadowBlur = 4;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cell = maze[y][x];
        const px = x * cellSize, py = y * cellSize;
        if (cell.walls.top) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + cellSize, py); ctx.stroke(); }
        if (cell.walls.right) { ctx.beginPath(); ctx.moveTo(px + cellSize, py); ctx.lineTo(px + cellSize, py + cellSize); ctx.stroke(); }
        if (cell.walls.bottom) { ctx.beginPath(); ctx.moveTo(px, py + cellSize); ctx.lineTo(px + cellSize, py + cellSize); ctx.stroke(); }
        if (cell.walls.left) { ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + cellSize); ctx.stroke(); }
      }
    }
  }
}
