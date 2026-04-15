// Maze Runner - Sors du labyrinthe avant le robot
window.startGame = function() {
  Arena.start();
  const ROWS = 15, COLS = 19, CS = 28;
  const W = COLS * CS, H = ROWS * CS;

  // Generate maze using recursive backtracker
  const walls = Array.from({ length: ROWS }, () => Array.from({ length: COLS }, () => ({ n: true, s: true, e: true, w: true })));
  function carve(r, c, visited) {
    visited[r][c] = true;
    const dirs = [[-1,0,'n','s'],[1,0,'s','n'],[0,1,'e','w'],[0,-1,'w','e']].sort(() => Math.random()-0.5);
    for (const [dr, dc, d1, d2] of dirs) {
      const nr = r+dr, nc = c+dc;
      if (nr>=0 && nr<ROWS && nc>=0 && nc<COLS && !visited[nr][nc]) {
        walls[r][c][d1] = false; walls[nr][nc][d2] = false;
        carve(nr, nc, visited);
      }
    }
  }
  carve(0, 0, Array.from({ length: ROWS }, () => Array(COLS).fill(false)));

  let px = 0, py = 0, running = true;
  // Robot BFS path
  let robotPath = [], robotPos = 0, rr = 0, rc = 0;
  function bfs(sr, sc, er, ec) {
    const dist = Array.from({ length: ROWS }, () => Array(COLS).fill(-1));
    const prev = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    const q = [[sr, sc]]; dist[sr][sc] = 0;
    while (q.length) {
      const [r, c] = q.shift();
      if (r === er && c === ec) {
        const path = []; let cur = [r, c];
        while (cur) { path.unshift(cur); cur = prev[cur[0]][cur[1]]; }
        return path;
      }
      const moves = [[-1,0,'n'],[1,0,'s'],[0,1,'e'],[0,-1,'w']];
      for (const [dr,dc,d] of moves) {
        const nr=r+dr, nc=c+dc;
        if (nr>=0&&nr<ROWS&&nc>=0&&nc<COLS&&!walls[r][c][d]&&dist[nr][nc]===-1) {
          dist[nr][nc]=dist[r][c]+1; prev[nr][nc]=[r,c]; q.push([nr,nc]);
        }
      }
    }
    return [];
  }
  robotPath = bfs(0, 0, ROWS-1, COLS-1);

  const c = Arena.getContainer();
  c.innerHTML = `<canvas id="mazeCanvas" style="border:2px solid var(--border);border-radius:8px;background:#080813;display:block;max-width:100%"></canvas>
  <div style="color:var(--text3);font-size:0.78rem;margin-top:6px">Flèches / WASD pour bouger | Atteins 🏁</div>`;
  const canvas = document.getElementById('mazeCanvas');
  const ctx = canvas.getContext('2d');
  canvas.width = W; canvas.height = H;

  function draw() {
    ctx.fillStyle = '#080813'; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(0,200,255,0.4)'; ctx.lineWidth = 1.5;
    for (let r = 0; r < ROWS; r++) {
      for (let c2 = 0; c2 < COLS; c2++) {
        const x = c2*CS, y = r*CS;
        if (walls[r][c2].n) { ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+CS,y); ctx.stroke(); }
        if (walls[r][c2].s) { ctx.beginPath(); ctx.moveTo(x,y+CS); ctx.lineTo(x+CS,y+CS); ctx.stroke(); }
        if (walls[r][c2].w) { ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x,y+CS); ctx.stroke(); }
        if (walls[r][c2].e) { ctx.beginPath(); ctx.moveTo(x+CS,y); ctx.lineTo(x+CS,y+CS); ctx.stroke(); }
      }
    }
    // Goal
    ctx.font = `${CS-4}px serif`; ctx.textAlign = 'center';
    ctx.fillText('🏁', (COLS-1)*CS+CS/2, (ROWS-1)*CS+CS-4);
    // Robot
    ctx.fillStyle = '#ff4444'; ctx.shadowBlur = 8; ctx.shadowColor = '#ff4444';
    ctx.font = `${CS-4}px serif`;
    ctx.fillText('🤖', rc*CS+CS/2, rr*CS+CS-2);
    // Player
    ctx.fillText('😊', px*CS+CS/2, py*CS+CS-2);
    ctx.shadowBlur = 0;
  }

  document.addEventListener('keydown', e => {
    if (!running) return;
    const moves = { ArrowUp:[- 1,0,'n'], ArrowDown:[1,0,'s'], ArrowLeft:[0,-1,'w'], ArrowRight:[0,1,'e'], w:[-1,0,'n'], s:[1,0,'s'], a:[0,-1,'w'], d:[0,1,'e'] };
    const m = moves[e.key];
    if (m) {
      e.preventDefault();
      const [dr, dc, dir] = m;
      if (!walls[py][px][dir]) {
        py += dr; px += dc;
        if (py === ROWS-1 && px === COLS-1) { running = false; Arena.end('win', 600); }
      }
      draw();
    }
  });

  // Robot moves every 300ms
  setInterval(() => {
    if (!running) return;
    robotPos = Math.min(robotPos + 1, robotPath.length - 1);
    [rr, rc] = robotPath[robotPos];
    if (rr === ROWS-1 && rc === COLS-1 && running) { running = false; Arena.end('loss', 100); }
    draw();
  }, 300);

  draw();
};
