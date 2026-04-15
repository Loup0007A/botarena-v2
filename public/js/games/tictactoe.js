// Tic Tac Toe - Morpion contre IA (minimax)
window.startGame = function() {
  Arena.start();
  let board = Array(9).fill('');
  let gameOver = false;
  let playerScore = 0, robotScore = 0, draws = 0;
  let round = 0, ROUNDS = 3;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:20px;width:100%">
      <div id="ttt-status" style="font-family:var(--font-display);font-size:1rem;color:var(--text2);margin-bottom:16px">Ton tour (✖)</div>
      <div id="ttt-score" style="font-size:0.85rem;color:var(--text3);margin-bottom:12px"></div>
      <div id="ttt-board" style="
        display:grid;grid-template-columns:repeat(3,1fr);
        gap:8px;max-width:300px;margin:0 auto 20px;
      "></div>
      <div id="ttt-msg" style="font-family:var(--font-display);font-size:1.1rem;min-height:32px"></div>
    </div>
  `;

  function renderBoard() {
    const boardEl = document.getElementById('ttt-board');
    boardEl.innerHTML = '';
    board.forEach((cell, i) => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        aspect-ratio:1;font-size:2.2rem;border-radius:8px;
        background:var(--surface);border:2px solid var(--border);
        cursor:${cell || gameOver ? 'default' : 'pointer'};
        color:${cell === 'X' ? 'var(--accent)' : 'var(--accent3)'};
        transition:all 0.15s;
      `;
      btn.textContent = cell || '';
      if (!cell && !gameOver) {
        btn.onmouseenter = () => btn.style.borderColor = 'var(--accent)';
        btn.onmouseleave = () => btn.style.borderColor = 'var(--border)';
        btn.onclick = () => playerMove(i);
      }
      boardEl.appendChild(btn);
    });
    document.getElementById('ttt-score').textContent = `✖ ${playerScore} | Nul ${draws} | 🤖 ${robotScore}  (Round ${round+1}/${ROUNDS})`;
  }

  function checkWin(b, p) {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    return wins.some(([a,b_,c]) => b[a] === p && b[b_] === p && b[c] === p);
  }

  function minimax(b, isMax, depth) {
    if (checkWin(b, 'O')) return 10 - depth;
    if (checkWin(b, 'X')) return depth - 10;
    if (b.every(c => c)) return 0;
    if (depth > 6) return 0;
    const moves = b.map((c,i) => c ? -1 : i).filter(i => i >= 0);
    if (isMax) {
      let best = -Infinity;
      moves.forEach(i => { b[i] = 'O'; best = Math.max(best, minimax(b, false, depth+1)); b[i] = ''; });
      return best;
    } else {
      let best = Infinity;
      moves.forEach(i => { b[i] = 'X'; best = Math.min(best, minimax(b, true, depth+1)); b[i] = ''; });
      return best;
    }
  }

  function robotMove() {
    let best = -Infinity, bestMove = -1;
    board.forEach((c, i) => {
      if (!c) {
        board[i] = 'O';
        const score = minimax(board, false, 0);
        board[i] = '';
        if (score > best) { best = score; bestMove = i; }
      }
    });
    if (bestMove >= 0) {
      board[bestMove] = 'O';
      renderBoard();
      if (checkWin(board, 'O')) { endRound('robot'); return; }
      if (board.every(c => c)) { endRound('draw'); return; }
      document.getElementById('ttt-status').textContent = 'Ton tour (✖)';
      gameOver = false;
    }
  }

  function playerMove(i) {
    if (gameOver || board[i]) return;
    board[i] = 'X';
    renderBoard();
    if (checkWin(board, 'X')) { endRound('player'); return; }
    if (board.every(c => c)) { endRound('draw'); return; }
    gameOver = true;
    document.getElementById('ttt-status').textContent = '🤖 Le robot réfléchit...';
    setTimeout(robotMove, 400 + Math.random() * 400);
  }

  function endRound(winner) {
    gameOver = true;
    if (winner === 'player') { playerScore++; document.getElementById('ttt-msg').innerHTML = `<span style="color:var(--accent)">🏆 Tu gagnes ce round !</span>`; }
    else if (winner === 'robot') { robotScore++; document.getElementById('ttt-msg').innerHTML = `<span style="color:var(--danger)">🤖 Robot gagne ce round</span>`; }
    else { draws++; document.getElementById('ttt-msg').innerHTML = `<span style="color:var(--warn)">🤝 Égalité</span>`; }
    round++;
    if (round >= ROUNDS) {
      setTimeout(() => {
        const res = playerScore > robotScore ? 'win' : playerScore < robotScore ? 'loss' : 'draw';
        Arena.end(res, playerScore * 200);
      }, 1500);
    } else {
      setTimeout(() => {
        board = Array(9).fill('');
        gameOver = false;
        document.getElementById('ttt-msg').textContent = '';
        document.getElementById('ttt-status').textContent = 'Ton tour (✖)';
        renderBoard();
      }, 1500);
    }
  }

  renderBoard();
};
