// Type Racer - Frappe le texte plus vite que le robot
window.startGame = function() {
  Arena.start();
  const TEXTS = [
    "Les robots envahissent l'arène mais les humains résistent.",
    "Frappe vite ou le robot te dépasse dans cette course effrénée.",
    "La technologie avance mais l'esprit humain reste inégalable.",
    "Chaque caractère compte dans cette bataille numérique épique.",
    "RoboArena est le terrain de jeu ultime entre hommes et machines."
  ];
  const text = TEXTS[Math.floor(Math.random() * TEXTS.length)];
  let typed = 0, started = false, robotDone = false, playerDone = false;

  // Robot types at ~250 chars/min with slight variance
  const ROBOT_WPM = 55 + Math.floor(Math.random() * 20);
  const robotMsPerChar = 60000 / (ROBOT_WPM * 5);

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="width:100%;max-width:600px;padding:20px">
      <div style="margin-bottom:20px">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-family:var(--font-display);font-size:0.85rem">
          <span>👤 Toi</span><span>🤖 Robot (${ROBOT_WPM} WPM)</span>
        </div>
        <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden;margin-bottom:4px">
          <div id="tr-pbar" style="height:100%;background:var(--accent);width:0%;transition:width 0.1s"></div>
        </div>
        <div style="height:8px;background:var(--border);border-radius:4px;overflow:hidden">
          <div id="tr-rbar" style="height:100%;background:var(--danger);width:0%;transition:width 0.1s"></div>
        </div>
      </div>

      <div id="tr-text" style="
        font-size:1.1rem;line-height:1.8;padding:16px;
        background:var(--bg3);border-radius:8px;border:1px solid var(--border);
        margin-bottom:16px;letter-spacing:0.5px;font-family:var(--font-body);
      "></div>

      <input id="tr-input" type="text" placeholder="Tape ici pour commencer..." style="
        width:100%;padding:14px;border-radius:8px;
        background:var(--surface);border:2px solid var(--border);
        color:var(--text);font-size:1rem;font-family:var(--font-body);
        outline:none;transition:border-color 0.2s;
      " autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">

      <div id="tr-stats" style="display:flex;gap:20px;margin-top:12px;color:var(--text3);font-size:0.85rem">
        <span>⏱️ <span id="tr-time">0.0s</span></span>
        <span>⚡ <span id="tr-wpm">0</span> WPM</span>
        <span>❌ <span id="tr-errors">0</span> erreurs</span>
      </div>
    </div>
  `;

  // Render colored text
  function renderText(typed) {
    const el = document.getElementById('tr-text');
    el.innerHTML = text.split('').map((ch, i) => {
      if (i < typed) {
        const correct = ch === (document.getElementById('tr-input')?.value[i] || '');
        return `<span style="color:${correct?'var(--accent)':'var(--danger)'}${correct?';background:rgba(0,255,136,0.08)':';background:rgba(255,68,68,0.1)'}">${ch}</span>`;
      } else if (i === typed) {
        return `<span style="background:rgba(0,200,255,0.2);color:var(--accent2)">${ch}</span>`;
      }
      return `<span style="color:var(--text2)">${ch}</span>`;
    }).join('');
  }
  renderText(0);

  let startTime, errors = 0, timerInterval;
  let robotProgress = 0, robotInterval;

  const input = document.getElementById('tr-input');
  input.focus();

  input.addEventListener('input', () => {
    if (!started) {
      started = true;
      startTime = Date.now();
      timerInterval = setInterval(updateStats, 100);

      // Start robot
      robotInterval = setInterval(() => {
        if (!robotDone) {
          robotProgress = Math.min(robotProgress + 1, text.length);
          document.getElementById('tr-rbar').style.width = (robotProgress / text.length * 100) + '%';
          if (robotProgress >= text.length) {
            clearInterval(robotInterval);
            robotDone = true;
            if (!playerDone) {
              clearInterval(timerInterval);
              playerDone = true;
              Arena.end('loss', Arena.score);
            }
          }
        }
      }, robotMsPerChar);
    }

    const val = input.value;
    typed = val.length;
    errors = 0;
    for (let i = 0; i < typed; i++) { if (val[i] !== text[i]) errors++; }
    document.getElementById('tr-errors').textContent = errors;
    document.getElementById('tr-pbar').style.width = (typed / text.length * 100) + '%';
    renderText(typed);

    if (typed >= text.length && errors === 0) {
      clearInterval(timerInterval);
      clearInterval(robotInterval);
      playerDone = true;
      const elapsed = (Date.now() - startTime) / 1000;
      const wpm = Math.round((text.length / 5) / (elapsed / 60));
      const bonus = robotDone ? 0 : Math.floor((text.length - robotProgress) * 5);
      Arena.end(robotDone ? 'loss' : 'win', wpm * 10 + bonus);
    }
  });

  function updateStats() {
    const elapsed = (Date.now() - startTime) / 1000;
    document.getElementById('tr-time').textContent = elapsed.toFixed(1) + 's';
    const wpm = Math.round((typed / 5) / (elapsed / 60));
    document.getElementById('tr-wpm').textContent = isFinite(wpm) ? wpm : 0;
  }
};
