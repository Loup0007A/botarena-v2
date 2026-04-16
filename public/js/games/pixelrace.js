// Pixel Race - Reproduis le pixel art le plus vite
window.startGame = function() {
  Arena.start();
  const SIZE = 6; // 6x6 grid
  const COLORS = ['#ff4444','#00ff88','#00c8ff','#ffa500','#ff00aa','#ffffff','#ffff00'];
  let score = 0, round = 0;
  const ROUNDS = 5;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:20px;width:100%;max-width:520px">
      <div style="font-family:var(--font-display);margin-bottom:12px">
        Score: <span id="px-s" style="color:var(--accent)">0</span>
        &nbsp;|&nbsp; Round <span id="px-r">1</span>/${ROUNDS}
      </div>
      <div id="px-timer" style="font-family:var(--font-display);font-size:1.2rem;color:var(--warn);margin-bottom:12px">⏱ 30s</div>
      <div style="display:flex;gap:20px;justify-content:center;align-items:flex-start;flex-wrap:wrap">
        <div>
          <div style="color:var(--text3);font-size:0.8rem;margin-bottom:8px">MODÈLE</div>
          <canvas id="px-model" width="${SIZE*30}" height="${SIZE*30}" style="border:2px solid var(--accent);border-radius:8px;image-rendering:pixelated"></canvas>
        </div>
        <div>
          <div style="color:var(--text3);font-size:0.8rem;margin-bottom:8px">TA COPIE</div>
          <canvas id="px-canvas" width="${SIZE*30}" height="${SIZE*30}" style="border:2px solid var(--border);border-radius:8px;cursor:crosshair;image-rendering:pixelated"></canvas>
        </div>
      </div>
      <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap;justify-content:center" id="px-palette"></div>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:12px">
        <button id="px-submit" class="btn-primary" style="padding:10px 24px">✅ Valider</button>
        <button id="px-clear" class="btn-secondary" style="padding:10px 18px">🗑 Reset</button>
      </div>
      <div id="px-fb" style="font-family:var(--font-display);margin-top:12px;min-height:24px"></div>
    </div>
  `;

  const CS = 30;
  let target = [], userGrid = [];
  let selectedColor = COLORS[0];
  let isDrawing = false;
  let timeLeft = 30, timerInterval;

  function buildPalette() {
    const el = document.getElementById('px-palette');
    el.innerHTML = '';
    COLORS.forEach(col => {
      const btn = document.createElement('div');
      btn.style.cssText = `
        width:32px;height:32px;border-radius:6px;background:${col};
        cursor:pointer;border:3px solid ${col === selectedColor ? 'white' : 'transparent'};
        transition:border-color 0.15s;
      `;
      btn.onclick = () => {
        selectedColor = col;
        buildPalette();
      };
      el.appendChild(btn);
    });
  }

  function generateTarget() {
    // Random pixel art (simple patterns)
    const patterns = [
      // Heart shape
      [0,1,1,0,1,1,1,1,1,1,1,1,1,0,0,1,1,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0].map(v => v ? '#ff4444' : '#1a1a30'),
      // Robot face
      [0,0,0,0,0,0,0,1,0,0,1,0,0,1,1,1,1,0,1,0,0,0,0,1,0,1,1,1,1,0,0,0,0,0,0,0].map(v => v ? '#00ff88' : '#1a1a30'),
      // Arrow
      [0,0,1,0,0,0,0,1,1,0,0,0,1,1,1,1,0,0,0,1,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0].map(v => v ? '#00c8ff' : '#1a1a30'),
    ];
    // Or just random colored pattern
    const usePattern = Math.random() > 0.4 && patterns[round % patterns.length];
    if (usePattern) return usePattern;
    return Array.from({ length: SIZE*SIZE }, () =>
      Math.random() > 0.6 ? COLORS[Math.floor(Math.random() * COLORS.length)] : '#1a1a30'
    );
  }

  function drawGrid(canvas, grid, hover = null) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1a1a30';
    ctx.fillRect(0, 0, SIZE*CS, SIZE*CS);
    for (let i = 0; i < SIZE*SIZE; i++) {
      const x = (i % SIZE) * CS, y = Math.floor(i / SIZE) * CS;
      ctx.fillStyle = grid[i] || '#1a1a30';
      ctx.fillRect(x+1, y+1, CS-2, CS-2);
      if (hover === i) {
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.fillRect(x+1, y+1, CS-2, CS-2);
      }
    }
    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= SIZE; i++) {
      ctx.beginPath(); ctx.moveTo(i*CS, 0); ctx.lineTo(i*CS, SIZE*CS); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, i*CS); ctx.lineTo(SIZE*CS, i*CS); ctx.stroke();
    }
  }

  function getCell(canvas, e) {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / (r.width / (SIZE*CS));
    const y = (e.clientY - r.top) / (r.height / (SIZE*CS));
    const col = Math.floor(x / CS), row = Math.floor(y / CS);
    if (col < 0 || col >= SIZE || row < 0 || row >= SIZE) return -1;
    return row * SIZE + col;
  }

  function paintCell(idx) {
    if (idx < 0) return;
    userGrid[idx] = selectedColor;
    drawGrid(document.getElementById('px-canvas'), userGrid);
  }

  const canvas = document.getElementById('px-canvas');
  canvas.onmousedown = e => { isDrawing = true; paintCell(getCell(canvas, e)); };
  canvas.onmousemove = e => { if (isDrawing) paintCell(getCell(canvas, e)); };
  canvas.onmouseup = () => isDrawing = false;
  canvas.onmouseleave = () => isDrawing = false;
  canvas.addEventListener('touchstart', e => { e.preventDefault(); isDrawing = true; paintCell(getCell(canvas, e.touches[0])); }, { passive: false });
  canvas.addEventListener('touchmove', e => { e.preventDefault(); if (isDrawing) paintCell(getCell(canvas, e.touches[0])); }, { passive: false });
  canvas.addEventListener('touchend', () => isDrawing = false);

  document.getElementById('px-clear').onclick = () => {
    userGrid = Array(SIZE*SIZE).fill('#1a1a30');
    drawGrid(document.getElementById('px-canvas'), userGrid);
  };

  document.getElementById('px-submit').onclick = submit;

  function submit() {
    clearInterval(timerInterval);
    // Calculate match percentage
    let matches = 0;
    target.forEach((col, i) => {
      if (userGrid[i] === col) matches++;
    });
    const pct = Math.round(matches / (SIZE*SIZE) * 100);
    const pts = Math.round(pct * (1 + timeLeft / 30));
    score += pts;
    document.getElementById('px-s').textContent = score;

    if (pct >= 70) {
      document.getElementById('px-fb').innerHTML = `<span style="color:var(--accent)">✅ ${pct}% correct ! +${pts} pts</span>`;
    } else {
      document.getElementById('px-fb').innerHTML = `<span style="color:var(--warn)">⚠️ ${pct}% correct... +${pts} pts</span>`;
    }

    // Show model overlay
    drawGrid(document.getElementById('px-model'), target);
    round++;
    if (round >= ROUNDS) {
      setTimeout(() => Arena.end(score >= 200 ? 'win' : 'loss', score), 1500);
    } else {
      setTimeout(startRound, 1500);
    }
  }

  function startRound() {
    document.getElementById('px-r').textContent = round + 1;
    document.getElementById('px-fb').textContent = '';
    target = generateTarget();
    userGrid = Array(SIZE*SIZE).fill('#1a1a30');
    drawGrid(document.getElementById('px-model'), target);
    drawGrid(document.getElementById('px-canvas'), userGrid);

    timeLeft = 30;
    clearInterval(timerInterval);
    document.getElementById('px-timer').textContent = `⏱ ${timeLeft}s`;
    timerInterval = setInterval(() => {
      timeLeft--;
      document.getElementById('px-timer').textContent = `⏱ ${timeLeft}s`;
      if (timeLeft <= 0) { clearInterval(timerInterval); submit(); }
    }, 1000);
  }

  buildPalette();
  startRound();
};
