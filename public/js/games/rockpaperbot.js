// RPS Ultra - Pierre Feuille Ciseaux contre une IA prédictive
window.startGame = function() {
  Arena.start();
  let playerScore = 0, robotScore = 0, draws = 0, round = 0;
  const ROUNDS = 7;
  let history = []; // player move history for prediction

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:24px;width:100%;max-width:480px">
      <div id="rps-scores" style="display:flex;justify-content:space-around;font-family:var(--font-display);margin-bottom:16px">
        <div><div style="font-size:1.8rem;color:var(--accent)" id="rps-ps">0</div><div style="font-size:0.75rem;color:var(--text3)">TOI</div></div>
        <div><div style="font-size:0.9rem;color:var(--text3);padding-top:8px">Round <span id="rps-r">1</span>/${ROUNDS}</div></div>
        <div><div style="font-size:1.8rem;color:var(--danger)" id="rps-rs">0</div><div style="font-size:0.75rem;color:var(--text3)">ROBOT</div></div>
      </div>

      <div id="rps-arena" style="display:flex;align-items:center;justify-content:space-around;font-size:5rem;margin:20px 0;min-height:100px">
        <span id="rps-pm">❓</span>
        <span style="font-size:1.5rem;color:var(--text3)">VS</span>
        <span id="rps-rm">❓</span>
      </div>

      <div id="rps-result" style="font-family:var(--font-display);font-size:1.1rem;min-height:32px;margin-bottom:16px"></div>

      <div id="rps-btns" style="display:flex;gap:16px;justify-content:center">
        <button onclick="rpsPlay('rock')" style="font-size:3rem;padding:16px;border-radius:12px;background:var(--surface);border:2px solid var(--border);cursor:pointer;transition:all 0.15s" onmouseenter="this.style.borderColor='var(--accent)'" onmouseleave="this.style.borderColor='var(--border)'">✊</button>
        <button onclick="rpsPlay('paper')" style="font-size:3rem;padding:16px;border-radius:12px;background:var(--surface);border:2px solid var(--border);cursor:pointer;transition:all 0.15s" onmouseenter="this.style.borderColor='var(--accent)'" onmouseleave="this.style.borderColor='var(--border)'">🖐️</button>
        <button onclick="rpsPlay('scissors')" style="font-size:3rem;padding:16px;border-radius:12px;background:var(--surface);border:2px solid var(--border);cursor:pointer;transition:all 0.15s" onmouseenter="this.style.borderColor='var(--accent)'" onmouseleave="this.style.borderColor='var(--border)'">✌️</button>
      </div>
      <div style="margin-top:10px;color:var(--text3);font-size:0.8rem">✊ Pierre &nbsp; 🖐️ Feuille &nbsp; ✌️ Ciseaux</div>
    </div>
  `;

  const ICONS = { rock: '✊', paper: '🖐️', scissors: '✌️' };
  const NAMES = { rock: 'Pierre', paper: 'Feuille', scissors: 'Ciseaux' };
  const BEATS = { rock: 'scissors', scissors: 'paper', paper: 'rock' };
  const CHOICES = ['rock', 'paper', 'scissors'];

  function robotPredict() {
    if (history.length < 3) return CHOICES[Math.floor(Math.random() * 3)];
    // Count player's most common move and counter it
    const counts = { rock: 0, paper: 0, scissors: 0 };
    history.slice(-5).forEach(m => counts[m]++);
    const mostCommon = Object.entries(counts).sort((a,b) => b[1]-a[1])[0][0];
    // Counter the predicted move
    return Object.keys(BEATS).find(k => BEATS[k] === mostCommon) || CHOICES[Math.floor(Math.random()*3)];
  }

  window.rpsPlay = function(playerMove) {
    if (round >= ROUNDS) return;
    round++;
    const robotMove = robotPredict();
    history.push(playerMove);

    document.getElementById('rps-pm').textContent = ICONS[playerMove];
    document.getElementById('rps-rm').textContent = ICONS[robotMove];

    let result, msg;
    if (playerMove === robotMove) {
      draws++;
      result = 'draw'; msg = `<span style="color:var(--warn)">🤝 Égalité ! ${NAMES[playerMove]} vs ${NAMES[robotMove]}</span>`;
    } else if (BEATS[playerMove] === robotMove) {
      playerScore++;
      document.getElementById('rps-ps').textContent = playerScore;
      result = 'win'; msg = `<span style="color:var(--accent)">🏆 Tu gagnes ! ${NAMES[playerMove]} bat ${NAMES[robotMove]}</span>`;
    } else {
      robotScore++;
      document.getElementById('rps-rs').textContent = robotScore;
      result = 'loss'; msg = `<span style="color:var(--danger)">🤖 Robot gagne ! ${NAMES[robotMove]} bat ${NAMES[playerMove]}</span>`;
    }
    document.getElementById('rps-result').innerHTML = msg;
    document.getElementById('rps-r').textContent = Math.min(round + 1, ROUNDS);

    if (round >= ROUNDS) {
      setTimeout(() => {
        const finalResult = playerScore > robotScore ? 'win' : playerScore < robotScore ? 'loss' : 'draw';
        Arena.end(finalResult, playerScore * 150);
      }, 1200);
    }
  };
};
