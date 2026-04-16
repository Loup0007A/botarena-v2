// Which Changed? - Repère ce qui a changé sur la grille
window.startGame = function() {
  Arena.start();
  const EMOJIS = ['🤖','👾','🦾','🎮','⚡','🔥','💎','🏆','🚀','🎯','🌈','🎪','🔑','🍕','🐱','🌙'];
  let score = 0, round = 0;
  const ROUNDS = 8;
  const GRID_SIZE = 9;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:20px;width:100%;max-width:480px">
      <div style="font-family:var(--font-display);margin-bottom:12px">
        Score: <span id="wc-s" style="color:var(--accent)">0</span>
        &nbsp;|&nbsp; Round <span id="wc-r">1</span>/${ROUNDS}
      </div>
      <div id="wc-msg" style="color:var(--text2);margin-bottom:16px;min-height:24px">Mémorise la grille !</div>
      <div id="wc-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:300px;margin:0 auto"></div>
      <div id="wc-timer" style="font-family:var(--font-display);font-size:0.85rem;color:var(--text3);margin-top:12px"></div>
    </div>
  `;

  function renderGrid(items, onClick = null) {
    const grid = document.getElementById('wc-grid');
    grid.innerHTML = '';
    items.forEach((emoji, i) => {
      const el = document.createElement('div');
      el.style.cssText = `
        width:88px;height:88px;border-radius:12px;
        background:var(--surface);border:2px solid var(--border);
        display:flex;align-items:center;justify-content:center;
        font-size:2.8rem;
        cursor:${onClick ? 'pointer' : 'default'};
        transition:all 0.15s;
      `;
      el.textContent = emoji;
      if (onClick) {
        el.onmouseenter = () => el.style.borderColor = 'var(--accent)';
        el.onmouseleave = () => el.style.borderColor = 'var(--border)';
        el.onclick = () => onClick(i, el);
      }
      grid.appendChild(el);
    });
  }

  function runRound() {
    round++;
    document.getElementById('wc-r').textContent = round;
    document.getElementById('wc-msg').textContent = 'Mémorise la grille !';
    document.getElementById('wc-timer').textContent = '';

    // Generate original grid
    const base = Array.from({ length: GRID_SIZE }, () =>
      EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
    );
    renderGrid(base);

    // After 2.5s, change one element
    setTimeout(() => {
      const changedIdx = Math.floor(Math.random() * GRID_SIZE);
      const changed = [...base];
      let newEmoji;
      do { newEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]; }
      while (newEmoji === base[changedIdx]);
      changed[changedIdx] = newEmoji;

      document.getElementById('wc-msg').textContent = 'Quelle case a changé ?';

      // Robot reacts after 1500-3000ms
      const robotDelay = 1500 + Math.random() * 1500;
      let answered = false;

      const robotTimer = setTimeout(() => {
        if (!answered) {
          answered = true;
          document.getElementById('wc-msg').innerHTML = `<span style="color:var(--danger)">🤖 Le robot a trouvé en premier !</span>`;
          // Highlight correct
          document.getElementById('wc-grid').children[changedIdx].style.borderColor = 'var(--danger)';
          document.getElementById('wc-grid').children[changedIdx].style.background = 'rgba(255,68,68,0.2)';
          setTimeout(round < ROUNDS ? runRound : () => Arena.end(score > ROUNDS/2 ? 'win' : 'loss', score * 100), 1200);
        }
      }, robotDelay);

      renderGrid(changed, (i, el) => {
        if (answered) return;
        answered = true;
        clearTimeout(robotTimer);
        if (i === changedIdx) {
          score++;
          document.getElementById('wc-s').textContent = score;
          el.style.borderColor = 'var(--accent)';
          el.style.background = 'rgba(0,255,136,0.2)';
          document.getElementById('wc-msg').innerHTML = `<span style="color:var(--accent)">✅ Trouvé !</span>`;
        } else {
          el.style.borderColor = 'var(--danger)';
          el.style.background = 'rgba(255,68,68,0.2)';
          document.getElementById('wc-grid').children[changedIdx].style.borderColor = 'var(--accent)';
          document.getElementById('wc-msg').innerHTML = `<span style="color:var(--danger)">❌ C'était là !</span>`;
        }
        setTimeout(round < ROUNDS ? runRound : () => Arena.end(score > ROUNDS/2 ? 'win' : 'loss', score * 100), 1200);
      });
    }, 2500);
  }

  runRound();
};
