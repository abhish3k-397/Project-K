/**
 * ScreenManager — Controls which screen is active and handles transitions.
 */
export class ScreenManager {
  constructor(app, gameState, levelManager, audio) {
    this.app = app;
    this.gameState = gameState;
    this.levelManager = levelManager;
    this.audio = audio;
    this.gameArea = null;
  }

  init(hud, menu, completion, briefing) {
    this.hud = hud;
    this.menu = menu;
    this.completion = completion;
    this.briefing = briefing;

    // Create game area
    this.gameArea = document.createElement('div');
    this.gameArea.className = 'game-area';
    this.gameArea.id = 'game-area';
    this.app.appendChild(this.gameArea);

    this.levelManager.setContainer(this.gameArea);

    // Bind menu callbacks
    this.menu.onStart = () => this.startGame();
    this.menu.onRestart = () => this.restartGame();

    // Bind game state events
    this.gameState.on('sublevelAdvance', (data) => this.onSublevelAdvance(data));
    this.gameState.on('levelAdvance', (data) => this.onLevelAdvance(data));
    this.gameState.on('gameOver', (stats) => this.onGameOver(stats));
  }

  startGame() {
    this.audio.init();
    this.audio.resume();
    this.audio.click();
    this.gameState.reset();
    this.menu.hide();
    this.hud.show();
    this.showBriefing(1, () => {
      this._loadCurrentLevel();
    });
  }

  restartGame() {
    this.audio.click();
    this.gameState.reset();
    this.menu.hide();
    this.hud.show();
    this.showBriefing(1, () => {
      this._loadCurrentLevel();
    });
  }

  onSublevelAdvance(data) {
    this.audio.success();
    this.levelManager.unloadLevel();
    const state = this.gameState.getState();

    this.completion.showSublevelComplete({
      level: data.level,
      sublevelCleared: data.sublevel - 1, // the one we just cleared
      score: state.score,
      lives: state.lives
    }, () => {
      this._loadCurrentLevel();
    });
  }

  onLevelAdvance(data) {
    this.audio.levelUp();
    this.levelManager.unloadLevel();

    if (!this.levelManager.hasLevel(data.level)) {
      this._showVictory();
      return;
    }

    const state = this.gameState.getState();
    const info = this._getLevelInfo(data.level);

    this.completion.showLevelComplete({
      levelCleared: data.level - 1,
      nextLevel: data.level,
      nextLevelName: info.name,
      nextLevelHint: info.hint,
      totalScore: state.score,
      lives: state.lives,
      sublevelsCleared: state.totalSublevelsCleared
    }, () => {
      this.showBriefing(data.level, () => {
        this._loadCurrentLevel();
      });
    });
  }

  showBriefing(level, callback) {
    const info = this._getLevelInfo(level);
    this.briefing.show(level, info, callback);
  }

  onGameOver(stats) {
    this.audio.gameOver();
    this.levelManager.unloadLevel();
    this.hud.hide();
    setTimeout(() => {
      this.menu.showGameOver(stats);
    }, 800);
  }

  _loadCurrentLevel() {
    const state = this.gameState.getState();
    this.levelManager.loadLevel(state.currentLevel, state.currentSublevel, {
      onWin: () => this.gameState.advanceSublevel(),
      onLose: () => {
        this.audio.fail();
        this.gameState.loseLife();
        if (this.gameState.lives > 0) {
          setTimeout(() => this._loadCurrentLevel(), 1000);
        }
      }
    });
  }

