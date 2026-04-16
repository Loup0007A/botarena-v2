// Sequencer - Trouve le prochain nombre de la suite
window.startGame = function() {
  Arena.start();
  let score = 0, robotScore = 0, round = 0;
  const ROUNDS = 10;
  const ROBOT_TIME = 4500;
  let robotTimer = null;

  function genSequence() {
    const type = Math.floor(Math.random() * 5);
    let seq = [], answer;

    switch (type) {
      case 0: { // Arithmetic
        const start = Math.floor(Math.random() * 10) + 1;
        const diff = Math.floor(Math.random() * 8) + 1;
        seq = [start, start+diff, start+2*diff, start+3*diff];
        answer = start + 4*diff;
        break;
      }
      case 1: { // Geometric (small)
        const start = Math.floor(Math.random() * 3) + 1;
        const ratio = Math.floor(Math.random() * 2) + 2;
        seq = [start, start*ratio, start*ratio**2, start*ratio**3];
        answer = start * ratio**4;
        break;
      }
      case 2: { // Squares
        const offset = Math.floor(Math.random() * 4) + 1;
        seq = [offset**2, (offset+1)**2, (offset+2)**2, (offset+3)**2];
        answer = (offset+4)**2;
        break;
      }
      case 3: { // Fibonacci-style
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        seq = [a, b, a+b, a+2*b];
        answer = 2*a + 3*b;
        break;
      }
      case 4: { // Powers of 2 + offset
        const off = Math.floor(Math.random() * 5);
        seq = [1+off, 2+off, 4+off, 8+off];
        answer = 16 + off;
        break;
      }
    }

    // Avoid huge numbers
    if (answer > 500 || answer <= 0) return genSequence();
    return { seq, answer };
  }

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:24px;width:100%;max-width:520px">
      <div style="display:flex;justify-content:space-around;font-family:var(--font-display);margin-bottom:14px">
        <span>👤 <span id="sq-ps" style="color:var(--accent)">0</span></span>
        <span style="color:var(--text3)">Round <span id="sq-r">1</span>/${ROUNDS}</span>
        <span>🤖 <span id="sq-rs" style="color:var(--danger)">0</span></span>
      </div>
      <div id="sq-prog" style="height:4px;background:var(--border);border-radius:2px;margin-bottom:24px;overflow:hidden">
        <div id="sq-bar" style="height:100%;background:var(--accent);width:100%"></div>
      </div>
      <div id="sq-seq" style="font-family:var(--font-display);font-size:1.8rem;color:var(--text);margin-bottom:24px;letter-spacing:4px"></div>
      <div id="sq-choices" style="display:flex;gap:12px;flex-wrap:wrap;justify-content:center"></div>
      <div id="sq-fb" style="font-family:var(--font-display);margin-top:16px;min-height:28px"></div>
    </div>
  `;

  function showQuestion() {
    round++;
    document.getElementById('sq-r').textContent = round;
    document.getElementById('sq-fb').textContent = '';

    const { seq, answer } = genSequence();
    document.getElementById('sq-seq').textContent = seq.join('  →  ') + '  →  ?';

    const choices = new Set([answer]);
    while (choices.size < 4) {
      const w = answer + (Math.floor(Math.random() * 20) - 10);
      if (w > 0 && w !== answer) choices.add(w);
    }
    const arr = [...choices].sort(() => Math.random() - 0.5);

    const el = document.getElementById('sq-choices');
    el.innerHTML = '';
    let answered = false;

    arr.forEach(ch => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        padding:18px 28px;border-radius:10px;
        background:var(--surface);border:2px solid var(--border);
        color:var(--text);font-family:var(--font-display);font-size:1.3rem;
        cursor:pointer;transition:all 0.15s;min-width:90px;
      `;
      btn.textContent = ch;
      btn.onmouseenter = () => { if (!answered) { btn.style.borderColor = 'var(--accent)'; btn.style.transform = 'translateY(-2px)'; } };
      btn.onmouseleave = () => { btn.style.borderColor = 'var(--border)'; btn.style.transform = ''; };
      btn.onclick = () => {
        if (answered) return;
        answered = true;
        clearTimeout(robotTimer);
        if (ch === answer) {
          score++;
          document.getElementById('sq-ps').textContent = score;
          document.getElementById('sq-fb').innerHTML = `<span style="color:var(--accent)">✅ Correct !</span>`;
          btn.style.background = 'rgba(0,255,136,0.2)'; btn.style.borderColor = 'var(--accent)';
        } else {
          robotScore++;
          document.getElementById('sq-rs').textContent = robotScore;
          document.getElementById('sq-fb').innerHTML = `<span style="color:var(--danger)">❌ Réponse: ${answer}</span>`;
          btn.style.background = 'rgba(255,68,68,0.2)'; btn.style.borderColor = 'var(--danger)';
          el.querySelectorAll('button').forEach(b => {
            if (parseInt(b.textContent) === answer) { b.style.background = 'rgba(0,255,136,0.15)'; b.style.borderColor = 'var(--accent)'; }
          });
        }
        setTimeout(round < ROUNDS ? showQuestion : endGame, 1000);
      };
      el.appendChild(btn);
    });

    const bar = document.getElementById('sq-bar');
    bar.style.transition = 'none'; bar.style.width = '100%';
    requestAnimationFrame(() => {
      bar.style.transition = `width ${ROBOT_TIME}ms linear`;
      bar.style.width = '0%';
    });

    robotTimer = setTimeout(() => {
      if (!answered) {
        answered = true;
        robotScore++;
        document.getElementById('sq-rs').textContent = robotScore;
        document.getElementById('sq-fb').innerHTML = `<span style="color:var(--danger)">🤖 Réponse: ${answer}</span>`;
        setTimeout(round < ROUNDS ? showQuestion : endGame, 1000);
      }
    }, ROBOT_TIME);
  }

  function endGame() {
    const result = score > robotScore ? 'win' : score < robotScore ? 'loss' : 'draw';
    Arena.end(result, score * 120);
  }

  showQuestion();
};
