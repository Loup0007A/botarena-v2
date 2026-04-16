// Color Flash - Clique sur la bonne couleur avant le robot
window.startGame = function() {
  Arena.start();
  const COLORS = [
    { hex: '#ff4444', name: 'ROUGE' },
    { hex: '#00ff88', name: 'VERT' },
    { hex: '#00c8ff', name: 'BLEU' },
    { hex: '#ffa500', name: 'ORANGE' },
    { hex: '#ff00aa', name: 'ROSE' },
    { hex: '#ffff00', name: 'JAUNE' },
  ];

  let score = 0, robotScore = 0, round = 0;
  const ROUNDS = 12;
  let robotTimer = null, answered = false;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:24px;width:100%;max-width:480px">
      <div style="font-family:var(--font-display);margin-bottom:16px;display:flex;justify-content:space-around">
        <span>👤 <span id="cf-ps" style="color:var(--accent)">0</span></span>
        <span style="color:var(--text3)">Round <span id="cf-r">1</span>/${ROUNDS}</span>
        <span>🤖 <span id="cf-rs" style="color:var(--danger)">0</span></span>
      </div>
      <div id="cf-target" style="
        width:120px;height:120px;border-radius:50%;
        margin:0 auto 24px;
        border:5px solid rgba(255,255,255,0.1);
        transition:background 0.2s;
        box-shadow:0 0 30px rgba(0,0,0,0.5);
      "></div>
      <div id="cf-label" style="font-family:var(--font-display);font-size:1.8rem;letter-spacing:6px;margin-bottom:20px;color:var(--text)"></div>
      <div id="cf-btns" style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center;max-width:360px;margin:0 auto"></div>
      <div id="cf-fb" style="font-family:var(--font-display);margin-top:16px;min-height:28px;font-size:1rem"></div>
    </div>
  `;

  function nextRound() {
    round++;
    if (round > ROUNDS) {
      const result = score > robotScore ? 'win' : score < robotScore ? 'loss' : 'draw';
      Arena.end(result, score * 100);
      return;
    }
    answered = false;
    document.getElementById('cf-r').textContent = round;
    document.getElementById('cf-fb').textContent = '';

    // Pick a target color
    const target = COLORS[Math.floor(Math.random() * COLORS.length)];
    document.getElementById('cf-target').style.background = target.hex;
    document.getElementById('cf-target').style.boxShadow = `0 0 30px ${target.hex}66`;
    document.getElementById('cf-label').textContent = target.name;
    document.getElementById('cf-label').style.color = target.hex;

    // Shuffle choices (always 4)
    const shuffled = [...COLORS].sort(() => Math.random() - 0.5).slice(0, 4);
    if (!shuffled.find(c => c.hex === target.hex)) {
      shuffled[Math.floor(Math.random() * 4)] = target;
    }
    shuffled.sort(() => Math.random() - 0.5);

    const btns = document.getElementById('cf-btns');
    btns.innerHTML = '';
    shuffled.forEach(col => {
      const btn = document.createElement('button');
      btn.style.cssText = `
        width:72px;height:72px;border-radius:50%;
        background:${col.hex};
        border:4px solid transparent;
        cursor:pointer;
        transition:transform 0.15s, border-color 0.15s;
        box-shadow:0 4px 12px rgba(0,0,0,0.3);
      `;
      btn.title = col.name;
      btn.onmouseenter = () => { if (!answered) btn.style.transform = 'scale(1.15)'; btn.style.borderColor = 'white'; };
      btn.onmouseleave = () => { btn.style.transform = 'scale(1)'; btn.style.borderColor = 'transparent'; };
      btn.onclick = () => {
        if (answered) return;
        answered = true;
        clearTimeout(robotTimer);
        if (col.hex === target.hex) {
          score++;
          document.getElementById('cf-ps').textContent = score;
          document.getElementById('cf-fb').innerHTML = `<span style="color:var(--accent)">✅ ${col.name} — Correct !</span>`;
          btn.style.borderColor = '#00ff88';
        } else {
          robotScore++;
          document.getElementById('cf-rs').textContent = robotScore;
          document.getElementById('cf-fb').innerHTML = `<span style="color:var(--danger)">❌ C'était ${target.name}</span>`;
          btn.style.borderColor = '#ff4444';
          // Highlight correct
          btns.querySelectorAll('button').forEach(b => {
            if (b !== btn) b.style.opacity = '0.3';
          });
          btn.style.opacity = '1';
        }
        setTimeout(nextRound, 900);
      };
      btns.appendChild(btn);
    });

    // Robot reaction: 600-1400ms
    const robotDelay = 600 + Math.random() * 800;
    robotTimer = setTimeout(() => {
      if (!answered) {
        answered = true;
        robotScore++;
        document.getElementById('cf-rs').textContent = robotScore;
        document.getElementById('cf-fb').innerHTML = `<span style="color:var(--danger)">🤖 Le robot a cliqué en premier !</span>`;
        setTimeout(nextRound, 900);
      }
    }, robotDelay);
  }

  nextRound();
};
