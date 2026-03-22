import { BaseLevel } from '../BaseLevel.js';
import './style.css';

/**
 * Level 7 — Pattern Complete
 * Find the missing piece in a visual pattern grid.
 * Now features structured logic and win-state explanations.
 */
export class PatternComplete extends BaseLevel {
  async init(container, sublevel, callbacks) {
    await super.init(container, sublevel, callbacks);

    const config = this.getConfig([
      { gridSize: 2, useRotation: false, useColor: true },
      { gridSize: 3, useRotation: true, useColor: true },
      { gridSize: 3, useRotation: true, useColor: true }
    ]);

    const SHAPES = ['circle', 'square', 'triangle', 'diamond'];
    const COLORS = ['#e63946', '#457b9d', '#f1c93b', '#2a9d8f', '#264653'];
    const ROTATIONS = [0, 90, 180, 270];

    // Pick a logic rule and generate pattern
    const { pattern, explanation } = this._createLogicPattern(config, SHAPES, COLORS, ROTATIONS);
    const totalCells = config.gridSize * config.gridSize;
    const missingIdx = Math.floor(Math.random() * totalCells);
    const correctAnswer = pattern[missingIdx];

    // Generate wrong choices
    const choices = [correctAnswer];
    while (choices.length < 4) {
      const choice = {
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        rotation: config.useRotation ? ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)] : 0
      };
      const isDuplicate = choices.some(c => 
        c.shape === choice.shape && 
        c.color === choice.color && 
        c.rotation === choice.rotation
      );
      if (!isDuplicate) choices.push(choice);
    }
    choices.sort(() => Math.random() - 0.5);

    this.container.innerHTML = `
      <div class="pattern-level">
        <div class="pattern-header">
          <div class="pattern-label">FIND THE MISSING PIECE</div>
          <div class="pattern-explanation" id="pattern-explanation">${explanation}</div>
        </div>
        <div class="pattern-grid" style="grid-template-columns: repeat(${config.gridSize}, 1fr)">
          ${pattern.map((p, i) => `
            <div class="pattern-cell ${i === missingIdx ? 'pattern-missing' : ''}">
              ${i === missingIdx ? '<span class="pattern-q">?</span>' : this._renderShape(p)}
            </div>
          `).join('')}
        </div>
        <div class="pattern-choices">
          ${choices.map((c, i) => `
            <button class="pattern-choice" data-idx="${i}" id="pattern-choice-${i}">
              ${this._renderShape(c)}
            </button>
          `).join('')}
        </div>
        <div class="pattern-status" id="pattern-status"></div>
      </div>
    `;

    const statusEl = this.container.querySelector('#pattern-status');
    const explanationEl = this.container.querySelector('#pattern-explanation');
    let answered = false;

    this.container.querySelectorAll('.pattern-choice').forEach((btn, idx) => {
      this.addEvent(btn, 'click', () => {
        if (answered) return;
        
        const chosen = choices[idx];
        if (chosen === correctAnswer) {
          answered = true;
          btn.classList.add('pattern-choice-correct');
          
          const missingCell = this.container.querySelector('.pattern-missing');
          missingCell.innerHTML = this._renderShape(correctAnswer);
          missingCell.classList.remove('pattern-missing');
          missingCell.classList.add('pattern-filled');
          
          statusEl.textContent = 'LOGIC CORRECT';
          statusEl.classList.add('status-success');
          explanationEl.classList.add('reveal');
          
          this.setTimeout(() => this.onWin(), 2500); // Wait longer to read the logic
        } else {
          btn.classList.add('pattern-choice-wrong');
          statusEl.textContent = 'LOGIC FAILURE';
          statusEl.classList.add('status-fail');
          this.setTimeout(() => {
            btn.classList.remove('pattern-choice-wrong');
            statusEl.textContent = '';
            statusEl.classList.remove('status-fail');
          }, 800);
          this.onLose();
        }
      });
    });
  }

  _createLogicPattern(config, SHAPES, COLORS, ROTATIONS) {
    const size = config.gridSize;
    const rules = [
      {
        id: 'row_uniform',
        explanation: 'LOGIC: Each horizontal row shares identical properties.',
        generate: () => {
          const rowData = Array.from({ length: size }, () => ({
            shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            rotation: config.useRotation ? ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)] : 0
          }));
          return Array.from({ length: size * size }, (_, i) => rowData[Math.floor(i / size)]);
        }
      },
      {
        id: 'col_uniform',
        explanation: 'LOGIC: Each vertical column shares identical properties.',
        generate: () => {
          const colData = Array.from({ length: size }, () => ({
            shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            rotation: config.useRotation ? ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)] : 0
          }));
          return Array.from({ length: size * size }, (_, i) => colData[i % size]);
        }
      },
      {
        id: 'cyclic_shift',
        explanation: 'LOGIC: Properties shift horizontally by one position per row.',
        generate: () => {
          const baseRow = Array.from({ length: size }, (_, i) => ({
            shape: SHAPES[(Math.floor(Math.random() * SHAPES.length) + i) % SHAPES.length],
            color: COLORS[(Math.floor(Math.random() * COLORS.length) + i) % COLORS.length],
            rotation: config.useRotation ? ROTATIONS[i % ROTATIONS.length] : 0
          }));
          const p = [];
          for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
              p.push(baseRow[(c + r) % size]);
            }
          }
          return p;
        }
      },
      {
        id: 'diagonal_sync',
        explanation: 'LOGIC: Matching diagonal cells contain identical elements.',
        generate: () => {
          const p = [];
          const diagData = Array.from({ length: (size * 2) - 1 }, () => ({
            shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            rotation: config.useRotation ? ROTATIONS[Math.floor(Math.random() * ROTATIONS.length)] : 0
          }));
          for (let r = 0; r < size; r++) {
            for (let c = 0; c < size; c++) {
              p.push(diagData[r + c]);
            }
          }
          return p;
        }
      }
    ];

    const rule = rules[Math.floor(Math.random() * rules.length)];
    return { pattern: rule.generate(), explanation: rule.explanation };
  }

  _renderShape(p) {
    const style = `transform: rotate(${p.rotation}deg)`;
    switch (p.shape) {
      case 'circle': return `<svg class="pattern-shape" viewBox="0 0 40 40" style="${style}"><circle cx="20" cy="20" r="16" fill="${p.color}"/></svg>`;
      case 'square': return `<svg class="pattern-shape" viewBox="0 0 40 40" style="${style}"><rect x="6" y="6" width="28" height="28" fill="${p.color}"/></svg>`;
      case 'triangle': return `<svg class="pattern-shape" viewBox="0 0 40 40" style="${style}"><polygon points="20,4 36,36 4,36" fill="${p.color}"/></svg>`;
      case 'diamond': return `<svg class="pattern-shape" viewBox="0 0 40 40" style="${style}"><polygon points="20,2 38,20 20,38 2,20" fill="${p.color}"/></svg>`;
    }
  }
}
