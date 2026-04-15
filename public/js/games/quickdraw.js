// Quick Draw - Tire plus vite que le robot !
window.startGame = function() {
  Arena.start();
  let phase = 'wait'; // wait | ready | done
  let robotTime = 0, playerTime = 0;
  let waitTimeout, robotTimeout;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div id="qd-screen" style="text-align:center;padding:40px;width:100%;max-width:500px">
      <div id="qd-instruction" style="font-size:1.1rem;color:var(--text2);margin-bottom:20px">Attends le signal VERT puis clique !</div>
      <div id="qd-btn" style="
        width:180px;height:180px;border-radius:50%;
        background:#333;border:4px solid #555;
        margin:20px auto;cursor:pointer;
        display:flex;align-items:center;justify-content:center;
        font-size:3rem;transition:all 0.15s;
        user-select:none;
      ">🎯</div>
      <div id="qd-time" style="font-family:var(--font-display);font-size:1.4rem;color:var(--accent);min-height:40px"></div>
      <div id="qd-round" style="color:var(--text3);font-size:0.85rem;margin-top:8px"></div>
    </div>
  `;

  let round = 0, wins = 0, losses = 0;
  const ROUNDS = 3;

  function nextRound() {
    if (round >= ROUNDS) {
      const result = wins > losses ? 'win' : wins < losses ? 'loss' : 'draw';
      const score = wins * 100 + (3000 - Math.min(playerTime, 3000));
      Arena.end(result, Math.max(0, Math.floor(score)));
      return;
    }
    round++;
    phase = 'wait';
    document.getElementById('qd-btn').style.background = '#333';
    document.getElementById('qd-btn').style.borderColor = '#555';
    document.getElementById('qd-btn').textContent = '🎯';
    document.getElementById('qd-time').textContent = '';
    document.getElementById('qd-round').textContent = `Round ${round}/${ROUNDS} — Victoires: ${wins} | Défaites: ${losses}`;
    document.getElementById('qd-instruction').textContent = 'Attends le signal VERT...';

    const delay = 1500 + Math.random() * 3000;
    waitTimeout = setTimeout(() => {
      phase = 'ready';
      document.getElementById('qd-btn').style.background = '#00ff88';
      document.getElementById('qd-btn').style.borderColor = '#00ff88';
      document.getElementById('qd-btn').textContent = '💥';
      document.getElementById('qd-btn').style.boxShadow = '0 0 30px rgba(0,255,136,0.6)';
      document.getElementById('qd-instruction').textContent = 'MAINTENANT ! Cliquez !';
      playerTime = 0;
      const t = Date.now();

      // Robot reaction time based on difficulty
      robotTime = 200 + Math.random() * 400;
      robotTimeout = setTimeout(() => {
        if (phase === 'ready') {
          phase = 'done';
          losses++;
          document.getElementById('qd-time').innerHTML = `<span style="color:var(--danger)">🤖 Le robot a gagné (${Math.floor(robotTime)}ms)</span>`;
          setTimeout(nextRound, 1500);
        }
      }, robotTime);

      // Store start time
      document.getElementById('qd-btn')._start = t;
    }, delay);
  }

  document.getElementById('qd-btn').addEventListener('click', () => {
    if (phase === 'wait') {
      clearTimeout(waitTimeout);
      clearTimeout(robotTimeout);
      document.getElementById('qd-time').innerHTML = `<span style="color:var(--danger)">⚠️ Trop tôt ! Attends le vert...</span>`;
      document.getElementById('qd-btn').style.background = '#ff4444';
      document.getElementById('qd-btn').textContent = '❌';
      losses++;
      phase = 'done';
      setTimeout(nextRound, 1500);
    } else if (phase === 'ready') {
      clearTimeout(robotTimeout);
      phase = 'done';
      const reaction = Date.now() - document.getElementById('qd-btn')._start;
      playerTime += reaction;
      if (reaction < robotTime) {
        wins++;
        document.getElementById('qd-time').innerHTML = `<span style="color:var(--accent)">⚡ ${reaction}ms — Tu as gagné !</span>`;
      } else {
        losses++;
        document.getElementById('qd-time').innerHTML = `<span style="color:var(--danger)">🐢 ${reaction}ms — Robot: ${Math.floor(robotTime)}ms</span>`;
      }
      setTimeout(nextRound, 1500);
    }
  });

  nextRound();
};
