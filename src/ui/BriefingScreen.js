/**
 * BriefingScreen — Displays mission objectives, rules, and controls before a level starts.
 * Features typewriter text, glitch effects, and interactive start.
 */
export class BriefingScreen {
  constructor() {
    this.el = null;
    this.onBegin = null;
    this.typewriterTimeout = null;
  }

  render(parent) {
    this.el = document.createElement('div');
    this.el.className = 'screen';
    this.el.id = 'briefing-screen';
    parent.appendChild(this.el);
  }

  show(level, data, callback) {
    if (this.typewriterTimeout) clearTimeout(this.typewriterTimeout);
    this.onBegin = callback;

    const { name, rules, controls, hint } = data;

    this.el.innerHTML = `
      <div class="brief-overlay"></div>
      <div class="brief-content">
        <div class="brief-header">
          <div class="brief-level-tag">MISSION ${level < 10 ? '0' + level : level}</div>
          <h1 class="brief-title">${name.toUpperCase()}</h1>
          <div class="brief-line"></div>
        </div>

        <div class="brief-body">
          <div class="brief-section">
            <h3 class="brief-section-title">OBJECTIVE</h3>
            <p class="brief-text brief-typewriter" id="brief-rules"></p>
          </div>

          <div class="brief-section">
            <h3 class="brief-section-title">CONTROL INTERFACE</h3>
            <div class="brief-controls">
              ${this._renderControls(controls)}
            </div>
          </div>

          <div class="brief-section brief-hint-section">
            <div class="brief-hint-tag">SYSTEM TIP</div>
            <p class="brief-hint-text">${hint}</p>
          </div>
        </div>

        <div class="brief-footer">
          <button class="brief-begin-btn" id="brief-begin-btn">
            <span class="brief-begin-glitch">BEGIN MISSION</span>
            <span class="brief-begin-label">BEGIN MISSION</span>
          </button>
          <div class="brief-press-space">or press [SPACE]</div>
        </div>
      </div>
    `;

    this.el.classList.add('active');

    // Typewriter effect for rules
    this._typewrite(this.el.querySelector('#brief-rules'), rules);

    // Event listeners
    const btn = this.el.querySelector('#brief-begin-btn');
    const handleBegin = () => {
      this.el.classList.remove('active');
      if (this.onBegin) this.onBegin();
      document.removeEventListener('keydown', spaceHandler);
    };

    btn.onclick = handleBegin;
    const spaceHandler = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handleBegin();
      }
    };
    document.addEventListener('keydown', spaceHandler);
  }

  _typewrite(el, text) {
    let i = 0;
    const speed = 20;
    el.textContent = '';
    const type = () => {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        this.typewriterTimeout = setTimeout(type, speed);
      }
    };
    type();
  }

  _renderControls(controls) {
    // Simple mapping of text to "iconic" spans
    const parts = controls.split(' / ').flatMap(p => p.split(' or '));
    return parts.map(p => `
      <div class="brief-control-item">
        <span class="brief-key">${p.trim().toUpperCase()}</span>
      </div>
    `).join('');
  }

  _renderControlIcons(controls) {
    // Advanced version if I wanted to use SVGs for WASD etc.
    return `<span class="brief-controls-raw">${controls}</span>`;
  }

  hide() {
    this.el.classList.remove('active');
    if (this.typewriterTimeout) clearTimeout(this.typewriterTimeout);
  }
}
