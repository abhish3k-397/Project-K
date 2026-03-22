/**
 * CompletionScreen — Celebration screens for sublevel-clear and level-clear.
 * Features confetti bursts, animated score counters, progress rings, and dramatic reveals.
 */
export class CompletionScreen {
  constructor() {
    this.el = null;
    this.timeout = null;
    this.particles = [];
    this.animFrame = null;
    this.canvas = null;
    this.ctx = null;
  }

  render(parent) {
    this.el = document.createElement('div');
    this.el.className = 'screen';
    this.el.id = 'completion-screen';
    parent.appendChild(this.el);
  }

  /**
   * Show sublevel-complete celebration.
   * Shorter, punchier — checkmark burst, score flash, progress dots.
   */
  showSublevelComplete({ level, sublevelCleared, score, lives }, callback) {
    if (this.timeout) clearTimeout(this.timeout);
    this._stopParticles();

    const bonusPoints = 100 * level * sublevelCleared;
    const difficultyLabels = ['', 'Normal', 'Hard', 'Brutal'];

    this.el.innerHTML = `
      <canvas class="comp-particles" id="comp-canvas"></canvas>
      <div class="comp-content comp-sublevel">
        <div class="comp-burst-ring"></div>
        <div class="comp-checkmark-wrap">
          <svg class="comp-checkmark" viewBox="0 0 52 52">
            <circle class="comp-checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
            <path class="comp-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
          </svg>
        </div>
        <div class="comp-cleared-label">CLEARED</div>
        <div class="comp-sub-info">
          <span class="comp-sub-level">Level ${level}</span>
          <span class="comp-sub-sep">·</span>
          <span class="comp-sub-diff">${difficultyLabels[sublevelCleared]}</span>
        </div>
        <div class="comp-score-burst">
          <span class="comp-plus">+</span>
          <span class="comp-score-val" id="comp-score-counter">0</span>
        </div>
        <div class="comp-progress">
          ${[1, 2, 3].map(i => `
            <div class="comp-pip ${i <= sublevelCleared ? 'comp-pip-done' : ''} ${i === sublevelCleared ? 'comp-pip-current' : ''}">
              ${i <= sublevelCleared ? `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ` : `<span>${i}</span>`}
            </div>
          `).join('<div class="comp-pip-line"></div>')}
        </div>
        <div class="comp-next-hint">
          ${sublevelCleared < 3 
            ? `Next: <strong>${difficultyLabels[sublevelCleared + 1]}</strong>` 
            : `<strong>NEW LEVEL</strong> incoming...`}
        </div>
      </div>
    `;

    this.el.classList.add('active');
    this._initParticles('sublevel');
    this._animateScoreCounter('comp-score-counter', bonusPoints, 600);

    this.timeout = setTimeout(() => {
      this._fadeOut(() => {
        if (callback) callback();
      });
    }, 2400);
  }

  /**
   * Show level-complete celebration.
   * Bigger, grander — full confetti shower, level badge, stats card, radial glow.
   */
  showLevelComplete({ levelCleared, nextLevel, nextLevelName, nextLevelHint, totalScore, lives, sublevelsCleared }, callback) {
    if (this.timeout) clearTimeout(this.timeout);
    this._stopParticles();

    this.el.innerHTML = `
      <canvas class="comp-particles" id="comp-canvas"></canvas>
      <div class="comp-content comp-level">
        <div class="comp-level-glow"></div>
        <div class="comp-level-badge-wrap">
          <div class="comp-level-badge">
            <div class="comp-level-badge-ring"></div>
            <div class="comp-level-badge-inner">
              <span class="comp-level-badge-num">${levelCleared}</span>
            </div>
          </div>
          <div class="comp-level-crown">👑</div>
        </div>
        <div class="comp-level-title">LEVEL COMPLETE</div>
        <div class="comp-level-name-cleared">${this._getLevelName(levelCleared)}</div>
        
        <div class="comp-stats-card">
          <div class="comp-stat">
            <div class="comp-stat-icon">⭐</div>
            <div class="comp-stat-val" id="comp-total-score">0</div>
            <div class="comp-stat-label">Total Score</div>
          </div>
          <div class="comp-stat-divider"></div>
          <div class="comp-stat">
            <div class="comp-stat-icon">❤️</div>
            <div class="comp-stat-val">${lives}</div>
            <div class="comp-stat-label">Lives Left</div>
          </div>
          <div class="comp-stat-divider"></div>
          <div class="comp-stat">
            <div class="comp-stat-icon">✅</div>
            <div class="comp-stat-val">${sublevelsCleared}</div>
            <div class="comp-stat-label">Cleared</div>
          </div>
        </div>

        <div class="comp-next-level-preview">
          <div class="comp-next-label">UP NEXT</div>
          <div class="comp-next-num">LEVEL ${nextLevel}</div>
          <div class="comp-next-name">${nextLevelName}</div>
          <div class="comp-next-hint-text">${nextLevelHint}</div>
        </div>
      </div>
    `;

    this.el.classList.add('active');
    this._initParticles('level');
    this._animateScoreCounter('comp-total-score', totalScore, 800);

    this.timeout = setTimeout(() => {
      this._fadeOut(() => {
        if (callback) callback();
      });
    }, 4000);
  }

