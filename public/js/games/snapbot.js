// Snap Bot - Frappe quand les cartes sont identiques !
window.startGame = function() {
  Arena.start();
  const EMOJIS = ['🤖','👾','🦾','🎮','⚡','🔥','💎','🏆','🚀','🎯','🌈','🎪'];
  let score = 0, robotScore = 0, round = 0, missed = 0;
  const TOTAL = 20;
  let current = null, prev = null;
  let canSnap = true, snapTimeout = null;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:24px;width:100%;max-width:420px">
      <div style="font-family:var(--font-display);margin-bottom:12px;display:flex;justify-content:space-around">
        <span>👤 <span id="sn-ps" style="color:var(--accent)">0</span></span>
        <span style="color:var(--text3)"><span id="sn-r">0</span>/${TOTAL}</span>
        <span>🤖 <span id="sn-rs" style="color:var(--danger)">0</span></span>
      </div>
      <p style="color:var(--text2);font-size:0.85rem;margin-bottom:16px">Clique quand les deux cartes sont <strong style="color:var(--accent)">identiques</strong> !</p>
      <div style="display:flex;gap:20px;justify-content:center;margin-bottom:20px">
        <div id="sn-prev" style="width:100px;height:100px;border-radius:12px;background:var(--surface);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:3rem">❓</div>
        <div id="sn-curr" style="width:100px;height:100px;border-radius:12px;background:var(--surface);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:3rem">❓</div>
      </div>
      <button id="sn-btn" style="
        width:160px;height:60px;border-radius:30px;
        background:var(--surface);border:3px solid var(--accent);
        color:var(--accent);font-family:var(--font-display);font-size:1rem;
        cursor:pointer;transition:all 0.1s;
        box-shadow:0 0 15px rgba(0,255,136,0.2);
      ">⚡ SNAP !</button>
      <div id="sn-fb" style="font-family:var(--font-display);margin-top:14px;min-height:28px"></div>
    </div>
  `;

  document.getElementById('sn-btn').onclick = handleSnap;
  document.addEventListener('keydown', e => { if (e.code === 'Space') { e.preventDefault(); handleSnap(); }});

  function handleSnap() {
    if (!canSnap || round === 0) return;
    const isMatch = current === prev;
    if (isMatch) {
      score++;
      document.getElementById('sn-ps').textContent = score;
      document.getElementById('sn-fb').innerHTML = `<span style="color:var(--accent)">✅ SNAP !</span>`;
      document.getElementById('sn-curr').style.borderColor = 'var(--accent)';
      document.getElementById('sn-prev').style.borderColor = 'var(--accent)';
    } else {
      missed++;
      document.getElementById('sn-fb').innerHTML = `<span style="color:var(--danger)">❌ Pas identiques !</span>`;
      document.getElementById('sn-btn').style.borderColor = 'var(--danger)';
      setTimeout(() => document.getElementById('sn-btn').style.borderColor = 'var(--accent)', 500);
    }
  }

  function nextCard() {
    if (round >= TOTAL) {
      const result = score > robotScore ? 'win' : score < robotScore ? 'loss' : 'draw';
      Arena.end(result, score * 100);
      return;
    }
    round++;
    document.getElementById('sn-r').textContent = round;
    document.getElementById('sn-fb').textContent = '';
    canSnap = false;

    prev = current;
    // 30% chance of match
    const forceMatch = Math.random() < 0.3 && prev !== null;
    current = forceMatch ? prev : EMOJIS[Math.floor(Math.random() * EMOJIS.length)];

    // Animate card flip
    const currEl = document.getElementById('sn-curr');
    const prevEl = document.getElementById('sn-prev');
    currEl.style.transform = 'scale(0)';
    currEl.style.borderColor = 'var(--border)';
    prevEl.style.borderColor = 'var(--border)';

    setTimeout(() => {
      prevEl.textContent = prev || '❓';
      currEl.textContent = current;
      currEl.style.transform = 'scale(1)';
      canSnap = true;

      // Robot check: reacts in 400-900ms on matches
      if (current === prev) {
        const robotDelay = 400 + Math.random() * 500;
        snapTimeout = setTimeout(() => {
          if (canSnap) {
            robotScore++;
            document.getElementById('sn-rs').textContent = robotScore;
            canSnap = false;
            document.getElementById('sn-fb').innerHTML = `<span style="color:var(--danger)">🤖 Robot a snappé !</span>`;
            setTimeout(nextCard, 700);
          }
        }, robotDelay);
      } else {
        // Auto-advance after 1.5s
        snapTimeout = setTimeout(() => {
          canSnap = false;
          nextCard();
        }, 1500);
      }
    }, 200);

    // If player snaps on a match, clear robot timer and advance
    document.getElementById('sn-btn').onclick = () => {
      if (!canSnap) return;
      clearTimeout(snapTimeout);
      canSnap = false;
      handleSnap();
      setTimeout(nextCard, 700);
    };
  }

  // Start
  setTimeout(nextCard, 800);
};