  _showVictory() {
    this.levelManager.unloadLevel();
    this.hud.hide();
    
    const screen = document.createElement('div');
    screen.className = 'screen active';
    screen.innerHTML = `
      <div class="menu-content" style="position:relative;z-index:1;text-align:center;">
        <div class="gameover-skull">🏆</div>
        <h1 class="gameover-title" style="background:linear-gradient(135deg,#f59e0b,#ef4444,#6c63ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">YOU WIN!</h1>
        <p class="menu-subtitle">You've conquered all available levels!</p>
        <div class="gameover-stats">
          <div class="gameover-stat">
            <div class="gameover-stat-value">${this.gameState.score.toLocaleString()}</div>
            <div class="gameover-stat-label">Final Score</div>
          </div>
          <div class="gameover-stat">
            <div class="gameover-stat-value">${this.gameState.lives}</div>
            <div class="gameover-stat-label">Lives Remaining</div>
          </div>
        </div>
        <button class="btn btn-primary menu-start-btn" id="btn-play-again">PLAY AGAIN</button>
      </div>
    `;
    this.app.appendChild(screen);
    screen.querySelector('#btn-play-again').addEventListener('click', () => {
      screen.remove();
      this.restartGame();
    });
  }

  _getLevelInfo(level) {
    const info = {
      1: { 
        name: 'Color Match', 
        hint: 'Speed is your best friend here.',
        rules: 'Match the target color shown in the center as fast as possible.',
        controls: 'Mouse Click'
      },
      2: { 
        name: 'Sequence Memory', 
        hint: 'Focus on the rhythm of the flashes.',
        rules: 'Watch the flashing sequence carefully and repeat it exactly.',
        controls: 'Mouse Click'
      },
      3: { 
        name: 'Maze Runner', 
        hint: 'Don\'t panic if it gets dark.',
        rules: 'Navigate through the procedural maze and reach the exit portal.',
        controls: 'WASD / Arrows'
      },
      4: { 
        name: 'Math Blitz', 
        hint: 'Trust your first instinct.',
        rules: 'Solve the arithmetic equations before the timer hits zero.',
        controls: 'Keyboard / Mouse'
      },
      5: { 
        name: 'Word Scramble', 
        hint: 'The word usually relates to the game.',
        rules: 'Unscramble the letters to reveal the correct word.',
        controls: 'Keyboard / Mouse'
      },
      6: { 
        name: 'Reaction Test', 
        hint: 'RED targets with white crosses are DECOYS. Ignore them.',
        rules: 'Click the spawning pink targets immediately. Avoid all RED decoys.',
        controls: 'Mouse Click'
      },
      7: { 
        name: 'Pattern Complete', 
        hint: 'Look for symmetry and color shifts.',
        rules: 'Identify the underlying logic of the grid and select the missing piece.',
        controls: 'Mouse Click'
      },
      8: { 
        name: 'Gravity Dodge', 
        hint: 'The wind starts blowing in Sublevel 3.',
        rules: 'Survive the falling debris. Avoid contact at all costs.',
        controls: 'Mouse Move / A / D'
      },
      9: { 
        name: 'Light Switch', 
        hint: 'Try to work from corners inward.',
        rules: 'Turn all global lights ON. Remember that toggling one affects its neighbors.',
        controls: 'Mouse Click'
      },
      10: { 
        name: 'Rhythm Tap', 
        hint: 'Close your eyes? No, actually don\'t.',
        rules: 'Hit the corresponding keys as the notes cross the judgment line.',
        controls: 'A - S - K - L'
      },
      11: { 
        name: 'Tower Stack', 
        hint: 'Perfect stops prevent your tower from shrinking.',
        rules: 'Stop the sliding blocks to build the tallest possible tower.',
        controls: 'Space / Mouse'
      },
      12: { 
        name: 'Code Breaker', 
        hint: '🟢=Right, 🟡=Exists, ⚫=Null.',
        rules: 'Crack the secret number sequence using the diagnostic feedback.',
        controls: 'Keyboard / Mouse'
      },
      13: { 
        name: 'Tile Slide', 
        hint: 'The last tile is always empty.',
        rules: 'Rearrange the tiles into perfect numerical order (1, 2, 3...).',
        controls: 'Mouse Click'
      }
    };
    return info[level] || { name: `Level ${level}`, hint: 'Diagnostic unknown.', rules: 'System alert. High unknown variance. Proceed with caution.', controls: 'Discovery Required' };
  }
}
