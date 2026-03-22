/**
 * BaseLevel — Abstract base class for all levels.
 * Provides timer utilities, sublevel config access, and lifecycle methods.
 */
export class BaseLevel {
  constructor() {
    this.container = null;
    this.sublevel = 1;
    this.callbacks = null;
    this.timers = [];
    this.intervals = [];
    this.animFrames = [];
    this.boundHandlers = [];
  }

  /**
   * Initialize the level. Override in subclasses.
   * @param {HTMLElement} container - DOM element to render into
   * @param {number} sublevel - 1, 2, or 3
   * @param {object} callbacks - { onWin, onLose }
   */
  async init(container, sublevel, callbacks) {
    this.container = container;
    this.sublevel = sublevel;
    this.callbacks = callbacks;
  }

  /** Clean up. Override in subclasses (call super.destroy()). */
  destroy() {
    this.timers.forEach(t => clearTimeout(t));
    this.intervals.forEach(i => clearInterval(i));
    this.animFrames.forEach(f => cancelAnimationFrame(f));
    this.boundHandlers.forEach(({ el, event, handler }) => {
      el.removeEventListener(event, handler);
    });
    this.timers = [];
    this.intervals = [];
    this.animFrames = [];
    this.boundHandlers = [];
    if (this.container) this.container.innerHTML = '';
  }

  /** Call when player wins the sublevel. */
  onWin() {
    if (this.callbacks && this.callbacks.onWin) {
      this.callbacks.onWin();
    }
  }

  /** Call when player loses the sublevel. */
  onLose() {
    if (this.callbacks && this.callbacks.onLose) {
      this.callbacks.onLose();
    }
  }

  /** Safe setTimeout that auto-cleans. */
  setTimeout(fn, ms) {
    const id = setTimeout(fn, ms);
    this.timers.push(id);
    return id;
  }

  /** Safe setInterval that auto-cleans. */
  setInterval(fn, ms) {
    const id = setInterval(fn, ms);
    this.intervals.push(id);
    return id;
  }

  /** Safe requestAnimationFrame that auto-cleans. */
  requestAnimationFrame(fn) {
    const id = requestAnimationFrame(fn);
    this.animFrames.push(id);
    return id;
  }

  /** Safe addEventListener that auto-cleans. */
  addEvent(el, event, handler) {
    el.addEventListener(event, handler);
    this.boundHandlers.push({ el, event, handler });
  }

  /** Get sublevel config from an array of 3 configs. */
  getConfig(configs) {
    return configs[this.sublevel - 1];
  }

  /** Create a visual timer bar. Returns { el, start, stop } */
  createTimer(durationMs, onExpire) {
    const bar = document.createElement('div');
    bar.className = 'level-timer';
    bar.innerHTML = `<div class="level-timer-fill"></div>`;
    const fill = bar.querySelector('.level-timer-fill');
    
    let startTime;
    let frameId;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.max(0, 1 - elapsed / durationMs);
      fill.style.width = (pct * 100) + '%';
      
      if (pct <= 0.3) fill.style.background = 'var(--color-danger)';
      else if (pct <= 0.6) fill.style.background = 'var(--color-warning)';
      
      if (elapsed >= durationMs) {
        if (onExpire) onExpire();
        return;
      }
      frameId = this.requestAnimationFrame(tick);
    };

    return {
      el: bar,
      start: () => { startTime = Date.now(); tick(); },
      stop: () => { if (frameId) cancelAnimationFrame(frameId); },
      reset: () => { fill.style.width = '100%'; fill.style.background = ''; }
    };
  }
}
