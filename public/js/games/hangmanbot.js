// Hangman Bot - Pendu contre l'IA
window.startGame = function() {
  Arena.start();
  const WORDS = ['ROBOT','ARENE','ORDINATEUR','INTELLIGENCE','VITESSE','STRATEGIE','MEMOIRE','REFLEXE','CALCUL','ALGORYTHME','PROGRAMME','CIRCUIT','PROCESSEUR','DONNEES','SYSTEME','RESEAU','LOGIQUE','BINAIRE','PIXEL','MATRICE'];
  const word = WORDS[Math.floor(Math.random() * WORDS.length)];
  const letters = [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'];
  let guessed = new Set(), errors = 0, robotErrors = 0;
  const MAX_ERRORS = 6;

  // Robot has a smart letter order (frequency-based)
  const ROBOT_ORDER = ['E','A','I','S','T','N','R','U','O','L','C','D','P','M','V','H','G','F','B','Q','X','Y','Z','J','K','W'];
  let robotIdx = 0, robotTimer = null;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:16px;width:100%;max-width:520px">
      <div style="display:flex;justify-content:space-around;font-family:var(--font-display);margin-bottom:12px;font-size:0.85rem">
        <span>👤 Erreurs: <span id="hm-pe" style="color:var(--danger)">0</span>/${MAX_ERRORS}</span>
        <span style="color:var(--text3)">${word.length} lettres</span>
        <span>🤖 Erreurs: <span id="hm-re" style="color:var(--danger)">0</span>/${MAX_ERRORS}</span>
      </div>
      <div id="hm-word" style="font-family:var(--font-display);font-size:2rem;letter-spacing:12px;margin:16px 0;color:var(--accent)"></div>
      <div id="hm-used" style="color:var(--text3);font-size:0.82rem;margin-bottom:12px;min-height:20px"></div>
      <div id="hm-letters" style="display:flex;flex-wrap:wrap;gap:6px;justify-content:center;max-width:400px;margin:0 auto"></div>
      <div id="hm-msg" style="font-family:var(--font-display);margin-top:14px;min-height:28px"></div>
    </div>
  `;

  function renderWord() {
    document.getElementById('hm-word').textContent = word.split('').map(l => guessed.has(l) ? l : '_').join(' ');
  }

  function renderLetters() {
    const el = document.getElementById('hm-letters');
    el.innerHTML = '';
    letters.forEach(l => {
      const btn = document.createElement('button');
      const used = guessed.has(l);
      const correct = word.includes(l) && used;
      btn.style.cssText = `
        width:34px;height:34px;border-radius:6px;font-family:var(--font-display);font-size:0.85rem;
        cursor:${used ? 'default' : 'pointer'};
        background:${correct ? 'rgba(0,255,136,0.2)' : used ? 'rgba(255,68,68,0.15)' : 'var(--surface)'};
        border:1px solid ${correct ? 'var(--accent)' : used ? 'var(--danger)' : 'var(--border)'};
        color:${correct ? 'var(--accent)' : used ? 'rgba(255,68,68,0.5)' : 'var(--text)'};
        transition:all 0.15s;
      `;
      btn.textContent = l;
      if (!used) { btn.onclick = () => playerGuess(l); btn.onmouseenter = () => { btn.style.borderColor = 'var(--accent)'; }; btn.onmouseleave = () => { btn.style.borderColor = 'var(--border)'; }; }
      el.appendChild(btn);
    });
  }

  function playerGuess(l) {
    if (guessed.has(l)) return;
    guessed.add(l);
    if (!word.includes(l)) { errors++; document.getElementById('hm-pe').textContent = errors; }
    renderWord(); renderLetters();
    checkEnd();
  }

  function robotGuess() {
    while (robotIdx < ROBOT_ORDER.length) {
      const l = ROBOT_ORDER[robotIdx++];
      if (!guessed.has(l)) {
        guessed.add(l);
        if (!word.includes(l)) { robotErrors++; document.getElementById('hm-re').textContent = robotErrors; }
        document.getElementById('hm-used').textContent = `Robot essaie: ${l}`;
        renderWord(); renderLetters();
        if (checkEnd()) return;
        break;
      }
    }
    if (!isComplete()) robotTimer = setTimeout(robotGuess, 1500 + Math.random()*1000);
  }

  function isComplete() { return word.split('').every(l => guessed.has(l)); }

  function checkEnd() {
    if (isComplete()) {
      clearTimeout(robotTimer);
      const result = errors <= robotErrors ? 'win' : 'loss';
      document.getElementById('hm-msg').innerHTML = `<span style="color:var(--accent)">🏆 Mot trouvé: ${word} !</span>`;
      setTimeout(() => Arena.end(result, Math.max(0, (MAX_ERRORS - errors) * 100)), 1200);
      return true;
    }
    if (errors >= MAX_ERRORS) {
      clearTimeout(robotTimer);
      document.getElementById('hm-msg').innerHTML = `<span style="color:var(--danger)">💀 Perdu ! Mot: ${word}</span>`;
      setTimeout(() => Arena.end('loss', 0), 1500);
      return true;
    }
    if (robotErrors >= MAX_ERRORS) {
      clearTimeout(robotTimer);
      document.getElementById('hm-msg').innerHTML = `<span style="color:var(--accent)">🤖 Le robot a échoué !</span>`;
      return false;
    }
    return false;
  }

  renderWord(); renderLetters();
  robotTimer = setTimeout(robotGuess, 2000);
};
