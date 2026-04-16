// Path Recall - Mémorise et rejoue le chemin
window.startGame = function() {
  Arena.start();
  const GRID = 4;
  let level = 0, score = 0;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:20px;width:100%;max-width:420px">
      <div style="font-family:var(--font-display);margin-bottom:12px">
        Niveau <span id="pr-l" style="color:var(--accent)">1</span> — Score: <span id="pr-s">0</span>
      </div>
      <div id="pr-msg" style="color:var(--text2);margin-bottom:16px;min-height:24px">Mémorise le chemin !</div>
      <div id="pr-grid" style="
        display:grid;
        grid-template-columns:repeat(${GRID},1fr);
        gap:8px;max-width:280px;margin:0 auto;
      "></div>
    </div>
  `;

  function buildGrid(highlighted = [], clickable = false, onCellClick = null) {
    const grid = document.getElementById('pr-grid');
    grid.innerHTML = '';
    for (let i = 0; i < GRID * GRID; i++) {
      const cell = document.createElement('div');
      const isLit = highlighted.includes(i);
      cell.style.cssText = `
        width:60px;height:60px;border-radius:10px;
        background:${isLit ? 'rgba(0,255,136,0.5)' : 'var(--surface)'};
        border:2px solid ${isLit ? 'var(--accent)' : 'var(--border)'};
        cursor:${clickable ? 'pointer' : 'default'};
        transition:all 0.2s;
        ${isLit ? 'box-shadow:0 0 15px rgba(0,255,136,0.4)' : ''}
      `;
      if (clickable && onCellClick) {
        cell.onmouseenter = () => { cell.style.borderColor = 'var(--accent2)'; cell.style.background = 'rgba(0,200,255,0.15)'; };
        cell.onmouseleave = () => { cell.style.borderColor = 'var(--border)'; cell.style.background = 'var(--surface)'; };
        cell.onclick = () => onCellClick(i, cell);
      }
      grid.appendChild(cell);
    }
  }

  function flashCell(idx, color = 'rgba(0,255,136,0.5)') {
    const cells = document.getElementById('pr-grid').children;
    if (!cells[idx]) return;
    cells[idx].style.background = color;
    cells[idx].style.borderColor = 'var(--accent)';
    cells[idx].style.boxShadow = '0 0 15px rgba(0,255,136,0.4)';
    setTimeout(() => {
      cells[idx].style.background = 'var(--surface)';
      cells[idx].style.borderColor = 'var(--border)';
      cells[idx].style.boxShadow = '';
    }, 350);
  }

  function runLevel() {
    level++;
    const pathLen = level + 2; // starts at 3 steps
    document.getElementById('pr-l').textContent = level;
    document.getElementById('pr-msg').textContent = 'Mémorise le chemin !';

    // Generate random path (no repeats)
    const path = [];
    while (path.length < pathLen) {
      const next = Math.floor(Math.random() * GRID * GRID);
      if (!path.includes(next)) path.push(next);
    }

    buildGrid();

    // Animate path sequentially
    let step = 0;
    function showNext() {
      if (step >= path.length) {
        // Now let player input
        setTimeout(() => {
          document.getElementById('pr-msg').textContent = 'Reproduis le chemin !';
          buildGrid([], true, handleClick);
          let inputPath = [];

          function handleClick(i, cell) {
            inputPath.push(i);
            flashCell(i, 'rgba(0,200,255,0.5)');
            cell.style.borderColor = 'var(--accent2)';

            if (inputPath[inputPath.length - 1] !== path[inputPath.length - 1]) {
              // Wrong
              buildGrid();
              document.getElementById('pr-msg').innerHTML = `<span style="color:var(--danger)">❌ Erreur ! Le chemin était...</span>`;
              // Replay correct path
              let s = 0;
              const replay = setInterval(() => {
                if (s >= path.length) { clearInterval(replay); setTimeout(() => Arena.end(level > 3 ? 'win' : 'loss', score), 1000); return; }
                flashCell(path[s]);
                s++;
              }, 400);
              return;
            }

            if (inputPath.length === path.length) {
              // Correct!
              score += level * 80;
              document.getElementById('pr-s').textContent = score;
              document.getElementById('pr-msg').innerHTML = `<span style="color:var(--accent)">✅ Parfait !</span>`;
              buildGrid(path);
              if (level >= 8) {
                setTimeout(() => Arena.end('win', score), 1000);
              } else {
                setTimeout(runLevel, 1200);
              }
            }
          }
        }, 500);
        return;
      }
      flashCell(path[step]);
      step++;
      setTimeout(showNext, 500);
    }

    setTimeout(showNext, 600);
  }

  buildGrid();
  runLevel();
};
