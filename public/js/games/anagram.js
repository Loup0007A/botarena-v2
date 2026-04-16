// AnagramBot - Trouve l'anagramme avant le robot
window.startGame = function() {
  Arena.start();
  const WORDS = [
    'ROBOT', 'ARENE', 'ECRAN', 'SOURIS', 'CLAVIER', 'RESEAU', 'DISQUE', 'MEMOIRE',
    'PIXEL', 'DONNEE', 'LOGIQUE', 'CALCUL', 'CIRCUIT', 'VITESSE', 'SYSTEME',
    'BINAIRE', 'MATRICE', 'VECTEUR', 'CRYPTE', 'ALERTE', 'FUSION', 'RAPIDE',
    'ENERGIE', 'SERVEUR', 'DIGITAL', 'MOTEUR', 'CAPTEUR', 'SIGNAL', 'MODULE',
  ];

  let score = 0, robotScore = 0, round = 0;
  const ROUNDS = 8;
  const ROBOT_TIME = 6000;
  let robotTimer = null;

  function scramble(word) {
    let arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Don't accept if same as original
    const result = arr.join('');
    return result === word ? scramble(word) : result;
  }

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:24px;width:100%;max-width:480px">
      <div style="display:flex;justify-content:space-around;font-family:var(--font-display);margin-bottom:14px">
        <span>👤 <span id="ag-ps" style="color:var(--accent)">0</span></span>
        <span style="color:var(--text3)">Round <span id="ag-r">1</span>/${ROUNDS}</span>
        <span>🤖 <span id="ag-rs" style="color:var(--danger)">0</span></span>
      </div>
      <div id="ag-prog" style="height:4px;background:var(--border);border-radius:2px;margin-bottom:20px;overflow:hidden">
        <div id="ag-bar" style="height:100%;background:var(--warn);width:100%"></div>
      </div>
      <p style="color:var(--text3);font-size:0.9rem;margin-bottom:8px">Retrouve le mot original :</p>
      <div id="ag-scrambled" style="font-family:var(--font-display);font-size:2.8rem;letter-spacing:10px;color:var(--accent);margin-bottom:24px"></div>
      <div style="position:relative;max-width:300px;margin:0 auto 12px">
        <input id="ag-input" type="text" maxlength="10"
          style="width:100%;padding:14px 16px;border-radius:10px;
          background:var(--surface);border:2px solid var(--border);
          color:var(--text);font-family:var(--font-display);font-size:1.3rem;
          text-transform:uppercase;letter-spacing:6px;text-align:center;
          outline:none;transition:border-color 0.2s;"
          placeholder="_ _ _ _ _"
          autocomplete="off" autocorrect="off" spellcheck="false">
      </div>
      <button id="ag-submit" class="btn-primary" style="padding:12px 32px">Valider →</button>
      <div id="ag-fb" style="font-family:var(--font-display);margin-top:14px;min-height:28px;font-size:1rem"></div>
    </div>
  `;

  const input = document.getElementById('ag-input');
  input.focus();

  input.addEventListener('focus', () => input.style.borderColor = 'var(--accent)');
  input.addEventListener('blur', () => input.style.borderColor = 'var(--border)');
  input.addEventListener('keydown', e => { if (e.key === 'Enter') tryAnswer(); });
  document.getElementById('ag-submit').onclick = tryAnswer;

  let currentWord;

  function showQuestion() {
    round++;
    document.getElementById('ag-r').textContent = round;
    document.getElementById('ag-fb').textContent = '';
    input.value = '';
    input.focus();

    const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
    currentWord = shuffled[0];
    const anagram = scramble(currentWord);
    document.getElementById('ag-scrambled').textContent = anagram;

    const bar = document.getElementById('ag-bar');
    bar.style.transition = 'none'; bar.style.width = '100%';
    requestAnimationFrame(() => {
      bar.style.transition = `width ${ROBOT_TIME}ms linear`;
      bar.style.width = '0%';
    });

    robotTimer = setTimeout(() => {
      robotScore++;
      document.getElementById('ag-rs').textContent = robotScore;
      document.getElementById('ag-fb').innerHTML = `<span style="color:var(--danger)">🤖 C'était : ${currentWord}</span>`;
      setTimeout(round < ROUNDS ? showQuestion : endGame, 1300);
    }, ROBOT_TIME);
  }

  function tryAnswer() {
    const val = input.value.toUpperCase().trim();
    if (!val) return;
    clearTimeout(robotTimer);

    if (val === currentWord) {
      score++;
      document.getElementById('ag-ps').textContent = score;
      document.getElementById('ag-fb').innerHTML = `<span style="color:var(--accent)">✅ Correct !</span>`;
      input.style.borderColor = 'var(--accent)';
    } else {
      robotScore++;
      document.getElementById('ag-rs').textContent = robotScore;
      document.getElementById('ag-fb').innerHTML = `<span style="color:var(--danger)">❌ C'était : ${currentWord}</span>`;
      input.style.borderColor = 'var(--danger)';
    }
    setTimeout(() => { input.style.borderColor = 'var(--border)'; }, 800);
    setTimeout(round < ROUNDS ? showQuestion : endGame, 1300);
  }

  function endGame() {
    const result = score > robotScore ? 'win' : score < robotScore ? 'loss' : 'draw';
    Arena.end(result, score * 150);
  }

  showQuestion();
};
