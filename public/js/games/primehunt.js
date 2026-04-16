// Prime Hunt - Identifie les nombres premiers avant le robot
window.startGame = function() {
  Arena.start();
  let score = 0, robotScore = 0, round = 0;
  const ROUNDS = 12;
  const ROBOT_TIME = 3500;
  let robotTimer = null;

  function isPrime(n) {
    if (n < 2) return false;
    for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;
    return true;
  }

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:24px;width:100%;max-width:480px">
      <div style="display:flex;justify-content:space-around;font-family:var(--font-display);margin-bottom:14px">
        <span>👤 <span id="ph-ps" style="color:var(--accent)">0</span></span>
        <span style="color:var(--text3)">Q<span id="ph-r">1</span>/${ROUNDS}</span>
        <span>🤖 <span id="ph-rs" style="color:var(--danger)">0</span></span>
      </div>
      <div id="ph-bar-wrap" style="height:4px;background:var(--border);border-radius:2px;margin-bottom:20px;overflow:hidden">
        <div id="ph-bar" style="height:100%;background:var(--accent);width:100%"></div>
      </div>
      <p style="color:var(--text3);font-size:0.9rem;margin-bottom:12px">Ce nombre est-il <span style="color:var(--accent)">premier</span> ?</p>
      <div id="ph-num" style="font-family:var(--font-display);font-size:5rem;font-weight:900;color:var(--text);margin:16px 0"></div>
      <div style="display:flex;gap:16px;justify-content:center;margin-bottom:16px">
        <button id="ph-yes" style="flex:1;max-width:150px;padding:18px;border-radius:12px;background:rgba(0,255,136,0.1);border:3px solid var(--accent);color:var(--accent);font-family:var(--font-display);font-size:1.1rem;cursor:pointer;transition:all 0.15s">
          ✅ OUI
        </button>
        <button id="ph-no" style="flex:1;max-width:150px;padding:18px;border-radius:12px;background:rgba(255,68,68,0.1);border:3px solid var(--danger);color:var(--danger);font-family:var(--font-display);font-size:1.1rem;cursor:pointer;transition:all 0.15s">
          ❌ NON
        </button>
      </div>
      <div id="ph-fb" style="font-family:var(--font-display);min-height:28px;font-size:0.95rem"></div>
    </div>
  `;

  let currentNum, answered;

  function showQuestion() {
    round++;
    answered = false;
    document.getElementById('ph-r').textContent = round;
    document.getElementById('ph-fb').textContent = '';
    document.getElementById('ph-yes').style.opacity = '1';
    document.getElementById('ph-no').style.opacity = '1';

    // Mix of primes and non-primes (2–97)
    const candidates = [];
    for (let n = 2; n <= 97; n++) candidates.push(n);
    currentNum = candidates[Math.floor(Math.random() * candidates.length)];
    document.getElementById('ph-num').textContent = currentNum;

    const bar = document.getElementById('ph-bar');
    bar.style.transition = 'none'; bar.style.width = '100%';
    requestAnimationFrame(() => {
      bar.style.transition = `width ${ROBOT_TIME}ms linear`;
      bar.style.width = '0%';
    });

    robotTimer = setTimeout(() => {
      if (!answered) {
        answered = true;
        robotScore++;
        document.getElementById('ph-rs').textContent = robotScore;
        const ans = isPrime(currentNum);
        document.getElementById('ph-fb').innerHTML = `<span style="color:var(--danger)">🤖 ${currentNum} est ${ans ? '' : 'NON '}premier (diviseurs: ${getDivisors(currentNum)})</span>`;
        setTimeout(round < ROUNDS ? showQuestion : endGame, 1300);
      }
    }, ROBOT_TIME);
  }

  function getDivisors(n) {
    if (isPrime(n)) return `1, ${n}`;
    const d = [1];
    for (let i = 2; i <= n; i++) if (n % i === 0) d.push(i);
    return d.join(', ');
  }

  function answer(playerSaysYes) {
    if (answered) return;
    answered = true;
    clearTimeout(robotTimer);
    const correct = isPrime(currentNum);
    const playerCorrect = playerSaysYes === correct;

    if (playerCorrect) {
      score++;
      document.getElementById('ph-ps').textContent = score;
      document.getElementById('ph-fb').innerHTML = `<span style="color:var(--accent)">✅ Correct ! ${currentNum} ${correct ? 'EST' : "N'EST PAS"} premier</span>`;
    } else {
      robotScore++;
      document.getElementById('ph-rs').textContent = robotScore;
      document.getElementById('ph-fb').innerHTML = `<span style="color:var(--danger)">❌ ${currentNum} ${correct ? 'EST' : "N'EST PAS"} premier (${getDivisors(currentNum)})</span>`;
    }
    document.getElementById('ph-yes').style.opacity = '0.4';
    document.getElementById('ph-no').style.opacity = '0.4';
    setTimeout(round < ROUNDS ? showQuestion : endGame, 1300);
  }

  document.getElementById('ph-yes').onclick = () => answer(true);
  document.getElementById('ph-no').onclick = () => answer(false);

  function endGame() {
    const result = score > robotScore ? 'win' : score < robotScore ? 'loss' : 'draw';
    Arena.end(result, score * 100);
  }

  showQuestion();
};
