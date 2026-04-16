// Balance Bot - Équilibre la balance avant le robot
window.startGame = function() {
  Arena.start();
  let score = 0, robotScore = 0, round = 0;
  const ROUNDS = 8;
  const ROBOT_TIME = 5000;
  let robotTimer = null;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:20px;width:100%;max-width:500px">
      <div style="display:flex;justify-content:space-around;font-family:var(--font-display);margin-bottom:14px">
        <span>👤 <span id="bs-ps" style="color:var(--accent)">0</span></span>
        <span style="color:var(--text3)">Round <span id="bs-r">1</span>/${ROUNDS}</span>
        <span>🤖 <span id="bs-rs" style="color:var(--danger)">0</span></span>
      </div>
      <div id="bs-bar-wrap" style="height:4px;background:var(--border);border-radius:2px;margin-bottom:20px;overflow:hidden">
        <div id="bs-bar" style="height:100%;background:var(--warn);width:100%"></div>
      </div>
      <div id="bs-puzzle" style="margin-bottom:20px"></div>
      <div id="bs-choices" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center"></div>
      <div id="bs-fb" style="font-family:var(--font-display);margin-top:14px;min-height:28px"></div>
    </div>
  `;

  function showQuestion() {
    round++;
    document.getElementById('bs-r').textContent = round;
    document.getElementById('bs-fb').textContent = '';

    // Generate: left side has values, right side has unknown
    // e.g. 3+5 = ? + 2  →  answer: 6
    const a = Math.floor(Math.random() * 8) + 1;
    const b = Math.floor(Math.random() * 8) + 1;
    const c2 = Math.floor(Math.random() * 8) + 1;
    const answer = a + b - c2;

    if (answer <= 0 || answer > 20) { showQuestion(); return; }

    document.getElementById('bs-puzzle').innerHTML = `
      <div style="font-family:var(--font-display);font-size:1.6rem;color:var(--text)">
        <span style="color:var(--accent)">${a}</span>
        <span style="color:var(--text2)"> + </span>
        <span style="color:var(--accent)">${b}</span>
        <span style="color:var(--text2)"> = </span>
        <span style="color:var(--accent2)">?</span>
        <span style="color:var(--text2)"> + </span>
        <span style="color:var(--accent)">${c2}</span>
      </div>
      <div style="margin-top:12px;font-size:2.5rem">⚖️</div>
      <div style="color:var(--text3);font-size:0.85rem;margin-top:8px">Quelle valeur équilibre la balance ?</div>
    `;

    // Choices
    const wrong = new Set([answer]);
    while (wrong.size < 4) {
      const w = answer + Math.floor(Math.random() * 10) - 5;
      if (w > 0 && w !== answer) wrong.add(w);
    }
    const arr = [...wrong].sort(() => Math.random() - 0.5);

    const choicesEl = document.getElementById('bs-choices');
    choicesEl.innerHTML = '';
    let answered = false;

    arr.forEach(ch => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        padding:16px 24px;border-radius:10px;
        background:var(--surface);border:2px solid var(--border);
        color:var(--text);font-family:var(--font-display);font-size:1.4rem;
        cursor:pointer;transition:all 0.15s;min-width:70px;
      `;
      btn.textContent = ch;
      btn.onmouseenter = () => { if (!answered) btn.style.borderColor = 'var(--accent)'; btn.style.transform = 'scale(1.05)'; };
      btn.onmouseleave = () => { btn.style.borderColor = 'var(--border)'; btn.style.transform = 'scale(1)'; };
      btn.onclick = () => {
        if (answered) return;
        answered = true;
        clearTimeout(robotTimer);
        if (ch === answer) {
          score++;
          document.getElementById('bs-ps').textContent = score;
          document.getElementById('bs-fb').innerHTML = `<span style="color:var(--accent)">✅ ${a} + ${b} = ${answer} + ${c2} ⚖️</span>`;
          btn.style.background = 'rgba(0,255,136,0.2)'; btn.style.borderColor = 'var(--accent)';
        } else {
          robotScore++;
          document.getElementById('bs-rs').textContent = robotScore;
          document.getElementById('bs-fb').innerHTML = `<span style="color:var(--danger)">❌ Réponse: ${answer}</span>`;
          btn.style.background = 'rgba(255,68,68,0.2)'; btn.style.borderColor = 'var(--danger)';
          choicesEl.querySelectorAll('button').forEach(b => {
            if (parseInt(b.textContent) === answer) { b.style.background = 'rgba(0,255,136,0.15)'; b.style.borderColor = 'var(--accent)'; }
          });
        }
        setTimeout(round < ROUNDS ? showQuestion : endGame, 1100);
      };
      choicesEl.appendChild(btn);
    });

    // Progress bar + robot
    const bar = document.getElementById('bs-bar');
    bar.style.transition = 'none'; bar.style.width = '100%';
    requestAnimationFrame(() => {
      bar.style.transition = `width ${ROBOT_TIME}ms linear`;
      bar.style.width = '0%';
    });

    robotTimer = setTimeout(() => {
      if (!answered) {
        answered = true;
        robotScore++;
        document.getElementById('bs-rs').textContent = robotScore;
        document.getElementById('bs-fb').innerHTML = `<span style="color:var(--danger)">🤖 Réponse: ${answer}</span>`;
        setTimeout(round < ROUNDS ? showQuestion : endGame, 1100);
      }
    }, ROBOT_TIME);
  }

  function endGame() {
    const result = score > robotScore ? 'win' : score < robotScore ? 'loss' : 'draw';
    Arena.end(result, score * 130);
  }

  showQuestion();
};
