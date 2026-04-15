// Connect-R - Puissance 4
window.startGame = function() {
  Arena.start();
  const ROWS = 6, COLS = 7;
  let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  let gameOver = false, playerTurn = true;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:16px;width:100%">
      <div id="c4-msg" style="font-family:var(--font-display);color:var(--text2);margin-bottom:12px;font-size:0.95rem">Ton tour 🔴</div>
      <div id="c4-board" style="display:inline-block;background:var(--surface2);border-radius:12px;padding:10px;border:2px solid var(--border)"></div>
    </div>
  `;

  function render() {
    const boardEl = document.getElementById('c4-board');
    boardEl.innerHTML = '';
    // Column click headers
    const headers = document.createElement('div');
    headers.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:6px;margin-bottom:4px';
    for (let col = 0; col < COLS; col++) {
      const btn = document.createElement('div');
      btn.style.cssText = 'height:24px;border-radius:6px;cursor:pointer;color:var(--accent);font-size:1rem;display:flex;align-items:center;justify-content:center;transition:background 0.15s';
      btn.textContent = '▼';
      if (!gameOver && playerTurn) {
        btn.onclick = () => drop(col);
        btn.onmouseenter = () => { btn.style.background = 'rgba(0,255,136,0.15)'; };
        btn.onmouseleave = () => { btn.style.background = ''; };
      }
      headers.appendChild(btn);
    }
    boardEl.appendChild(headers);

    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);gap:6px';
    for (let r = 0; r < ROWS; r++) {
      for (let col = 0; col < COLS; col++) {
        const cell = document.createElement('div');
        const val = board[r][col];
        cell.style.cssText = `
          width:44px;height:44px;border-radius:50%;
          background:${val === 1 ? '#ff4444' : val === 2 ? '#00c8ff' : 'var(--bg3)'};
          border:2px solid ${val === 1 ? '#ff666688' : val === 2 ? '#00c8ff88' : 'var(--border)'};
          transition:all 0.2s;
          ${val ? `box-shadow:0 0 8px ${val === 1 ? '#ff444466' : '#00c8ff66'}` : ''}
        `;
        grid.appendChild(cell);
      }
    }
    boardEl.appendChild(grid);
  }

  function drop(col) {
    if (gameOver || !playerTurn) return;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!board[r][col]) {
        board[r][col] = 1;
        render();
        if (checkWin(1)) { endGame('win'); return; }
        if (isFull()) { endGame('draw'); return; }
        playerTurn = false;
        document.getElementById('c4-msg').textContent = '🤖 Robot réfléchit...';
        setTimeout(robotMove, 600);
        return;
      }
    }
  }

  function robotMove() {
    // Try to win, else block, else best score
    const col = getBestMove();
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!board[r][col]) { board[r][col] = 2; break; }
    }
    render();
    if (checkWin(2)) { endGame('loss'); return; }
    if (isFull()) { endGame('draw'); return; }
    playerTurn = true;
    document.getElementById('c4-msg').textContent = 'Ton tour 🔴';
  }

  function getBestMove() {
    // Check winning move for robot
    for (let col = 0; col < COLS; col++) {
      if (canPlace(col)) { place(col, 2); if (checkWin(2)) { unplace(col); return col; } unplace(col); }
    }
    // Block player
    for (let col = 0; col < COLS; col++) {
      if (canPlace(col)) { place(col, 1); if (checkWin(1)) { unplace(col); return col; } unplace(col); }
    }
    // Center preference
    const order = [3, 2, 4, 1, 5, 0, 6];
    for (const col of order) { if (canPlace(col)) return col; }
    return 0;
  }

  function canPlace(col) { return board[0][col] === 0; }
  function place(col, p) { for (let r = ROWS-1; r >= 0; r--) { if (!board[r][col]) { board[r][col] = p; return; } } }
  function unplace(col) { for (let r = 0; r < ROWS; r++) { if (board[r][col]) { board[r][col] = 0; return; } } }

  function checkWin(p) {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c] !== p) continue;
        if (c+3 < COLS && board[r][c+1]===p && board[r][c+2]===p && board[r][c+3]===p) return true;
        if (r+3 < ROWS && board[r+1][c]===p && board[r+2][c]===p && board[r+3][c]===p) return true;
        if (r+3 < ROWS && c+3 < COLS && board[r+1][c+1]===p && board[r+2][c+2]===p && board[r+3][c+3]===p) return true;
        if (r+3 < ROWS && c-3 >= 0 && board[r+1][c-1]===p && board[r+2][c-2]===p && board[r+3][c-3]===p) return true;
      }
    }
    return false;
  }
  function isFull() { return board[0].every(c => c !== 0); }

  function endGame(result) {
    gameOver = true;
    const msgs = { win: '🏆 Tu as gagné !', loss: '🤖 Le robot gagne', draw: '🤝 Égalité !' };
    document.getElementById('c4-msg').innerHTML = `<span style="color:${result==='win'?'var(--accent)':result==='loss'?'var(--danger)':'var(--warn)'}">${msgs[result]}</span>`;
    setTimeout(() => Arena.end(result, result === 'win' ? 400 : 0), 1500);
  }

  render();
};
