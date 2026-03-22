import { BaseLevel } from '../BaseLevel.js';
import './style.css';

/**
 * Level 6 — Reaction Test
 * Click targets as they appear.
 * Vaporwave aesthetic — pink/cyan gradients, retro grid.
 */
export class ReactionTest extends BaseLevel {
  async init(container, sublevel, callbacks) {
    await super.init(container, sublevel, callbacks);

    const config = this.getConfig([
      { targets: 1, window: 1500, decoys: false, sequential: false },
      { targets: 3, window: 1000, decoys: false, sequential: true },
      { targets: 5, window: 800, decoys: true, sequential: true }
    ]);

    this.container.innerHTML = `
      <div class="react-level">
        <div class="react-grid-bg"></div>
        <div class="react-sun"></div>
        <div class="react-status" id="react-status">GET READY...</div>
        <div class="react-counter" id="react-counter"></div>
        <div class="react-field" id="react-field"></div>
      </div>
    `;

    const field = this.container.querySelector('#react-field');
    const statusEl = this.container.querySelector('#react-status');
    const counterEl = this.container.querySelector('#react-counter');

    let targetsHit = 0;
    let failed = false;

    const spawnTarget = (index) => {
      if (failed) return;
      const target = document.createElement('div');
      target.className = 'react-target';
      target.id = `react-target-${index}`;
      target.style.left = (10 + Math.random() * 70) + '%';
      target.style.top = (10 + Math.random() * 70) + '%';
      field.appendChild(target);

      // Spawn decoys for sublevel 3
      if (config.decoys && Math.random() > 0.5) {
        const decoy = document.createElement('div');
        decoy.className = 'react-target react-decoy';
        decoy.style.left = (10 + Math.random() * 70) + '%';
        decoy.style.top = (10 + Math.random() * 70) + '%';
        field.appendChild(decoy);

        this.addEvent(decoy, 'click', () => {
          if (failed) return;
          failed = true;
          decoy.classList.add('react-target-wrong');
          statusEl.textContent = 'DECOY! WRONG!';
          this.setTimeout(() => this.onLose(), 800);
        });

        this.setTimeout(() => {
          if (decoy.parentNode) decoy.remove();
        }, config.window);
      }

      this.addEvent(target, 'click', () => {
        if (failed) return;
        target.classList.add('react-target-hit');
        targetsHit++;
        counterEl.textContent = `${targetsHit} / ${config.targets}`;

        this.setTimeout(() => target.remove(), 200);

        if (targetsHit >= config.targets) {
          statusEl.textContent = 'PERFECT!';
          this.setTimeout(() => this.onWin(), 600);
        } else if (config.sequential) {
          this.setTimeout(() => spawnTarget(targetsHit), 300 + Math.random() * 500);
        }
      });

      // Auto-miss timeout
      this.setTimeout(() => {
        if (target.parentNode && !target.classList.contains('react-target-hit')) {
          failed = true;
          target.classList.add('react-target-miss');
          statusEl.textContent = 'TOO SLOW!';
          this.setTimeout(() => this.onLose(), 600);
        }
      }, config.window);
    };

    // Start after delay
    this.setTimeout(() => {
      statusEl.textContent = 'CLICK!';
      counterEl.textContent = `0 / ${config.targets}`;
      if (config.sequential) {
        spawnTarget(0);
      } else {
        spawnTarget(0);
      }
    }, 1500 + Math.random() * 1000);
  }
}
