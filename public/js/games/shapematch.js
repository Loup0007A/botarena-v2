// Shape Match - Associe les formes plus vite que le robot
window.startGame = function() {
  Arena.start();
  let score = 0, robotScore = 0, round = 0;
  const ROUNDS = 12;
  const ROBOT_TIME = 2500;
  let robotTimer = null;

  const SHAPES = [
    { name: 'Cercle', draw: (ctx, x, y, s, col) => { ctx.beginPath(); ctx.arc(x+s/2, y+s/2, s/2-4, 0, Math.PI*2); ctx.fillStyle = col; ctx.fill(); } },
    { name: 'Carré', draw: (ctx, x, y, s, col) => { ctx.fillStyle = col; ctx.fillRect(x+4, y+4, s-8, s-8); } },
    { name: 'Triangle', draw: (ctx, x, y, s, col) => { ctx.beginPath(); ctx.moveTo(x+s/2, y+4); ctx.lineTo(x+s-4, y+s-4); ctx.lineTo(x+4, y+s-4); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); } },
    { name: 'Losange', draw: (ctx, x, y, s, col) => { ctx.beginPath(); ctx.moveTo(x+s/2, y+4); ctx.lineTo(x+s-4, y+s/2); ctx.lineTo(x+s/2, y+s-4); ctx.lineTo(x+4, y+s/2); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); } },
    { name: 'Étoile', draw: (ctx, x, y, s, col) => {
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a1 = (i * 4 * Math.PI / 5) - Math.PI/2;
        const a2 = ((i * 4 + 2) * Math.PI / 5) - Math.PI/2;
        const r = s/2 - 4, ri = r * 0.4;
        const cx = x + s/2, cy = y + s/2;
        if (i === 0) ctx.moveTo(cx + r*Math.cos(a1), cy + r*Math.sin(a1));
        else ctx.lineTo(cx + r*Math.cos(a1), cy + r*Math.sin(a1));
        ctx.lineTo(cx + ri*Math.cos(a2), cy + ri*Math.sin(a2));
      }
      ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    }},
    { name: 'Hexagone', draw: (ctx, x, y, s, col) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI / 3) - Math.PI/6;
        const r = s/2 - 4, cx = x+s/2, cy = y+s/2;
        if (i === 0) ctx.moveTo(cx + r*Math.cos(a), cy + r*Math.sin(a));
        else ctx.lineTo(cx + r*Math.cos(a), cy + r*Math.sin(a));
      }
      ctx.closePath(); ctx.fillStyle = col; ctx.fill();
    }},
  ];

  const COLORS = ['#00ff88','#ff4444','#00c8ff','#ffa500','#ff00aa','#ffff00'];

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:20px;width:100%;max-width:480px">
      <div style="display:flex;justify-content:space-around;font-family:var(--font-display);margin-bottom:12px">
        <span>👤 <span id="sm-ps" style="color:var(--accent)">0</span></span>
        <span style="color:var(--text3)">Round <span id="sm-r">1</span>/${ROUNDS}</span>
        <span>🤖 <span id="sm-rs" style="color:var(--danger)">0</span></span>
      </div>
      <div id="sm-bar-wrap" style="height:4px;background:var(--border);border-radius:2px;margin-bottom:16px;overflow:hidden">
        <div id="sm-bar" style="height:100%;background:var(--accent);width:100%"></div>
      </div>
      <p style="color:var(--text3);font-size:0.85rem;margin-bottom:12px">Clique sur la forme <strong id="sm-target-label" style="color:var(--accent)"></strong></p>
      <div id="sm-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;max-width:300px;margin:0 auto"></div>
      <div id="sm-fb" style="font-family:var(--font-display);margin-top:14px;min-height:28px"></div>
    </div>
  `;

  function drawShape(shape, color, size = 70) {
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    shape.draw(ctx, 0, 0, size, color);
    return canvas;
  }

  function showQuestion() {
    round++;
    document.getElementById('sm-r').textContent = round;
    document.getElementById('sm-fb').textContent = '';

    // Pick target
    const targetShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    const targetColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    document.getElementById('sm-target-label').textContent = targetShape.name;
    document.getElementById('sm-target-label').style.color = targetColor;

    // Build 6 shapes (3x2 grid): one correct, rest random
    const items = [{ shape: targetShape, color: targetColor, correct: true }];
    while (items.length < 6) {
      const s = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const col = COLORS[Math.floor(Math.random() * COLORS.length)];
      // Avoid exact duplicate of target
      if (!(s === targetShape && col === targetColor)) {
        items.push({ shape: s, color: col, correct: false });
      }
    }
    items.sort(() => Math.random() - 0.5);

    const grid = document.getElementById('sm-grid');
    grid.innerHTML = '';
    let answered = false;

    items.forEach(({ shape, color, correct }) => {
      const cell = document.createElement('div');
      cell.style.cssText = `
        border-radius:10px;background:var(--surface);border:2px solid var(--border);
        cursor:pointer;transition:all 0.15s;display:flex;align-items:center;justify-content:center;padding:8px;
      `;
      cell.appendChild(drawShape(shape, color));
      cell.onmouseenter = () => { if (!answered) cell.style.borderColor = 'var(--accent2)'; };
      cell.onmouseleave = () => { if (!answered) cell.style.borderColor = 'var(--border)'; };
      cell.onclick = () => {
        if (answered) return;
        answered = true;
        clearTimeout(robotTimer);
        if (correct) {
          score++;
          document.getElementById('sm-ps').textContent = score;
          document.getElementById('sm-fb').innerHTML = `<span style="color:var(--accent)">✅ ${targetShape.name} !</span>`;
          cell.style.borderColor = 'var(--accent)'; cell.style.background = 'rgba(0,255,136,0.1)';
        } else {
          robotScore++;
          document.getElementById('sm-rs').textContent = robotScore;
          document.getElementById('sm-fb').innerHTML = `<span style="color:var(--danger)">❌ Ce n'est pas ${targetShape.name}</span>`;
          cell.style.borderColor = 'var(--danger)';
        }
        setTimeout(round < ROUNDS ? showQuestion : endGame, 900);
      };
      grid.appendChild(cell);
    });

    const bar = document.getElementById('sm-bar');
    bar.style.transition = 'none'; bar.style.width = '100%';
    requestAnimationFrame(() => { bar.style.transition = `width ${ROBOT_TIME}ms linear`; bar.style.width = '0%'; });

    robotTimer = setTimeout(() => {
      if (!answered) {
        answered = true;
        robotScore++;
        document.getElementById('sm-rs').textContent = robotScore;
        document.getElementById('sm-fb').innerHTML = `<span style="color:var(--danger)">🤖 Robot plus rapide !</span>`;
        setTimeout(round < ROUNDS ? showQuestion : endGame, 900);
      }
    }, ROBOT_TIME);
  }

  function endGame() {
    const result = score > robotScore ? 'win' : score < robotScore ? 'loss' : 'draw';
    Arena.end(result, score * 100);
  }

  showQuestion();
};
