// Simon Bot - Répète la séquence
window.startGame = function() {
  Arena.start();
  const COLORS = [
    { id: 0, color: '#ff4444', shadow: '#ff000088', label: '🔴' },
    { id: 1, color: '#00ff88', shadow: '#00ff8888', label: '🟢' },
    { id: 2, color: '#00c8ff', shadow: '#00c8ff88', label: '🔵' },
    { id: 3, color: '#ffa500', shadow: '#ffa50088', label: '🟡' }
  ];
  let sequence = [], playerSeq = [], level = 0, canClick = false;
  let robotLevel = 0;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:20px;width:100%;max-width:420px">
      <div style="font-family:var(--font-display);margin-bottom:12px">
        <span style="color:var(--accent)">Niveau <span id="sb-level">1</span></span>
        &nbsp;|&nbsp;
        <span style="color:var(--danger)">Robot: niveau <span id="sb-rl">0</span></span>
      </div>
      <div id="sb-msg" style="color:var(--text2);font-size:0.9rem;margin-bottom:16px">Observe la séquence...</div>
      <div id="sb-grid" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:280px;margin:0 auto 20px"></div>
    </div>
  `;

  function renderGrid(activeId = -1) {
    const grid = document.getElementById('sb-grid');
    grid.innerHTML = '';
    COLORS.forEach(col => {
      const btn = document.createElement('div');
      btn.style.cssText = `
        height:110px;border-radius:12px;cursor:${canClick ? 'pointer' : 'default'};
        background:${activeId === col.id ? col.color : col.color + '33'};
        border:3px solid ${col.color};transition:all 0.15s;
        display:flex;align-items:center;justify-content:center;font-size:2.5rem;
        ${activeId === col.id ? `box-shadow:0 0 30px ${col.shadow};transform:scale(1.05)` : ''}
      `;
      btn.textContent = col.label;
      if (canClick) {
        btn.onclick = () => playerClick(col.id);
        btn.onmouseenter = () => { btn.style.background = col.color + '88'; };
        btn.onmouseleave = () => { btn.style.background = col.color + '33'; };
      }
      grid.appendChild(btn);
    });
  }

  function playSequence(seq, onDone) {
    canClick = false; renderGrid();
    let i = 0;
    function next() {
      if (i >= seq.length) { setTimeout(onDone, 400); return; }
      renderGrid(seq[i]);
      setTimeout(() => { renderGrid(); setTimeout(() => { i++; next(); }, 300); }, 600);
    }
    setTimeout(next, 500);
  }

  function nextLevel() {
    level++;
    sequence.push(Math.floor(Math.random() * 4));
    document.getElementById('sb-level').textContent = level;
    document.getElementById('sb-msg').textContent = 'Observe la séquence...';
    playSequence(sequence, () => {
      canClick = true;
      playerSeq = [];
      document.getElementById('sb-msg').textContent = 'À toi ! Répète la séquence.';
      renderGrid();
    });
  }

  function playerClick(id) {
    if (!canClick) return;
    playerSeq.push(id);
    renderGrid(id);
    setTimeout(() => renderGrid(), 200);

    const pos = playerSeq.length - 1;
    if (playerSeq[pos] !== sequence[pos]) {
      canClick = false;
      document.getElementById('sb-msg').innerHTML = `<span style="color:var(--danger)">❌ Erreur au niveau ${level} !</span>`;
      // Robot advances
      robotLevel = level;
      document.getElementById('sb-rl').textContent = robotLevel;
      setTimeout(() => Arena.end('loss', level * 100), 1500);
      return;
    }

    if (playerSeq.length === sequence.length) {
      canClick = false;
      document.getElementById('sb-msg').innerHTML = `<span style="color:var(--accent)">✅ Parfait ! Niveau suivant...</span>`;
      // Robot "fails" at level+2 (gives player a chance)
      robotLevel = level - 1;
      document.getElementById('sb-rl').textContent = Math.max(0, robotLevel);
      if (level >= 10) {
        setTimeout(() => Arena.end('win', level * 150), 1000);
      } else {
        setTimeout(nextLevel, 1200);
      }
    }
  }

  renderGrid();
  nextLevel();
};
