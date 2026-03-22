/**
 * LevelManager — Registry and lifecycle management for game levels.
 */
export class LevelManager {
  constructor() {
    this.levels = new Map();
    this.currentLevel = null;
    this.container = null;
  }

  setContainer(container) {
    this.container = container;
  }

  register(levelNumber, LevelClass) {
    this.levels.set(levelNumber, LevelClass);
  }

  hasLevel(levelNumber) {
    return this.levels.has(levelNumber);
  }

  getMaxLevel() {
    return Math.max(...this.levels.keys());
  }

  async loadLevel(levelNumber, sublevel, callbacks) {
    this.unloadLevel();

    const LevelClass = this.levels.get(levelNumber);
    if (!LevelClass) {
      console.error(`Level ${levelNumber} not registered`);
      return null;
    }

    this.currentLevel = new LevelClass();
    
    // Clear container and set up level wrapper
    this.container.innerHTML = '';
    const levelWrapper = document.createElement('div');
    levelWrapper.className = 'level-wrapper';
    levelWrapper.id = `level-${levelNumber}`;
    this.container.appendChild(levelWrapper);

    await this.currentLevel.init(levelWrapper, sublevel, callbacks);
    return this.currentLevel;
  }

  unloadLevel() {
    if (this.currentLevel) {
      this.currentLevel.destroy();
      this.currentLevel = null;
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
