import { BaseLevel } from '../BaseLevel.js';
import './style.css';

/**
 * Level 12 — Code Breaker
 * Guess a number combination with clues (Mastermind-style).
 * Terminal aesthetic — green on black, CRT scanlines.
 */
export class CodeBreaker extends BaseLevel {
  async init(container, sublevel, callbacks) {
    await super.init(container, sublevel, callbacks);

    const config = this.getConfig([
      { digits: 3, range: 6, maxGuesses: 8 },
      { digits: 4, range: 8, maxGuesses: 8 },
      { digits: 5, range: 10, maxGuesses: 10 }
    ]);

    // Generate secret code
    const secret = [];
    for (let i = 0; i < config.digits; i++) {
      secret.push(Math.floor(Math.random() * config.range));
    }

    let guessCount = 0;

    this.container.innerHTML = `
      <div class="code-level">
        <div class="code-scanlines"></div>
        <div class="code-header">
          <div class="code-prompt">&gt; CRACK THE ${config.digits}-DIGIT CODE</div>
          <div class="code-info">DIGITS: 0-${config.range - 1} | GUESSES: <span id="code-guesses">${config.maxGuesses}</span></div>
        </div>
        <div class="code-legend">
          <span class="code-legend-item">🟢 = correct position</span>
          <span class="code-legend-item">🟡 = wrong position</span>
          <span class="code-legend-item">⚫ = not in code</span>
        </div>
        <div class="code-history" id="code-history"></div>
        <div class="code-input-row">
          ${Array(config.digits).fill(0).map((_, i) => `
            <input type="number" min="0" max="${config.range - 1}" class="code-digit-input" id="code-input-${i}" />
          `).join('')}
          <button class="code-submit" id="code-submit">&gt; SUBMIT</button>
        </div>
        <div class="code-status" id="code-status"></div>
      </div>
    `;

    const historyEl = this.container.querySelector('#code-history');
    const guessesEl = this.container.querySelector('#code-guesses');
    const statusEl = this.container.querySelector('#code-status');
    const inputs = this.container.querySelectorAll('.code-digit-input');
    const submitBtn = this.container.querySelector('#code-submit');
    let gameOver = false;

    // Focus first input
    inputs[0].focus();

    // Auto-tab between inputs
    inputs.forEach((inp, i) => {
      this.addEvent(inp, 'input', () => {
        const val = inp.value;
        if (val.length > 0 && i < inputs.length - 1) {
          inputs[i + 1].focus();
        }
      });
      this.addEvent(inp, 'keydown', (e) => {
        if (e.key === 'Backspace' && inp.value === '' && i > 0) {
          inputs[i - 1].focus();
        }
        if (e.key === 'Enter') {
          submitGuess();
        }
      });
    });

    const submitGuess = () => {
      if (gameOver) return;

      const guess = [];
      for (const inp of inputs) {
        const val = parseInt(inp.value);
        if (isNaN(val) || val < 0 || val >= config.range) return;
        guess.push(val);
      }

      guessCount++;
      guessesEl.textContent = config.maxGuesses - guessCount;

      // Evaluate
      const result = this._evaluate(guess, secret);
      
      // Add to history
      const row = document.createElement('div');
      row.className = 'code-history-row';
      row.innerHTML = `
        <span class="code-guess-num">#${guessCount}</span>
        <span class="code-guess-digits">${guess.join(' ')}</span>
        <span class="code-guess-result">${result.exact}🟢 ${result.partial}🟡 ${result.wrong}⚫</span>
      `;
      historyEl.appendChild(row);
      historyEl.scrollTop = historyEl.scrollHeight;

      // Clear inputs
      inputs.forEach(inp => inp.value = '');
      inputs[0].focus();

      // Check win
      if (result.exact === config.digits) {
        gameOver = true;
        statusEl.textContent = '> ACCESS GRANTED';
        statusEl.classList.add('code-status-win');
        this.setTimeout(() => this.onWin(), 800);
        return;
      }

      // Check lose
      if (guessCount >= config.maxGuesses) {
        gameOver = true;
        statusEl.textContent = `> ACCESS DENIED — CODE WAS: ${secret.join(' ')}`;
        statusEl.classList.add('code-status-fail');
        this.setTimeout(() => this.onLose(), 1200);
      }
    };

    this.addEvent(submitBtn, 'click', submitGuess);
  }

  _evaluate(guess, secret) {
    let exact = 0, partial = 0;
    const secretCopy = [...secret];
    const guessCopy = [...guess];

    // Exact matches first
    for (let i = 0; i < guess.length; i++) {
      if (guessCopy[i] === secretCopy[i]) {
        exact++;
        secretCopy[i] = -1;
        guessCopy[i] = -2;
      }
    }

    // Partial matches
    for (let i = 0; i < guessCopy.length; i++) {
      if (guessCopy[i] === -2) continue;
      const idx = secretCopy.indexOf(guessCopy[i]);
      if (idx !== -1) {
        partial++;
        secretCopy[idx] = -1;
      }
    }

    return { exact, partial, wrong: guess.length - exact - partial };
  }
}
