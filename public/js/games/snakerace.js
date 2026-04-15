// Snake Race - Snake en duel contre l'IA
window.startGame = function() {
  Arena.start();
  const c = Arena.getContainer();
  const SIZE = 20, COLS = 25, ROWS = 20;
  const W = COLS * SIZE, H = ROWS * SIZE;
  c.innerHTML = `
    <div style="text-align:center;width:100%">
      <div style="font-family:var(--font-display);margin-bottom:8px;font-size:0.85rem">
        🐍 <span id="sn-ps" style="color:var(--accent)">0</span> pts &nbsp;|&nbsp;
        🤖 <span id="sn-rs" style="color:var(--danger)">0</span> pts
      </div>
      <canvas id="snakeCanvas" width="${W}" height="${H}" style="border:2px solid var(--border);border-radius:8px;max-width:100%"></canvas>
      <div style="color:var(--text3);font-size:0.8rem;margin-top:8px">Flèches / WASD pour bouger</div>
    </div>
  `;

  const canvas = document.getElementById('snakeCanvas');
  const ctx = canvas.getContext('2d');

  let pSnake = [{ x: 5, y: 10 }], pDir = { x: 1, y: 0 }, pScore = 0;
  let rSnake = [{ x: 19, y: 10 }], rDir = { x: -1, y: 0 }, rScore = 0;
  let food = [], running = true;

  function placeFood() {
    while (food.length < 5) {
      const f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
      if (!pSnake.some(s => s.x === f.x && s.y === f.y) &&
          !rSnake.some(s => s.x === f.x && s.y === f.y)) food.push(f);
    }
  }

  function robotAI() {
    if (!food.length) return;
    const head = rSnake[0];
    const target = food.reduce((best, f) =>
      Math.abs(f.x - head.x) + Math.abs(f.y - head.y) < Math.abs(best.x - head.x) + Math.abs(best.y - head.y) ? f : best
    );
    const dirs = [
      { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 }
    ].filter(d => !(d.x === -rDir.x && d.y === -rDir.y)); // no reverse

    const safe = dirs.filter(d => {
      const nx = (head.x + d.x + COLS) % COLS, ny = (head.y + d.y + ROWS) % ROWS;
      return !rSnake.slice(0, -1).some(s => s.x === nx && s.y === ny);
    });
    if (!safe.length) return;
    const best = safe.sort((a, b) => {
      const da = Math.abs((head.x + a.x) - target.x) + Math.abs((head.y + a.y) - target.y);
      const db = Math.abs((head.x + b.x) - target.x) + Math.abs((head.y + b.y) - target.y);
      return da - db;
    })[0];
    rDir = best;
  }

  function moveSnake(snake, dir, score, color) {
    const head = { x: (snake[0].x + dir.x + COLS) % COLS, y: (snake[0].y + dir.y + ROWS) % ROWS };
    if (snake.some(s => s.x === head.x && s.y === head.y)) return { dead: true, score };
    snake.unshift(head);
    const fi = food.findIndex(f => f.x === head.x && f.y === head.y);
    if (fi >= 0) { food.splice(fi, 1); placeFood(); score++; }
    else snake.pop();
    return { dead: false, score };
  }

  let pNextDir = { ...pDir };
  document.addEventListener('keydown', e => {
    const map = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 }
    };
    const d = map[e.key];
    if (d && !(d.x === -pDir.x && d.y === -pDir.y)) { pNextDir = d; e.preventDefault(); }
  });

  // Touch support
  let touchStart = null;
  canvas.addEventListener('touchstart', e => { touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY }; });
  canvas.addEventListener('touchend', e => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      pNextDir = dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 };
    } else {
      pNextDir = dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 };
    }
    touchStart = null;
  });

  function draw() {
    ctx.fillStyle = '#080813'; ctx.fillRect(0, 0, W, H);
    // Grid
    ctx.strokeStyle = '#1a1a2e'; ctx.lineWidth = 0.5;
    for (let x = 0; x <= W; x += SIZE) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y <= H; y += SIZE) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    // Food
    food.forEach(f => {
      ctx.fillStyle = '#ffd700'; ctx.shadowBlur = 8; ctx.shadowColor = '#ffd700';
      ctx.font = `${SIZE - 2}px serif`;
      ctx.fillText('🍎', f.x * SIZE + 1, f.y * SIZE + SIZE - 2);
    });
    ctx.shadowBlur = 0;
    // Player snake
    pSnake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#00ff88' : `rgba(0,255,136,${0.8 - i/pSnake.length*0.5})`;
      ctx.shadowBlur = i === 0 ? 8 : 0; ctx.shadowColor = '#00ff88';
      ctx.fillRect(s.x * SIZE + 1, s.y * SIZE + 1, SIZE - 2, SIZE - 2);
    });
    // Robot snake
    rSnake.forEach((s, i) => {
      ctx.fillStyle = i === 0 ? '#ff4444' : `rgba(255,68,68,${0.8 - i/rSnake.length*0.5})`;
      ctx.shadowBlur = i === 0 ? 8 : 0; ctx.shadowColor = '#ff4444';
      ctx.fillRect(s.x * SIZE + 1, s.y * SIZE + 1, SIZE - 2, SIZE - 2);
    });
    ctx.shadowBlur = 0;
  }

  let ticks = 0;
  placeFood();

  function loop() {
    if (!running) return;
    ticks++;
    if (ticks % 8 === 0) { // Player speed
      pDir = pNextDir;
      const pr = moveSnake(pSnake, pDir, pScore, 'player');
      pScore = pr.score;
      document.getElementById('sn-ps').textContent = pScore;
      if (pr.dead) { running = false; Arena.end(pScore > rScore ? 'win' : 'loss', pScore * 50); return; }
    }
    if (ticks % 10 === 0) { // Robot speed (slightly slower)
      robotAI();
      const rr = moveSnake(rSnake, rDir, rScore, 'robot');
      rScore = rr.score;
      document.getElementById('sn-rs').textContent = rScore;
      if (rr.dead) { running = false; Arena.end('win', pScore * 50 + 200); return; }
    }
    if (pScore >= 15 || rScore >= 15) { running = false; Arena.end(pScore >= rScore ? 'win' : 'loss', pScore * 50); return; }
    draw();
    requestAnimationFrame(loop);
  }
  let rScore = 0;
  loop();
};
