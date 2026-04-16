// Tap Tap Bot - Clique le plus vite possible !
window.startGame = function() {
  Arena.start();
  let score = 0, timeLeft = 15, running = true;
  const ROBOT_RATE = 8; // clicks/sec

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:24px;width:100%;max-width:420px">
      <div style="display:flex;justify-content:space-around;font-family:var(--font-display);margin-bottom:16px">
        <div>
          <div style="font-size:2rem;color:var(--accent)" id="tt-score">0</div>
          <div style="font-size:0.75rem;color:var(--text3)">TOI</div>
        </div>
        <div>
          <div style="font-size:1.4rem;color:var(--warn)" id="tt-time">15</div>
          <div style="font-size:0.75rem;color:var(--text3)">SEC</div>
        </div>
        <div>
          <div style="font-size:2rem;color:var(--danger)" id="tt-robot">0</div>
          <div style="font-size:0.75rem;color:var(--text3)">ROBOT</div>
        </div>
      </div>
      <div id="tt-bar" style="height:6px;background:var(--border);border-radius:3px;margin-bottom:20px;overflow:hidden">
        <div id="tt-bar-fill" style="height:100%;background:var(--accent);width:100%;transition:width 1s linear"></div>
      </div>
      <div id="tt-btn" style="
        width:200px;height:200px;border-radius:50%;
        margin:0 auto 20px;
        background:radial-gradient(circle at 35% 35%, #00ff8844, #00ff8811);
        border:4px solid var(--accent);
        cursor:pointer;
        display:flex;align-items:center;justify-content:center;
        font-size:4rem;
        transition:transform 0.05s, box-shadow 0.05s;
        user-select:none;
        box-shadow: 0 0 20px rgba(0,255,136,0.3);
      ">👆</div>
      <p style="color:var(--text2);font-size:0.9rem">Le robot clique à <strong style="color:var(--danger)">${ROBOT_RATE}/sec</strong>. Peux-tu faire mieux ?</p>
      <div id="tt-result" style="font-family:var(--font-display);margin-top:12px;min-height:28px"></div>
    </div>
  `;

  let robotScore = 0;
  const btn = document.getElementById('tt-btn');

  // Timer
  const timer = setInterval(() => {
    if (!running) return;
    timeLeft--;
    document.getElementById('tt-time').textContent = timeLeft;
    document.getElementById('tt-bar-fill').style.width = (timeLeft / 15 * 100) + '%';

    if (timeLeft <= 0) {
      clearInterval(timer);
      clearInterval(robotTimer);
      running = false;
      btn.style.cursor = 'default';
      const result = score > robotScore ? 'win' : score < robotScore ? 'loss' : 'draw';
      const msg = result === 'win'
        ? `<span style="color:var(--accent)">🏆 Victoire ! ${score} vs ${robotScore}</span>`
        : result === 'loss'
        ? `<span style="color:var(--danger)">🤖 Défaite ! ${score} vs ${robotScore}</span>`
        : `<span style="color:var(--warn)">🤝 Égalité ! ${score} vs ${robotScore}</span>`;
      document.getElementById('tt-result').innerHTML = msg;
      setTimeout(() => Arena.end(result, score * 10), 1200);
    }
  }, 1000);

  // Robot auto-clicks
  const robotTimer = setInterval(() => {
    if (!running) return;
    robotScore++;
    document.getElementById('tt-robot').textContent = robotScore;
  }, 1000 / ROBOT_RATE);

  // Player click
  btn.addEventListener('click', () => {
    if (!running) return;
    score++;
    document.getElementById('tt-score').textContent = score;
    btn.style.transform = 'scale(0.88)';
    btn.style.boxShadow = '0 0 40px rgba(0,255,136,0.7)';
    setTimeout(() => {
      btn.style.transform = 'scale(1)';
      btn.style.boxShadow = '0 0 20px rgba(0,255,136,0.3)';
    }, 60);
  });

  // Touch support (prevent double-fire)
  btn.addEventListener('touchstart', e => { e.preventDefault(); btn.click(); }, { passive: false });
};
