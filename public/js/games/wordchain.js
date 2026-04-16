// Word Chain - Chaine de mots : dernier lettre = première lettre du suivant
window.startGame = function() {
  Arena.start();
  const WORDS = [
    'ROBOT','TIGRE','ECRAN','NAPPE','PIXEL','LAMPE','ETOILE','ELAN','NUAGE','ELEPHANT',
    'TRAIN','NUIT','TOUR','ROUGE','EGLISE','ETOILE','LUNE','ECLAIR','RAISIN','NOEL',
    'LAPIN','NAVIRE','EPERVIER','RENARD','DAUPHIN','NUMERO','OURSON','NAGEOIRE',
    'ARENE','ETINCELLE','ESCALIER','ROSEAU','UNIVERS','SOLEIL','LOUP','PELICAN',
  ];
  const WORD_SET = new Set(WORDS.map(w => w.toUpperCase()));

  let chain = [], round = 0, score = 0;
  const MAX_ROUNDS = 10;
  const ROBOT_TIME = 5000;
  let robotTimer = null;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:20px;width:100%;max-width:520px">
      <div style="font-family:var(--font-display);margin-bottom:12px">
        Score: <span id="wc-s" style="color:var(--accent)">0</span>
        &nbsp;|&nbsp; Tour <span id="wc-r">1</span>/${MAX_ROUNDS}
      </div>
      <div id="wc-prog" style="height:4px;background:var(--border);border-radius:2px;margin-bottom:16px;overflow:hidden">
        <div id="wc-bar" style="height:100%;background:var(--warn);width:100%"></div>
      </div>
      <div id="wc-chain" style="
        display:flex;flex-wrap:wrap;gap:8px;justify-content:center;
        min-height:48px;padding:12px;background:var(--bg3);
        border-radius:10px;margin-bottom:16px;border:1px solid var(--border);
      "></div>
      <div id="wc-hint" style="color:var(--text2);margin-bottom:12px;font-size:0.9rem"></div>
      <div style="display:flex;gap:10px;justify-content:center;max-width:380px;margin:0 auto">
        <input id="wc-input" type="text" maxlength="20"
          style="flex:1;padding:12px 16px;border-radius:8px;
          background:var(--surface);border:2px solid var(--border);
          color:var(--text);font-family:var(--font-display);
          font-size:1.1rem;text-transform:uppercase;outline:none;"
          placeholder="Ton mot..."
          autocomplete="off" autocorrect="off" spellcheck="false">
        <button id="wc-submit" class="btn-primary" style="padding:12px 20px">→</button>
      </div>
      <div id="wc-fb" style="font-family:var(--font-display);margin-top:12px;min-height:28px"></div>
    </div>
  `;

  const input = document.getElementById('wc-input');
  input.focus();
  input.addEventListener('keydown', e => { if (e.key === 'Enter') tryWord(); });
  document.getElementById('wc-submit').onclick = tryWord;

  function getLastLetter() {
    if (!chain.length) return null;
    return chain[chain.length - 1].slice(-1).toUpperCase();
  }

  function renderChain() {
    const el = document.getElementById('wc-chain');
    el.innerHTML = '';
    chain.forEach((w, i) => {
      const span = document.createElement('span');
      span.style.cssText = `
        padding:4px 10px;border-radius:16px;font-family:var(--font-display);font-size:0.85rem;
        background:${i % 2 === 0 ? 'rgba(0,255,136,0.15)' : 'rgba(255,68,68,0.15)'};
        color:${i % 2 === 0 ? 'var(--accent)' : 'var(--danger)'};
        border:1px solid ${i % 2 === 0 ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,68,0.3)'};
      `;
      span.textContent = w;
      el.appendChild(span);
    });

    const last = getLastLetter();
    if (last) {
      document.getElementById('wc-hint').textContent = `Ton mot doit commencer par : "${last}"`;
    } else {
      document.getElementById('wc-hint').textContent = 'Commence avec n\'importe quel mot !';
    }
  }

  function robotPlay() {
    const lastLetter = getLastLetter();
    const candidates = WORDS.filter(w => {
      const upper = w.toUpperCase();
      return (!lastLetter || upper[0] === lastLetter) && !chain.includes(upper);
    });
    if (!candidates.length) { endGame('win'); return; }
    const word = candidates[Math.floor(Math.random() * candidates.length)].toUpperCase();
    chain.push(word);
    renderChain();
    round++;
    document.getElementById('wc-r').textContent = round;
    document.getElementById('wc-fb').innerHTML = `<span style="color:var(--danger)">🤖 ${word}</span>`;

    if (round >= MAX_ROUNDS) { endGame(); return; }
    startTimer();
  }

  function startTimer() {
    const bar = document.getElementById('wc-bar');
    bar.style.transition = 'none'; bar.style.width = '100%';
    requestAnimationFrame(() => {
      bar.style.transition = `width ${ROBOT_TIME}ms linear`;
      bar.style.width = '0%';
    });
    robotTimer = setTimeout(() => {
      document.getElementById('wc-fb').innerHTML = `<span style="color:var(--danger)">⏱️ Temps écoulé !</span>`;
      setTimeout(() => endGame('loss'), 800);
    }, ROBOT_TIME);
  }

  function tryWord() {
    const val = input.value.toUpperCase().trim();
    if (!val) return;
    input.value = '';
    clearTimeout(robotTimer);

    const lastLetter = getLastLetter();
    if (lastLetter && val[0] !== lastLetter) {
      document.getElementById('wc-fb').innerHTML = `<span style="color:var(--danger)">❌ Doit commencer par "${lastLetter}"</span>`;
      startTimer();
      return;
    }
    if (chain.includes(val)) {
      document.getElementById('wc-fb').innerHTML = `<span style="color:var(--danger)">❌ Déjà utilisé !</span>`;
      startTimer();
      return;
    }
    if (!WORD_SET.has(val)) {
      document.getElementById('wc-fb').innerHTML = `<span style="color:var(--warn)">⚠️ Mot inconnu, mais on continue !</span>`;
    } else {
      document.getElementById('wc-fb').innerHTML = `<span style="color:var(--accent)">✅ ${val}</span>`;
    }

    chain.push(val);
    score += 50;
    document.getElementById('wc-s').textContent = score;
    round++;
    document.getElementById('wc-r').textContent = round;
    renderChain();

    if (round >= MAX_ROUNDS) { endGame(); return; }

    // Robot responds after 1s
    setTimeout(robotPlay, 1000);
  }

  function endGame(forceResult = null) {
    const result = forceResult || (score >= 200 ? 'win' : 'loss');
    Arena.end(result, score);
  }

  renderChain();
  startTimer();
};
