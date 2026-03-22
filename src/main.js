/**
 * Project 1000 — Main Entry Point
 * Wires together the game engine, UI, and levels.
 */
import './styles/global.css';
import './styles/hud.css';
import './styles/menu.css';
import './styles/completion.css';
import './styles/briefing.css';

import { GameState } from './engine/GameState.js';
import { LevelManager } from './engine/LevelManager.js';
import { AudioManager } from './engine/AudioManager.js';
import { HUD } from './ui/HUD.js';
import { MenuScreen } from './ui/MenuScreen.js';
import { CompletionScreen } from './ui/CompletionScreen.js';
import { BriefingScreen } from './ui/BriefingScreen.js';
import { ScreenManager } from './ui/ScreenManager.js';

// Levels
import { ColorMatch } from './levels/level01-color-match/ColorMatch.js';
import { SequenceMemory } from './levels/level02-sequence-memory/SequenceMemory.js';
import { MazeRunner } from './levels/level03-maze-runner/MazeRunner.js';
import { MathBlitz } from './levels/level04-math-blitz/MathBlitz.js';
import { WordScramble } from './levels/level05-word-scramble/WordScramble.js';
import { ReactionTest } from './levels/level06-reaction-test/ReactionTest.js';
import { PatternComplete } from './levels/level07-pattern-complete/PatternComplete.js';
import { GravityDodge } from './levels/level08-gravity-dodge/GravityDodge.js';
import { LightSwitch } from './levels/level09-light-switch/LightSwitch.js';
import { RhythmTap } from './levels/level10-rhythm-tap/RhythmTap.js';
import { TowerStack } from './levels/level11-tower-stack/TowerStack.js';
import { CodeBreaker } from './levels/level12-code-breaker/CodeBreaker.js';
import { TileSlide } from './levels/level13-tile-slide/TileSlide.js';

function boot() {
  const app = document.getElementById('app');

  // Engine
  const gameState = new GameState();
  const levelManager = new LevelManager();
  const audio = new AudioManager();

  // Register all levels
  levelManager.register(1, ColorMatch);
  levelManager.register(2, SequenceMemory);
  levelManager.register(3, MazeRunner);
  levelManager.register(4, MathBlitz);
  levelManager.register(5, WordScramble);
  levelManager.register(6, ReactionTest);
  levelManager.register(7, PatternComplete);
  levelManager.register(8, GravityDodge);
  levelManager.register(9, LightSwitch);
  levelManager.register(10, RhythmTap);
  levelManager.register(11, TowerStack);
  levelManager.register(12, CodeBreaker);
  levelManager.register(13, TileSlide);

  // UI
  const hud = new HUD(gameState);
  const menu = new MenuScreen();
  const completion = new CompletionScreen();
  const briefing = new BriefingScreen();

  hud.render(app);
  menu.render(app);
  completion.render(app);
  briefing.render(app);

  // Screen manager
  const screenManager = new ScreenManager(app, gameState, levelManager, audio);
  screenManager.init(hud, menu, completion, briefing);

  // Dev mode: level skip (press Shift+N to skip to next level)
  document.addEventListener('keydown', (e) => {
    if (e.shiftKey && e.key === 'N') {
      gameState.advanceSublevel();
    }
  });

  console.log('%c🎮 Project 1000 loaded — 13 levels ready', 'color: #6c63ff; font-weight: bold; font-size: 14px');
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
