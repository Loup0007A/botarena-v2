// Math Race - Calculs mentaux contre le robot
window.startGame = function() {
  Arena.start();
  let score = 0, robotScore = 0, round = 0;
  const ROUNDS = 10, ROBOT_SPEED = 3500;
  let robotTimer = null, questionStart = 0;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:24px;width:100%;max-width:520px">
      <div id="mr-scores" style="display:flex;justify-content:space-around;margin-bottom:16px;font-family:var(--font-display)">
        <span>👤 <span id="mr-ps" style="color:var(--accent)">0</span></span>
        <span style="color:var(--text3)">Round <span id="mr-r">1</span>/${ROUNDS}</span>
        <span>🤖 <span id="mr-rs" style="color:var(--danger)">0</span></span>
      </div>
      <div id="mr-progress" style="height:4px;background:var(--border);border-radius:2px;margin-bottom:24px;overflow:hidden">
        <div id="mr-bar" style="height:100%;background:var(--accent);width:100%;transition:width 0.1s linear"></div>
      </div>
      <div id="mr-q" style="font-family:var(--font-display);font-size:3rem;color:var(--text);margin-bottom:24px;letter-spacing:2px"></div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center" id="mr-choices"></div>
      <div id="mr-feedback" style="font-size:1.1rem;margin-top:16px;min-height:32px;font-family:var(--font-display)"></div>
    </div>
  `;

  function generateQ() {
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;
    if (op === '+') { a = Math.floor(Math.random()*50)+1; b = Math.floor(Math.random()*50)+1; answer = a+b; }
    else if (op === '-') { a = Math.floor(Math.random()*80)+20; b = Math.floor(Math.random()*a); answer = a-b; }
    else { a = Math.floor(Math.random()*12)+2; b = Math.floor(Math.random()*12)+2; answer = a*b; }
    return { q: `${a} ${op} ${b}`, answer };
  }

  let currentAnswer = null, answered = false;

  function showQuestion() {
    answered = false;
    round++;
    document.getElementById('mr-r').textContent = round;
    const { q, answer } = generateQ();
    currentAnswer = answer;
    document.getElementById('mr-q').textContent = `${q} = ?`;
    document.getElementById('mr-feedback').textContent = '';

    // Generate wrong answers
    const choices = new Set([answer]);
    while (choices.size < 4) {
      const wrong = answer + Math.floor(Math.random()*20) - 10;
      if (wrong !== answer && wrong > 0) choices.add(wrong);
    }
    const arr = [...choices].sort(() => Math.random()-0.5);
    const choicesEl = document.getElementById('mr-choices');
    choicesEl.innerHTML = '';
    arr.forEach(ch => {
      const btn = document.createElement('button');
      btn.style.cssText = 'padding:16px 28px;border-radius:8px;background:var(--surface);border:2px solid var(--border);color:var(--text);font-family:var(--font-display);font-size:1.2rem;cursor:pointer;transition:all 0.15s;min-width:90px';
      btn.textContent = ch;
      btn.onmouseenter = () => btn.style.borderColor = 'var(--accent)';
      btn.onmouseleave = () => { if (!answered) btn.style.borderColor = 'var(--border)'; };
      btn.onclick = () => playerAnswer(ch, btn);
      choicesEl.appendChild(btn);
    });

    // Progress bar + robot timer
    questionStart = Date.now();
    const barEl = document.getElementById('mr-bar');
    barEl.style.transition = 'none'; barEl.style.width = '100%';
    requestAnimationFrame(() => {
      barEl.style.transition = `width ${ROBOT_SPEED}ms linear`;
      barEl.style.width = '0%';
    });

    clearTimeout(robotTimer);
    robotTimer = setTimeout(() => {
      if (!answered) {
        answered = true;
        robotScore++;
        document.getElementById('mr-rs').textContent = robotScore;
        document.getElementById('mr-feedback').innerHTML = `<span style="color:var(--danger)">🤖 Robot: ${currentAnswer}</span>`;
        highlightAnswer(currentAnswer, true);
        setTimeout(round < ROUNDS ? showQuestion : endGame, 1200);
      }
    }, ROBOT_SPEED);
  }

  function playerAnswer(val, btn) {
    if (answered) return;
    answered = true;
    clearTimeout(robotTimer);
    const rt = Date.now() - questionStart;
    if (val === currentAnswer) {
      score++;
      const timeBonus = Math.max(0, Math.floor((ROBOT_SPEED - rt) / 10));
      Arena.addScore(100 + timeBonus);
      document.getElementById('mr-ps').textContent = score;
      document.getElementById('mr-feedback').innerHTML = `<span style="color:var(--accent)">✅ +${100+timeBonus} pts (${rt}ms)</span>`;
      btn.style.background = 'rgba(0,255,136,0.2)'; btn.style.borderColor = 'var(--accent)';
    } else {
      robotScore++;
      document.getElementById('mr-rs').textContent = robotScore;
      document.getElementById('mr-feedback').innerHTML = `<span style="color:var(--danger)">❌ Réponse: ${currentAnswer}</span>`;
      btn.style.background = 'rgba(255,68,68,0.2)'; btn.style.borderColor = 'var(--danger)';
      highlightAnswer(currentAnswer, true);
    }
    setTimeout(round < ROUNDS ? showQuestion : endGame, 1000);
  }

  function highlightAnswer(val, correct) {
    document.querySelectorAll('#mr-choices button').forEach(b => {
      if (parseInt(b.textContent) === val) {
        b.style.background = 'rgba(0,255,136,0.2)'; b.style.borderColor = 'var(--accent)';
      }
    });
  }

  function endGame() {
    const result = score > robotScore ? 'win' : score < robotScore ? 'loss' : 'draw';
    Arena.end(result, Arena.score);
  }

  showQuestion();
};
