import { BaseLevel } from '../BaseLevel.js';
import './style.css';

/**
 * Level 5 — Word Scramble
 * Unscramble a word.
 * Typewriter aesthetic — sepia, monospace, paper texture.
 */
const WORDS = {
  4: ['GAME','FIRE','MOON','STAR','WIND','LAKE','RAIN','DUST','JUMP','MAZE','CODE','PLAY','COOL','WAVE','ZOOM','DARK','GLOW','RING','SPIN','FLIP'],
  6: ['ROCKET','PLANET','SWITCH','PUZZLE','BRIDGE','CASTLE','FOREST','GARDEN','SHADOW','BEACON','CIPHER','MATRIX','FROZEN','DANGER','WONDER'],
  8: ['TREASURE','CHAMPION','INFINITE','MOUNTAIN','DISCOVER','EXPLORER','GUARDIAN','MIDNIGHT','CROSSBOW','FIREBALL']
};

export class WordScramble extends BaseLevel {
  async init(container, sublevel, callbacks) {
    await super.init(container, sublevel, callbacks);

    const config = this.getConfig([
      { wordLen: 4, hints: 2 },
      { wordLen: 6, hints: 1 },
      { wordLen: 8, hints: 0 }
    ]);

    const wordList = WORDS[config.wordLen];
    const word = wordList[Math.floor(Math.random() * wordList.length)];
    const scrambled = this._scramble(word);

    this.container.innerHTML = `
      <div class="word-level">
        <div class="word-paper-texture"></div>
        <div class="word-header">
          <div class="word-label">UNSCRAMBLE THE WORD</div>
          <div class="word-hint-count" id="word-hints">${config.hints > 0 ? `${config.hints} hint${config.hints > 1 ? 's' : ''} available` : 'No hints'}</div>
        </div>
        <div class="word-scrambled" id="word-scrambled">
          ${scrambled.split('').map((ch, i) => `<span class="word-letter" id="wl-${i}">${ch}</span>`).join('')}
        </div>
        <div class="word-input-area">
          <input type="text" class="word-input" id="word-input" placeholder="Type your answer..." maxlength="${config.wordLen}" autocomplete="off" spellcheck="false" />
          <button class="word-submit btn" id="word-submit">CHECK</button>
        </div>
        ${config.hints > 0 ? `<button class="word-hint-btn" id="word-hint-btn">💡 HINT</button>` : ''}
        <div class="word-status" id="word-status"></div>
      </div>
    `;

    const input = this.container.querySelector('#word-input');
    const submitBtn = this.container.querySelector('#word-submit');
    const statusEl = this.container.querySelector('#word-status');
    const hintBtn = this.container.querySelector('#word-hint-btn');
    let hintsLeft = config.hints;
    let answered = false;

    input.focus();

    const checkAnswer = () => {
      if (answered) return;
      const guess = input.value.trim().toUpperCase();
      if (guess.length !== config.wordLen) return;
      
      answered = true;
      if (guess === word) {
        statusEl.textContent = 'CORRECT!';
        statusEl.className = 'word-status word-status-win';
        input.classList.add('word-input-correct');
        this.setTimeout(() => this.onWin(), 700);
      } else {
        statusEl.textContent = `WRONG! The word was ${word}`;
        statusEl.className = 'word-status word-status-fail';
        input.classList.add('word-input-wrong');
        this.setTimeout(() => this.onLose(), 1000);
      }
    };

    this.addEvent(submitBtn, 'click', checkAnswer);
    this.addEvent(input, 'keydown', (e) => {
      if (e.key === 'Enter') checkAnswer();
    });

    if (hintBtn) {
      this.addEvent(hintBtn, 'click', () => {
        if (hintsLeft <= 0) return;
        hintsLeft--;
        // Reveal a letter
        const letters = this.container.querySelectorAll('.word-letter');
        const unrevealed = [...letters].filter(l => !l.classList.contains('word-letter-hint'));
        if (unrevealed.length > 0) {
          const idx = Math.floor(Math.random() * unrevealed.length);
          const letterEl = unrevealed[idx];
          const origIdx = parseInt(letterEl.id.split('-')[1]);
          // Find this letter's position in original word
          letterEl.textContent = word[origIdx];
          letterEl.classList.add('word-letter-hint');
        }
        const hintsEl = this.container.querySelector('#word-hints');
        hintsEl.textContent = hintsLeft > 0 ? `${hintsLeft} hint${hintsLeft > 1 ? 's' : ''} left` : 'No hints left';
        if (hintsLeft <= 0) hintBtn.disabled = true;
      });
    }
  }

  _scramble(word) {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Make sure it's actually scrambled
    if (arr.join('') === word) {
      [arr[0], arr[1]] = [arr[1], arr[0]];
    }
    return arr.join('');
  }
}
