import { BaseLevel } from '../BaseLevel.js';
import './style.css';

/**
 * Level 4 — Math Blitz
 * Solve equations before time runs out.
 * Chalkboard aesthetic — dark green, chalk texture, dusty.
 */
export class MathBlitz extends BaseLevel {
  async init(container, sublevel, callbacks) {
    await super.init(container, sublevel, callbacks);

    const config = this.getConfig([
      { ops: ['+', '-'], range: 20, time: 8000, multiStep: false },
      { ops: ['+', '-', '×', '÷'], range: 12, time: 6000, multiStep: false },
      { ops: ['+', '-', '×'], range: 15, time: 4000, multiStep: true }
    ]);

    const { question, answer } = this._generateQuestion(config);
    const choices = this._generateChoices(answer, config);

    this.container.innerHTML = `
      <div class="math-level">
        <div class="math-chalk-dust"></div>
        <div class="math-equation" id="math-equation">${question}</div>
        <div class="math-timer-wrap"></div>
        <div class="math-choices" id="math-choices">
          ${choices.map((c, i) => `
            <button class="math-choice" data-val="${c}" id="math-choice-${i}">${c}</button>
          `).join('')}
        </div>
        <div class="math-status" id="math-status"></div>
      </div>
    `;

    const timerWrap = this.container.querySelector('.math-timer-wrap');
    const timer = this.createTimer(config.time, () => {
      statusEl.textContent = `TIME'S UP! Answer: ${answer}`;
      statusEl.className = 'math-status math-status-fail';
      this.setTimeout(() => this.onLose(), 1000);
    });
    timerWrap.appendChild(timer.el);

    const statusEl = this.container.querySelector('#math-status');
    let answered = false;

    this.container.querySelectorAll('.math-choice').forEach(btn => {
      this.addEvent(btn, 'click', () => {
        if (answered) return;
        answered = true;
        timer.stop();

        const val = parseInt(btn.dataset.val);
        if (val === answer) {
          btn.classList.add('math-correct');
          statusEl.textContent = 'CORRECT!';
          statusEl.className = 'math-status math-status-win';
          this.setTimeout(() => this.onWin(), 600);
        } else {
          btn.classList.add('math-wrong');
          statusEl.textContent = `WRONG! Answer: ${answer}`;
          statusEl.className = 'math-status math-status-fail';
          this.container.querySelectorAll('.math-choice').forEach(b => {
            if (parseInt(b.dataset.val) === answer) b.classList.add('math-correct');
          });
          this.setTimeout(() => this.onLose(), 1000);
        }
      });
    });

    timer.start();
  }

  _generateQuestion(config) {
    if (config.multiStep) {
      const a = Math.floor(Math.random() * config.range) + 1;
      const b = Math.floor(Math.random() * config.range) + 1;
      const c = Math.floor(Math.random() * 10) + 1;
      const op1 = config.ops[Math.floor(Math.random() * 2)]; // + or -
      const op2 = config.ops[Math.floor(Math.random() * 2)];
      let question, answer;
      const r1 = op1 === '+' ? a + b : a - b;
      answer = op2 === '+' ? r1 + c : r1 - c;
      question = `${a} ${op1} ${b} ${op2} ${c} = ?`;
      return { question, answer };
    }

    const op = config.ops[Math.floor(Math.random() * config.ops.length)];
    let a, b, answer, question;

    switch (op) {
      case '+':
        a = Math.floor(Math.random() * config.range) + 1;
        b = Math.floor(Math.random() * config.range) + 1;
        answer = a + b;
        question = `${a} + ${b} = ?`;
        break;
      case '-':
        a = Math.floor(Math.random() * config.range) + 1;
        b = Math.floor(Math.random() * a) + 1;
        answer = a - b;
        question = `${a} − ${b} = ?`;
        break;
      case '×':
        a = Math.floor(Math.random() * config.range) + 1;
        b = Math.floor(Math.random() * 10) + 1;
        answer = a * b;
        question = `${a} × ${b} = ?`;
        break;
      case '÷':
        b = Math.floor(Math.random() * 8) + 2;
        answer = Math.floor(Math.random() * 10) + 1;
        a = b * answer;
        question = `${a} ÷ ${b} = ?`;
        break;
    }

    return { question, answer };
  }

  _generateChoices(answer, config) {
    const choices = new Set([answer]);
    while (choices.size < 4) {
      const offset = Math.floor(Math.random() * 10) - 5;
      if (offset !== 0) choices.add(answer + offset);
    }
    return [...choices].sort(() => Math.random() - 0.5);
  }
}
