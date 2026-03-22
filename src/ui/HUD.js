import '../styles/hud.css';

const HEART_SVG = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;

export class HUD {
  constructor(gameState) {
    this.gameState = gameState;
    this.el = null;
    this.flashEl = null;
    this.heartsContainer = null;
    this.levelEl = null;
    this.sublevelDots = null;
    this.scoreEl = null;
  }

  render(parent) {
    this.el = document.createElement('div');
    this.el.className = 'hud hidden';
    this.el.innerHTML = `
      <div class="hud-lives" id="hud-lives"></div>
      <div class="hud-center">
        <div class="hud-level">LEVEL <span class="hud-level-number" id="hud-level-num">1</span></div>
        <div class="hud-sublevels" id="hud-sublevels">
          <div class="hud-sublevel-dot active"></div>
          <div class="hud-sublevel-dot"></div>
          <div class="hud-sublevel-dot"></div>
        </div>
      </div>
      <div class="hud-score" id="hud-score">SCORE <span>0</span></div>
    `;
    parent.appendChild(this.el);

    this.flashEl = document.createElement('div');
    this.flashEl.className = 'hud-flash';
    parent.appendChild(this.flashEl);

    this.heartsContainer = this.el.querySelector('#hud-lives');
    this.levelEl = this.el.querySelector('#hud-level-num');
    this.sublevelDots = this.el.querySelector('#hud-sublevels');
    this.scoreEl = this.el.querySelector('#hud-score span');

    this._renderHearts(5);
    this._bindEvents();
  }

  show() { this.el.classList.remove('hidden'); }
  hide() { this.el.classList.add('hidden'); }

  _renderHearts(lives) {
    this.heartsContainer.innerHTML = '';
    for (let i = 0; i < 5; i++) {
      const heart = document.createElement('div');
      heart.className = `hud-heart ${i >= lives ? 'empty' : ''}`;
      heart.innerHTML = HEART_SVG;
      this.heartsContainer.appendChild(heart);
    }
  }

  _updateSublevels(current) {
    this.sublevelDots.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const dot = document.createElement('div');
      dot.className = 'hud-sublevel-dot';
      if (i < current) dot.classList.add('complete');
      if (i === current) dot.classList.add('active');
      this.sublevelDots.appendChild(dot);
    }
  }

  _flashScreen() {
    this.flashEl.classList.add('active');
    setTimeout(() => this.flashEl.classList.remove('active'), 400);
  }

  _bindEvents() {
    this.gameState.on('stateChange', (state) => {
      this.levelEl.textContent = state.currentLevel;
      this._updateSublevels(state.currentSublevel);
      this.scoreEl.textContent = state.score.toLocaleString();
    });

    this.gameState.on('lifeLost', (lives) => {
      this._renderHearts(lives);
      this._flashScreen();
      // Animate the lost heart
      const hearts = this.heartsContainer.querySelectorAll('.hud-heart');
      if (hearts[lives]) {
        hearts[lives].classList.add('lost');
      }
    });

    this.gameState.on('reset', () => {
      this._renderHearts(5);
      this.levelEl.textContent = '1';
      this._updateSublevels(1);
      this.scoreEl.textContent = '0';
    });
  }
}
