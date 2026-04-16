// Binary Bot - Convertis en binaire plus vite que l'IA
window.startGame = function() {
  Arena.start();
  let score = 0, robotScore = 0, round = 0;
  const ROUNDS = 10;
  const ROBOT_TIME = 4000;
  let robotTimer = null;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:24px;width:100%;max-width:520px">
      <div style="display:flex;justify-content:space-around;font-family:var(--font-display);margin-bottom:16px">
        <span>👤 <span id="bb-ps" style="color:var(--accent)">0</span></span>
        <span style="color:var(--text3)">Round <span id="bb-r">1</span>/${ROUNDS}</span>
        <span>🤖 <span id="bb-rs" style="color:var(--danger)">0</span></span>
      </div>
      <div id="bb-progress" style="height:4px;background:var(--border);border-radius:2px;margin-bottom:20px;overflow:hidden">
        <div id="bb-bar" style="height:100%;background:var(--warn);width:100%"></div>
      </div>
      <p style="color:var(--text3);font-size:0.85rem;margin-bottom:8px">Convertis ce nombre en binaire :</p>
      <div id="bb-num" style="font-family:var(--font-display);font-size:4rem;color:var(--accent);margin-bottom:20px"></div>
      <div id="bb-choices" style="display:flex;flex-direction:column;gap:10px;max-width:380px;margin:0 auto"></div>
      <div id="bb-fb" style="font-family:var(--font-display);margin-top:14px;min-height:28px"></div>
    </div>
  `;

  function dec2bin(n) {
    return n.toString(2);
  }

  function showQuestion() {
    round++;
    document.getElementById('bb-r').textContent = round;
    document.getElementById('bb-fb').textContent = '';

    // Generate number 1-15 for easy mode, up to 31 for later rounds
    const max = round <= 4 ? 15 : round <= 7 ? 31 : 63;
    const num = Math.floor(Math.random() * (max - 1)) + 1;
    const correct = dec2bin(num);

    document.getElementById('bb-num').textContent = num;

    // Generate 4 choices
    const choices = new Set([correct]);
    while (choices.size < 4) {
      const wrong = dec2bin(Math.floor(Math.random() * max + 1));
      if (wrong !== correct) choices.add(wrong);
    }
    const arr = [...choices].sort(() => Math.random() - 0.5);

    const el = document.getElementById('bb-choices');
    el.innerHTML = '';
    let answered = false;

    arr.forEach(ch => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        padding:14px 20px;border-radius:8px;
        background:var(--surface);border:2px solid var(--border);
        color:var(--accent);font-family:monospace;font-size:1.3rem;
        cursor:pointer;letter-spacing:4px;transition:all 0.15s;
        text-align:center;
      `;
      btn.textContent = ch;
      btn.onmouseenter = () => { if (!answered) btn.style.borderColor = 'var(--accent)'; };
      btn.onmouseleave = () => { if (!answered) btn.style.borderColor = 'var(--border)'; };
      btn.onclick = () => {
        if (answered) return;
        answered = true;
        clearTimeout(robotTimer);
        if (ch === correct) {
          score++;
          document.getElementById('bb-ps').textContent = score;
          document.getElementById('bb-fb').innerHTML = `<span style="color:var(--accent)">✅ ${num} = ${correct}</span>`;
          btn.style.background = 'rgba(0,255,136,0.2)'; btn.style.borderColor = 'var(--accent)';
        } else {
          robotScore++;
          document.getElementById('bb-rs').textContent = robotScore;
          document.getElementById('bb-fb').innerHTML = `<span style="color:var(--danger)">❌ Réponse: ${correct}</span>`;
          btn.style.background = 'rgba(255,68,68,0.2)'; btn.style.borderColor = 'var(--danger)';
          // Highlight correct
          el.querySelectorAll('button').forEach(b => {
            if (b.textContent === correct) { b.style.background = 'rgba(0,255,136,0.15)'; b.style.borderColor = 'var(--accent)'; }
          });
        }
        setTimeout(round < ROUNDS ? showQuestion : endGame, 1100);
      };
      el.appendChild(btn);
    });

    // Animate progress bar
    const bar = document.getElementById('bb-bar');
    bar.style.transition = 'none'; bar.style.width = '100%';
    requestAnimationFrame(() => {
      bar.style.transition = `width ${ROBOT_TIME}ms linear`;
      bar.style.width = '0%';
    });

    // Robot timer
    robotTimer = setTimeout(() => {
      if (!answered) {
        answered = true;
        robotScore++;
        document.getElementById('bb-rs').textContent = robotScore;
        document.getElementById('bb-fb').innerHTML = `<span style="color:var(--danger)">🤖 Trop lent ! ${num} = ${correct}</span>`;
        el.querySelectorAll('button').forEach(b => {
          if (b.textContent === correct) { b.style.background = 'rgba(255,68,68,0.1)'; b.style.borderColor = 'var(--danger)'; }
        });
        setTimeout(round < ROUNDS ? showQuestion : endGame, 1100);
      }
    }, ROBOT_TIME);
  }

  function endGame() {
    const result = score > robotScore ? 'win' : score < robotScore ? 'loss' : 'draw';
    Arena.end(result, score * 120);
  }

  showQuestion();
};
