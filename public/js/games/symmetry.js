// Symmetry Bot - Complète le dessin symétrique
window.startGame = function() {
  Arena.start();
  const SIZE = 8;
  const CS = 32;
  let score = 0, round = 0;
  const ROUNDS = 5;
  let target = [], partial = [], userInput = [];
  let timerInterval, timeLeft;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:20px;width:100%;max-width:520px">
      <div style="font-family:var(--font-display);margin-bottom:10px">
        Score: <span id="sy-s" style="color:var(--accent)">0</span>
        &nbsp;|&nbsp; Round <span id="sy-r">1</span>/${ROUNDS}
      </div>
      <div id="sy-timer" style="font-family:var(--font-display);font-size:1.1rem;color:var(--warn);margin-bottom:12px">⏱ 25s</div>
      <p style="color:var(--text2);font-size:0.85rem;margin-bottom:12px">
        Complète la <span style="color:var(--accent)">moitié droite</span> pour créer la symétrie verticale
      </p>
      <div style="display:flex;gap:0;justify-content:center;align-items:center">
        <div>
          <div style="color:var(--text3);font-size:0.75rem;margin-bottom:4px">GAUCHE (modèle)</div>
          <canvas id="sy-left" width="${SIZE/2*CS}" height="${SIZE*CS}" style="border:2px solid var(--accent);border-radius:8px 0 0 8px"></canvas>
        </div>
        <div style="width:2px;height:${SIZE*CS}px;background:rgba(255,255,255,0.3)"></div>
        <div>
          <div style="color:var(--text3);font-size:0.75rem;margin-bottom:4px">DROITE (à compléter)</div>
          <canvas id="sy-right" width="${SIZE/2*CS}" height="${SIZE*CS}" style="border:2px solid var(--border);border-radius:0 8px 8px 0;cursor:crosshair"></canvas>
        </div>
      </div>
      <div style="display:flex;gap:10px;justify-content:center;margin-top:12px">
        <button id="sy-submit" class="btn-primary" style="padding:10px 24px">✅ Valider</button>
        <button id="sy-clear" class="btn-secondary" style="padding:10px 18px">🗑 Reset</button>
      </div>
      <div id="sy-fb" style="font-family:var(--font-display);margin-top:10px;min-height:24px"></div>
    </div>
  `;

  const COLOR_ON = '#00c8ff';
  const COLOR_OFF = '#1a1a30';
  let isDrawing = false;

  function drawHalf(canvas, grid, half, editable = false) {
    const ctx = canvas.getContext('2d');
    const half_size = SIZE / 2;
    ctx.fillStyle = COLOR_OFF;
    ctx.fillRect(0, 0, half_size*CS, SIZE*CS);
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < half_size; col++) {
        const idx = row * SIZE + (half === 'left' ? col : col + half_size);
        if (grid[idx]) {
          ctx.fillStyle = editable ? '#00ff88' : COLOR_ON;
          ctx.shadowBlur = 4; ctx.shadowColor = editable ? '#00ff88' : COLOR_ON;
        } else {
          ctx.fillStyle = COLOR_OFF;
          ctx.shadowBlur = 0;
        }
        ctx.fillRect(col*CS+1, row*CS+1, CS-2, CS-2);
      }
    }
    ctx.shadowBlur = 0;
    // Grid
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 0.5;
    for (let i = 0; i <= half_size; i++) {
      ctx.beginPath(); ctx.moveTo(i*CS,0); ctx.lineTo(i*CS, SIZE*CS); ctx.stroke();
    }
    for (let i = 0; i <= SIZE; i++) {
      ctx.beginPath(); ctx.moveTo(0, i*CS); ctx.lineTo(half_size*CS, i*CS); ctx.stroke();
    }
  }

  function getCell(e, canvas) {
    const r = canvas.getBoundingClientRect();
    const x = (e.clientX - r.left) / (r.width / (SIZE/2*CS));
    const y = (e.clientY - r.top) / (r.height / (SIZE*CS));
    const col = Math.floor(x / CS) + SIZE/2;
    const row = Math.floor(y / CS);
    if (col < SIZE/2 || col >= SIZE || row < 0 || row >= SIZE) return -1;
    return row * SIZE + col;
  }

  function paintCell(e) {
    const idx = getCell(e, document.getElementById('sy-right'));
    if (idx < 0) return;
    userInput[idx] = !userInput[idx];
    const combined = [...partial];
    userInput.forEach((v, i) => { if (v) combined[i] = true; });
    drawHalf(document.getElementById('sy-right'), combined, 'right', true);
  }

  const right = document.getElementById('sy-right');
  right.onmousedown = e => { isDrawing = true; paintCell(e); };
  right.onmousemove = e => { if (isDrawing) paintCell(e); };
  right.onmouseup = () => isDrawing = false;
  right.onmouseleave = () => isDrawing = false;

  document.getElementById('sy-clear').onclick = () => {
    userInput = Array(SIZE*SIZE).fill(false);
    drawHalf(right, partial, 'right', true);
  };

  document.getElementById('sy-submit').onclick = submit;

  function submit() {
    clearInterval(timerInterval);
    // Compare userInput to expected right half of target
    let correct = 0, total = 0;
    for (let row = 0; row < SIZE; row++) {
      for (let col = SIZE/2; col < SIZE; col++) {
        const idx = row * SIZE + col;
        total++;
        const expected = target[idx];
        const got = userInput[idx] || false;
        if (!!expected === !!got) correct++;
      }
    }
    const pct = Math.round(correct / total * 100);
    const pts = Math.round(pct * (1 + timeLeft/25));
    score += pts;
    document.getElementById('sy-s').textContent = score;

    if (pct >= 80) {
      document.getElementById('sy-fb').innerHTML = `<span style="color:var(--accent)">✅ ${pct}% ! +${pts} pts</span>`;
    } else {
      document.getElementById('sy-fb').innerHTML = `<span style="color:var(--warn)">⚠️ ${pct}% — +${pts} pts</span>`;
    }

    round++;
    if (round >= ROUNDS) {
      setTimeout(() => Arena.end(score >= 250 ? 'win' : 'loss', score), 1500);
    } else {
      setTimeout(startRound, 1500);
    }
  }

  function startRound() {
    document.getElementById('sy-r').textContent = round + 1;
    document.getElementById('sy-fb').textContent = '';
    userInput = Array(SIZE*SIZE).fill(false);

    // Generate symmetric pattern
    target = Array(SIZE*SIZE).fill(false);
    for (let row = 0; row < SIZE; row++) {
      for (let col = 0; col < SIZE/2; col++) {
        if (Math.random() > 0.5) {
          target[row*SIZE + col] = true;
          target[row*SIZE + (SIZE-1-col)] = true; // mirror
        }
      }
    }

    partial = [...target];
    // Clear right half from partial (that's what user fills in)
    for (let row = 0; row < SIZE; row++) {
      for (let col = SIZE/2; col < SIZE; col++) {
        partial[row*SIZE + col] = false;
      }
    }

    drawHalf(document.getElementById('sy-left'), target, 'left');
    drawHalf(document.getElementById('sy-right'), partial, 'right', true);

    timeLeft = 25;
    clearInterval(timerInterval);
    document.getElementById('sy-timer').textContent = `⏱ ${timeLeft}s`;
    timerInterval = setInterval(() => {
      timeLeft--;
      document.getElementById('sy-timer').textContent = `⏱ ${timeLeft}s`;
      if (timeLeft <= 0) { clearInterval(timerInterval); submit(); }
    }, 1000);
  }

  startRound();
};
