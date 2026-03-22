/**
 * GameState — Central state management with event emitter pattern.
 * Manages lives, level/sublevel progression, score, and game reset.
 */
export class GameState {
  constructor() {
    this.listeners = {};
    this.reset();
  }

  reset() {
    this.lives = 5;
    this.currentLevel = 1;
    this.currentSublevel = 1;
    this.score = 0;
    this.maxLevelReached = 1;
    this.totalSublevelsCleared = 0;
    this.emit('reset');
    this.emit('stateChange', this.getState());
  }

  getState() {
    return {
      lives: this.lives,
      currentLevel: this.currentLevel,
      currentSublevel: this.currentSublevel,
      score: this.score,
      maxLevelReached: this.maxLevelReached,
      totalSublevelsCleared: this.totalSublevelsCleared
    };
  }

  loseLife() {
    this.lives = Math.max(0, this.lives - 1);
    this.emit('lifeLost', this.lives);
    this.emit('stateChange', this.getState());
    if (this.lives <= 0) {
      this.emit('gameOver', {
        levelReached: this.currentLevel,
        sublevelReached: this.currentSublevel,
        score: this.score,
        totalSublevelsCleared: this.totalSublevelsCleared
      });
    }
  }

  advanceSublevel() {
    this.score += 100 * this.currentLevel * this.currentSublevel;
    this.totalSublevelsCleared++;
    if (this.currentSublevel < 3) {
      this.currentSublevel++;
      this.emit('sublevelAdvance', { level: this.currentLevel, sublevel: this.currentSublevel });
    } else {
      this.currentSublevel = 1;
      this.currentLevel++;
      this.maxLevelReached = Math.max(this.maxLevelReached, this.currentLevel);
      this.emit('levelAdvance', { level: this.currentLevel, sublevel: this.currentSublevel });
    }
    this.emit('stateChange', this.getState());
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(data));
  }
}
