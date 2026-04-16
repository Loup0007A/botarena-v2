// Scramble Bot - Reconstitue les mots brouillés
window.startGame = function() {
  Arena.start();
  const PAIRS = [
    { scrambled: 'BORTE', word: 'ROBOT' }, { scrambled: 'XIPEL', word: 'PIXEL' },
    { scrambled: 'UQITLO', word: 'LOQUIT', real: 'LOGIQUE' }, // use real if different
    { scrambled: 'ODCNE', word: 'CODEN', real: 'DCODE' },
    { scrambled: 'TALCUC', word: 'CALCUL' }, { scrambled: 'SVISETE', word: 'VITESSE' },
    { scrambled: 'RETLAE', word: 'ALERTE' }, { scrambled: 'SUORIS', word: 'SOURIS' },
    { scrambled: 'TREUVEC', word: 'VECTEUR' }, { scrambled: 'PRCTOYE', word: 'CRYPTOE', real: 'CRYPTE' },
    { scrambled: 'RUTEFAT', word: 'FRACTURE', real: 'FRACTURE' },
    { scrambled: 'ENIRABA', word: 'BINAIRE' }, { scrambled: 'NALSCAI', word: 'SIGNALS', real: 'SIGNAL' },
    { scrambled: 'LCIRCTU', word: 'CIRCUIT' }, { scrambled: 'TREOMUU', word: 'MOTEUR' + 'U', real: 'MOTEUR' },
  ];

  // Clean pairs
  const VALID = [
    ['BORTE', 'ROBOT'], ['XIPEL', 'PIXEL'], ['LATCUC', 'CALCUL'],
    ['SSEITEV', 'VITESSE'], ['UOSISR', 'SOURIS'], ['ERUETCV', 'VECTEUR'],
    ['ERANLAI', 'LINEARA', 'LINEAIRE'], ['ERABINI', 'BINAIRE'],
    ['CUITRCI', 'CIRCUIT'], ['LERTEA', 'ALERTE'], ['ELRAST', 'ALTERS', 'ALERTE'],
    ['FUNIOW', 'FUSION'], ['PETARC', 'CAPTEUR'], ['GLUIEOQ', 'LOGIQUE'],
  ];

  // Simple approach: give scrambled, player types answer
  const QUESTIONS = [
    { q: 'BORTE', a: 'ROBOT' }, { q: 'XIPEL', a: 'PIXEL' },
    { q: 'LATCUC', a: 'CALCUL' }, { q: 'SSEITEV', a: 'VITESSE' },
    { q: 'UOSISR', a: 'SOURIS' }, { q: 'ERUETCV', a: 'VECTEUR' },
    { q: 'ERABINI', a: 'BINAIRE' }, { q: 'CUITRCI', a: 'CIRCUIT' },
    { q: 'LERTEA', a: 'ALERTE' }, { q: 'NOIFUS', a: 'FUSION' },
    { q: 'PETACRU', a: 'CAPTEUR' }, { q: 'GLIEOQU', a: 'LOGIQUE' },
    { q: 'NAESER', a: 'RESEAU' }, { q: 'MEISTSY', a: 'SYSTEME' },
    { q: 'NAOERVE', a: 'SERVEUR' },
  ];

  let score = 0, robotScore = 0, round = 0;
  const ROUNDS = 8;
  const ROBOT_TIME = 7000;
  let robotTimer = null;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:24px;width:100%;max-width:480px">
      <div style="display:flex;justify-content:space-around;font-family:var(--font-display);margin-bottom:14px">
        <span>👤 <span id="sc-ps" style="color:var(--accent)">0</span></span>
        <span style="color:var(--text3)">Round <span id="sc-r">1</span>/${ROUNDS}</span>
        <span>🤖 <span id="sc-rs" style="color:var(--danger)">0</span></span>
      </div>
      <div id="sc-prog" style="height:4px;background:var(--border);border-radius:2px;margin-bottom:20px;overflow:hidden">
        <div id="sc-bar" style="height:100%;background:var(--accent);width:100%"></div>
      </div>
      <p style="color:var(--text3);font-size:0.9rem;margin-bottom:10px">Reconstitue ce mot brouillé :</p>
      <div id="sc-q" style="font-family:var(--font-display);font-size:2.5rem;letter-spacing:10px;color:var(--accent2);margin-bottom:20px"></div>
      <div id="sc-letters" style="display:flex;flex-wrap:wrap;gap:8px;justify-content:center;margin-bottom:16px"></div>
      <div id="sc-answer" style="font-family:var(--font-display);font-size:2rem;letter-spacing:10px;min-height:50px;color:var(--accent);padding:10px;border-radius:8px;border:2px dashed var(--border);max-width:300px;margin:0 auto 14px"></div>
      <div style="display:flex;gap:10px;justify-content:center">
        <button id="sc-submit" class="btn-primary">✅ Valider</button>
        <button id="sc-clear" class="btn-secondary">⌫ Reset</button>
      </div>
      <div id="sc-fb" style="font-family:var(--font-display);margin-top:14px;min-height:28px"></div>
    </div>
  `;

  let currentAnswer, typed = [];

  function showQuestion() {
    round++;
    document.getElementById('sc-r').textContent = round;
    document.getElementById('sc-fb').textContent = '';
    typed = [];
    updateAnswer();

    const q = QUESTIONS[(round - 1) % QUESTIONS.length];
    currentAnswer = q.a;
    document.getElementById('sc-q').textContent = q.q;

    // Letter tiles
    const letters = q.q.split('').sort(() => Math.random() - 0.5);
    const el = document.getElementById('sc-letters');
    el.innerHTML = '';
    letters.forEach(l => {
      const btn = document.createElement('button');
      btn.textContent = l;
      btn.style.cssText = `
        width:44px;height:44px;border-radius:8px;
        background:var(--surface2);border:2px solid var(--border);
        color:var(--text);font-family:var(--font-display);font-size:1.1rem;
        cursor:pointer;transition:all 0.15s;
      `;
      btn.onmouseenter = () => { if (!btn.disabled) btn.style.borderColor = 'var(--accent)'; };
      btn.onmouseleave = () => { if (!btn.disabled) btn.style.borderColor = 'var(--border)'; };
      btn.onclick = () => {
        if (btn.disabled) return;
        btn.disabled = true;
        btn.style.opacity = '0.3';
        typed.push(l);
        updateAnswer();
      };
      el.appendChild(btn);
    });

    const bar = document.getElementById('sc-bar');
    bar.style.transition = 'none'; bar.style.width = '100%';
    requestAnimationFrame(() => {
      bar.style.transition = `width ${ROBOT_TIME}ms linear`;
      bar.style.width = '0%';
    });

    robotTimer = setTimeout(() => {
      robotScore++;
      document.getElementById('sc-rs').textContent = robotScore;
      document.getElementById('sc-fb').innerHTML = `<span style="color:var(--danger)">🤖 C'était : ${currentAnswer}</span>`;
      setTimeout(round < ROUNDS ? showQuestion : endGame, 1300);
    }, ROBOT_TIME);
  }

  function updateAnswer() {
    document.getElementById('sc-answer').textContent = typed.join('') || '_';
  }

  document.getElementById('sc-clear').onclick = () => {
    typed = [];
    updateAnswer();
    document.querySelectorAll('#sc-letters button').forEach(b => { b.disabled = false; b.style.opacity = '1'; });
  };

  document.getElementById('sc-submit').onclick = () => {
    if (!typed.length) return;
    clearTimeout(robotTimer);
    const val = typed.join('').toUpperCase();
    if (val === currentAnswer) {
      score++;
      document.getElementById('sc-ps').textContent = score;
      document.getElementById('sc-fb').innerHTML = `<span style="color:var(--accent)">✅ Correct !</span>`;
    } else {
      robotScore++;
      document.getElementById('sc-rs').textContent = robotScore;
      document.getElementById('sc-fb').innerHTML = `<span style="color:var(--danger)">❌ C'était : ${currentAnswer}</span>`;
    }
    setTimeout(round < ROUNDS ? showQuestion : endGame, 1300);
  };

  function endGame() {
    const result = score > robotScore ? 'win' : score < robotScore ? 'loss' : 'draw';
    Arena.end(result, score * 140);
  }

  showQuestion();
};
