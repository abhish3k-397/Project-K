import { BaseLevel } from '../BaseLevel.js';
import './style.css';

/**
 * Level 8 — Gravity Dodge
 * Move a ball left/right to avoid falling obstacles.
 * Space aesthetic — starfield parallax, nebula colors.
 */
export class GravityDodge extends BaseLevel {
  async init(container, sublevel, callbacks) {
    await super.init(container, sublevel, callbacks);

    const config = this.getConfig([
      { speed: 2.5, gapWidth: 0.4, spawnRate: 1400, wind: false, surviveTime: 10000 },
      { speed: 3.5, gapWidth: 0.35, spawnRate: 1100, wind: false, surviveTime: 12000 },
      { speed: 4.2, gapWidth: 0.3, spawnRate: 900, wind: true, surviveTime: 15000 }
    ]);

    this.container.innerHTML = `
      <div class="dodge-level">
        <div class="dodge-stars" id="dodge-stars"></div>
        <div class="dodge-nebula"></div>
        <div class="dodge-timer" id="dodge-timer">SURVIVE: <span id="dodge-time">${(config.surviveTime/1000).toFixed(1)}</span>s</div>
        <div class="dodge-arena" id="dodge-arena">
          <div class="dodge-player" id="dodge-player"></div>
        </div>
        <div class="dodge-instructions">Move MOUSE or use ← → / A D keys</div>
      </div>
    `;

    // Spawn stars
    const starsEl = this.container.querySelector('#dodge-stars');
    for (let i = 0; i < 60; i++) {
      const star = document.createElement('div');
      star.className = 'dodge-star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.width = (1 + Math.random() * 2) + 'px';
      star.style.height = star.style.width;
      star.style.animationDelay = Math.random() * 3 + 's';
      starsEl.appendChild(star);
    }

    const arena = this.container.querySelector('#dodge-arena');
    const player = this.container.querySelector('#dodge-player');
    const timeEl = this.container.querySelector('#dodge-time');
    const arenaRect = { width: 500, height: 400 };
    
    let playerX = 0.5; // 0-1 normalized
    let playerW = 0.06;
    let moveLeft = false, moveRight = false;
    let gameActive = true;
    let obstacles = [];
    let windOffset = 0;

    // Key handlers
    const onKeyDown = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { moveLeft = true; e.preventDefault(); }
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { moveRight = true; e.preventDefault(); }
    };
    const onKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') moveLeft = false;
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') moveRight = false;
    };
    this.addEvent(document, 'keydown', onKeyDown);
    this.addEvent(document, 'keyup', onKeyUp);

    // Mouse handler
    this.addEvent(arena, 'mousemove', (e) => {
      const rect = arena.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      playerX = Math.max(playerW / 2, Math.min(1 - playerW / 2, x));
    });

    // Spawn obstacles
    const spawnObstacle = () => {
      if (!gameActive) return;
      const gapStart = Math.random() * (1 - config.gapWidth);
      const obs = {
        y: -0.05,
        gapStart,
        gapEnd: gapStart + config.gapWidth,
        el: document.createElement('div')
      };
      obs.el.className = 'dodge-obstacle';
      // Left part
      const left = document.createElement('div');
      left.className = 'dodge-obs-part';
      left.style.left = '0';
      left.style.width = (gapStart * 100) + '%';
      obs.el.appendChild(left);
      // Right part
      const right = document.createElement('div');
      right.className = 'dodge-obs-part';
      right.style.left = (obs.gapEnd * 100) + '%';
      right.style.width = ((1 - obs.gapEnd) * 100) + '%';
      obs.el.appendChild(right);
      
      arena.appendChild(obs.el);
      obstacles.push(obs);

      this.setTimeout(spawnObstacle, config.spawnRate);
    };

    // Game loop
    const startTime = Date.now();
    const gameLoop = () => {
      if (!gameActive) return;

      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, config.surviveTime - elapsed);
      timeEl.textContent = (remaining / 1000).toFixed(1);

      // Win condition
      if (remaining <= 0) {
        gameActive = false;
        player.classList.add('dodge-player-win');
        this.setTimeout(() => this.onWin(), 600);
        return;
      }

      // Move player
      const moveSpeed = 0.018;
      if (moveLeft) playerX = Math.max(playerW / 2, playerX - moveSpeed);
      if (moveRight) playerX = Math.min(1 - playerW / 2, playerX + moveSpeed);

      // Wind effect
      // Wind effect (reduced intensity)
      if (config.wind) {
        windOffset = Math.sin(elapsed * 0.0015) * 0.0012;
        playerX = Math.max(playerW / 2, Math.min(1 - playerW / 2, playerX + windOffset));
      }

      player.style.left = ((playerX - playerW / 2) * 100) + '%';
      player.style.width = (playerW * 100) + '%';

      // Move obstacles
      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i];
        obs.y += config.speed * 0.003;
        obs.el.style.top = (obs.y * 100) + '%';

        // Collision check (when obstacle reaches player Y ~0.9)
        if (obs.y > 0.88 && obs.y < 0.96) {
          const playerLeft = playerX - playerW / 2;
          const playerRight = playerX + playerW / 2;
          if (playerLeft < obs.gapStart || playerRight > obs.gapEnd) {
            // Check if NOT in the gap
            if (!(playerLeft >= obs.gapStart && playerRight <= obs.gapEnd)) {
              gameActive = false;
              player.classList.add('dodge-player-hit');
              this.setTimeout(() => this.onLose(), 600);
              return;
            }
          }
        }

        // Remove off-screen
        if (obs.y > 1.1) {
          obs.el.remove();
          obstacles.splice(i, 1);
        }
      }

      this.requestAnimationFrame(gameLoop);
    };

    // Position player at bottom
    player.style.bottom = '4%';
    player.style.left = ((playerX - playerW / 2) * 100) + '%';
    player.style.width = (playerW * 100) + '%';

    this.setTimeout(spawnObstacle, 1000);
    this.requestAnimationFrame(gameLoop);
  }
}
