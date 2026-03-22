import { BaseLevel } from '../BaseLevel.js';
import './style.css';

/**
 * Level 11 — Tower Stack
 * Stop a sliding block to stack a perfect tower.
 * Bauhaus aesthetic — primary colors, bold shapes.
 */
export class TowerStack extends BaseLevel {
  async init(container, sublevel, callbacks) {
    await super.init(container, sublevel, callbacks);

    const config = this.getConfig([
      { blockWidth: 0.6, speed: 2, targetLayers: 5 },
      { blockWidth: 0.45, speed: 3, targetLayers: 6 },
      { blockWidth: 0.3, speed: 4, targetLayers: 8 }
    ]);

    const COLORS = ['#e63946', '#457b9d', '#f1c93b', '#2a9d8f', '#e76f51', '#264653', '#a8dadc', '#f4a261'];

    this.container.innerHTML = `
      <div class="tower-level">
        <div class="tower-header">
          <span class="tower-label">STACK IT</span>
          <span class="tower-count" id="tower-count">0 / ${config.targetLayers}</span>
        </div>
        <div class="tower-arena" id="tower-arena">
          <canvas id="tower-canvas" width="400" height="500"></canvas>
        </div>
        <div class="tower-instructions">Click or press SPACE to drop</div>
      </div>
    `;

    const canvas = this.container.querySelector('#tower-canvas');
    const ctx = canvas.getContext('2d');
    const countEl = this.container.querySelector('#tower-count');
    const W = canvas.width;
    const H = canvas.height;
    const blockH = 30;
    
    let layers = [];
    let currentBlock = null;
    let gameActive = true;
    let layerCount = 0;

    // Base platform
    const baseW = config.blockWidth * W;
    const baseX = (W - baseW) / 2;
    layers.push({ x: baseX, w: baseW, y: H - blockH, color: '#264653' });

    const spawnBlock = () => {
      const prev = layers[layers.length - 1];
      const speed = config.speed + layerCount * 0.3;
      currentBlock = {
        x: -prev.w,
        w: prev.w,
        y: prev.y - blockH,
        color: COLORS[layerCount % COLORS.length],
        speed: speed,
        direction: 1
      };
    };

    const dropBlock = () => {
      if (!currentBlock || !gameActive) return;
      
      const prev = layers[layers.length - 1];
      const overlapStart = Math.max(currentBlock.x, prev.x);
      const overlapEnd = Math.min(currentBlock.x + currentBlock.w, prev.x + prev.w);
      const overlap = overlapEnd - overlapStart;

      if (overlap <= 0) {
        // Complete miss
        gameActive = false;
        this.setTimeout(() => this.onLose(), 500);
        return;
      }

      // Trim block to overlap
      const trimmed = {
        x: overlapStart,
        w: overlap,
        y: currentBlock.y,
        color: currentBlock.color
      };
      layers.push(trimmed);
      layerCount++;
      countEl.textContent = `${layerCount} / ${config.targetLayers}`;

      currentBlock = null;

      if (layerCount >= config.targetLayers) {
        gameActive = false;
        this.setTimeout(() => this.onWin(), 500);
        return;
      }

      spawnBlock();
    };

    // Controls
    this.addEvent(document, 'keydown', (e) => {
      if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); dropBlock(); }
    });
    this.addEvent(canvas, 'click', dropBlock);

    // Game loop
    const draw = () => {
      if (!gameActive && !currentBlock) {
        renderFrame();
        return;
      }

      // Move current block
      if (currentBlock) {
        currentBlock.x += currentBlock.speed * currentBlock.direction;
        if (currentBlock.x + currentBlock.w > W) currentBlock.direction = -1;
        if (currentBlock.x < 0) currentBlock.direction = 1;
      }

      renderFrame();
      this.requestAnimationFrame(draw);
    };

    const renderFrame = () => {
      ctx.clearRect(0, 0, W, H);

      // Background grid
      ctx.strokeStyle = 'rgba(0,0,0,0.06)';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Shift view if tower gets too tall
      let offsetY = 0;
      if (layers.length > 0) {
        const topY = layers[layers.length - 1].y;
        if (topY < H * 0.3) {
          offsetY = H * 0.3 - topY;
        }
      }

      ctx.save();
      ctx.translate(0, offsetY);

      // Draw layers  
      layers.forEach(layer => {
        ctx.fillStyle = layer.color;
        ctx.fillRect(layer.x, layer.y, layer.w, blockH - 2);
        // Bold border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(layer.x, layer.y, layer.w, blockH - 2);
      });

      // Draw current block
      if (currentBlock) {
        ctx.fillStyle = currentBlock.color;
        ctx.fillRect(currentBlock.x, currentBlock.y, currentBlock.w, blockH - 2);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(currentBlock.x, currentBlock.y, currentBlock.w, blockH - 2);
      }

      ctx.restore();
    };

    spawnBlock();
    this.requestAnimationFrame(draw);
  }
}