  hide() {
    this.el.classList.remove('active');
    this.el.classList.remove('comp-fading');
    this._stopParticles();
    if (this.timeout) clearTimeout(this.timeout);
  }

  // --- Confetti particle system ---
  _initParticles(type) {
    this.canvas = this.el.querySelector('#comp-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.particles = [];

    const count = type === 'level' ? 120 : 50;
    const colors = type === 'level'
      ? ['#6c63ff', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b', '#4ade80', '#38bdf8', '#ffffff']
      : ['#4ade80', '#6c63ff', '#38bdf8', '#a855f7', '#ffffff'];

    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.canvas.width * 0.5 + (Math.random() - 0.5) * 100,
        y: this.canvas.height * 0.4,
        vx: (Math.random() - 0.5) * (type === 'level' ? 16 : 10),
        vy: -(Math.random() * (type === 'level' ? 14 : 10) + 2),
        size: 3 + Math.random() * (type === 'level' ? 6 : 4),
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        gravity: 0.12 + Math.random() * 0.08,
        opacity: 1,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
        delay: Math.random() * 300
      });
    }

    const startTime = Date.now();
    const animate = () => {
      const now = Date.now();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      let alive = false;

      for (const p of this.particles) {
        if (now - startTime < p.delay) { alive = true; continue; }
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.rotation += p.rotSpeed;
        p.opacity = Math.max(0, p.opacity - 0.004);

        if (p.opacity > 0 && p.y < this.canvas.height + 20) {
          alive = true;
          this.ctx.save();
          this.ctx.translate(p.x, p.y);
          this.ctx.rotate(p.rotation * Math.PI / 180);
          this.ctx.globalAlpha = p.opacity;
          this.ctx.fillStyle = p.color;
          
          if (p.shape === 'rect') {
            this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
          } else {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
            this.ctx.fill();
          }
          this.ctx.restore();
        }
      }

      if (alive) {
        this.animFrame = requestAnimationFrame(animate);
      }
    };
    this.animFrame = requestAnimationFrame(animate);
  }

  _stopParticles() {
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
    this.particles = [];
  }

  _animateScoreCounter(elementId, target, duration) {
    const el = this.el.querySelector(`#${elementId}`);
    if (!el) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.floor(target * eased).toLocaleString();
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  _fadeOut(callback) {
    this.el.classList.add('comp-fading');
    setTimeout(() => {
      this.el.classList.remove('active');
      this.el.classList.remove('comp-fading');
      this._stopParticles();
      if (callback) callback();
    }, 500);
  }

  _getLevelName(level) {
    const names = {
      1: 'Color Match', 2: 'Sequence Memory', 3: 'Maze Runner',
      4: 'Math Blitz', 5: 'Word Scramble', 6: 'Reaction Test',
      7: 'Pattern Complete', 8: 'Gravity Dodge', 9: 'Light Switch',
      10: 'Rhythm Tap', 11: 'Tower Stack', 12: 'Code Breaker', 13: 'Tile Slide'
    };
    return names[level] || `Level ${level}`;
  }
}
