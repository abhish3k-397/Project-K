/**
 * MenuScreen — Start screen and game-over screen.
 */
export class MenuScreen {
  constructor() {
    this.el = null;
    this.onStart = null;
    this.onRestart = null;
  }

  render(parent) {
    this.el = document.createElement('div');
    this.el.className = 'screen active';
    this.el.id = 'menu-screen';
    parent.appendChild(this.el);
    this.showStart();
  }

  showStart() {
    this.el.className = 'screen active';
    this.el.innerHTML = `
      <div class="particles-bg" id="menu-particles"></div>
      <div class="menu-content" style="position:relative;z-index:1;text-align:center;">
        <div class="menu-badge">THE</div>
        <h1 class="menu-title">
          <span class="menu-title-num">1000</span>
        </h1>
        <p class="menu-subtitle">One thousand levels. Five lives. No mercy.</p>
        <div class="menu-rules">
          <div class="menu-rule"><span class="menu-rule-icon">🎮</span> Each level brings a new challenge</div>
          <div class="menu-rule"><span class="menu-rule-icon">📈</span> 3 sublevels of increasing difficulty</div>
          <div class="menu-rule"><span class="menu-rule-icon">💀</span> 5 lives — lose them all, start over</div>
        </div>
        <button class="btn btn-primary menu-start-btn" id="btn-start">BEGIN</button>
        <div class="menu-footer">How far can you go?</div>
      </div>
    `;
    this._spawnParticles();
    const btn = this.el.querySelector('#btn-start');
    btn.addEventListener('click', () => {
      if (this.onStart) this.onStart();
    });
  }

  showGameOver(stats) {
    this.el.className = 'screen active';
    this.el.innerHTML = `
      <div class="particles-bg" id="menu-particles"></div>
      <div class="menu-content gameover-content" style="position:relative;z-index:1;text-align:center;">
        <div class="gameover-skull">💀</div>
        <h1 class="gameover-title">GAME OVER</h1>
        <div class="gameover-stats">
          <div class="gameover-stat">
            <div class="gameover-stat-value">${stats.levelReached || 1}</div>
            <div class="gameover-stat-label">Level Reached</div>
          </div>
          <div class="gameover-stat">
            <div class="gameover-stat-value">${stats.totalSublevelsCleared || 0}</div>
            <div class="gameover-stat-label">Sublevels Cleared</div>
          </div>
          <div class="gameover-stat">
            <div class="gameover-stat-value">${(stats.score || 0).toLocaleString()}</div>
            <div class="gameover-stat-label">Score</div>
          </div>
        </div>
        <button class="btn btn-primary menu-start-btn" id="btn-restart">TRY AGAIN</button>
        <div class="menu-footer">Back to Level 1.</div>
      </div>
    `;
    this._spawnParticles();
    const btn = this.el.querySelector('#btn-restart');
    btn.addEventListener('click', () => {
      if (this.onRestart) this.onRestart();
    });
  }

  hide() {
    this.el.classList.remove('active');
  }

  show() {
    this.el.classList.add('active');
  }

  _spawnParticles() {
    const container = this.el.querySelector('#menu-particles');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.top = Math.random() * 100 + '%';
      p.style.animationDelay = Math.random() * 6 + 's';
      p.style.animationDuration = (4 + Math.random() * 4) + 's';
      p.style.width = (1 + Math.random() * 3) + 'px';
      p.style.height = p.style.width;
      p.style.opacity = 0.2 + Math.random() * 0.5;
      container.appendChild(p);
    }
  }
}
