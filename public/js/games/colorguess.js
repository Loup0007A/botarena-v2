// Color Guess - Devine la couleur hexadécimale
window.startGame = function() {
  Arena.start();
  let score = 0, robotScore = 0, round = 0;
  const ROUNDS = 10;
  const ROBOT_TIME = 5000;
  let robotTimer = null;

  function randHex() {
    return '#' + Math.floor(Math.random() * 0xFFFFFF).toString(16).padStart(6, '0').toUpperCase();
  }

  function hexDistance(h1, h2) {
    const r1 = parseInt(h1.slice(1,3),16), g1 = parseInt(h1.slice(3,5),16), b1 = parseInt(h1.slice(5,7),16);
    const r2 = parseInt(h2.slice(1,3),16), g2 = parseInt(h2.slice(3,5),16), b2 = parseInt(h2.slice(5,7),16);
    return Math.sqrt((r1-r2)**2 + (g1-g2)**2 + (b1-b2)**2);
  }

  function closestHex(target, candidates) {
    return candidates.reduce((best, c) => hexDistance(c, target) < hexDistance(best, target) ? c : best);
  }

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:24px;width:100%;max-width:460px">
      <div style="display:flex;justify-content:space-around;font-family:var(--font-display);margin-bottom:14px">
        <span>👤 <span id="cg-ps" style="color:var(--accent)">0</span></span>
        <span style="color:var(--text3)">Round <span id="cg-r">1</span>/${ROUNDS}</span>
        <span>🤖 <span id="cg-rs" style="color:var(--danger)">0</span></span>
      </div>
      <div id="cg-bar-wrap" style="height:4px;background:var(--border);border-radius:2px;margin-bottom:20px;overflow:hidden">
        <div id="cg-bar" style="height:100%;background:var(--warn);width:100%"></div>
      </div>
      <p style="color:var(--text3);font-size:0.85rem;margin-bottom:12px">Quelle couleur correspond à ce code hex ?</p>
      <div id="cg-hex" style="font-family:monospace;font-size:2.2rem;letter-spacing:4px;color:var(--accent);margin-bottom:20px"></div>
      <div id="cg-choices" style="display:grid;grid-template-columns:1fr 1fr;gap:12px;max-width:360px;margin:0 auto"></div>
      <div id="cg-fb" style="font-family:var(--font-display);margin-top:14px;min-height:28px"></div>
    </div>
  `;

  function showQuestion() {
    round++;
    document.getElementById('cg-r').textContent = round;
    document.getElementById('cg-fb').textContent = '';

    const target = randHex();
    document.getElementById('cg-hex').textContent = target;
    document.getElementById('cg-hex').style.color = target;

    // 4 color swatches
    const options = [target, randHex(), randHex(), randHex()].sort(() => Math.random() - 0.5);

    const el = document.getElementById('cg-choices');
    el.innerHTML = '';
    let answered = false;

    options.forEach(hex => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        height:80px;border-radius:12px;
        background:${hex};
        border:4px solid transparent;
        cursor:pointer;transition:all 0.15s;
        box-shadow:0 4px 12px rgba(0,0,0,0.4);
      `;
      btn.onmouseenter = () => { if (!answered) { btn.style.transform = 'scale(1.05)'; btn.style.borderColor = 'white'; } };
      btn.onmouseleave = () => { btn.style.transform = ''; btn.style.borderColor = 'transparent'; };
      btn.onclick = () => {
        if (answered) return;
        answered = true;
        clearTimeout(robotTimer);
        if (hex === target) {
          score++;
          document.getElementById('cg-ps').textContent = score;
          document.getElementById('cg-fb').innerHTML = `<span style="color:var(--accent)">✅ Correct ! ${target}</span>`;
          btn.style.borderColor = '#00ff88';
          btn.style.boxShadow = '0 0 20px rgba(0,255,136,0.5)';
        } else {
          robotScore++;
          document.getElementById('cg-rs').textContent = robotScore;
          document.getElementById('cg-fb').innerHTML = `<span style="color:var(--danger)">❌ C'était ${target}</span>`;
          btn.style.borderColor = '#ff4444';
          el.querySelectorAll('button').forEach(b => {
            if (b.style.background === target || b.style.backgroundColor === target) {
              b.style.borderColor = '#00ff88';
            }
          });
          // Find and highlight correct
          [...el.children].forEach(b => {
            if (b.style.background === target) b.style.borderColor = '#00ff88';
          });
        }
        setTimeout(round < ROUNDS ? showQuestion : endGame, 1000);
      };
      el.appendChild(btn);
    });

    const bar = document.getElementById('cg-bar');
    bar.style.transition = 'none'; bar.style.width = '100%';
    requestAnimationFrame(() => {
      bar.style.transition = `width ${ROBOT_TIME}ms linear`;
      bar.style.width = '0%';
    });

    robotTimer = setTimeout(() => {
      if (!answered) {
        answered = true;
        robotScore++;
        document.getElementById('cg-rs').textContent = robotScore;
        document.getElementById('cg-fb').innerHTML = `<span style="color:var(--danger)">🤖 Réponse: ${target}</span>`;
        setTimeout(round < ROUNDS ? showQuestion : endGame, 1000);
      }
    }, ROBOT_TIME);
  }

  function endGame() {
    const result = score > robotScore ? 'win' : score < robotScore ? 'loss' : 'draw';
    Arena.end(result, score * 110);
  }

  showQuestion();
};
