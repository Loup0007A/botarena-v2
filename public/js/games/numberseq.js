// Number Seq - Mémorise la séquence de chiffres
window.startGame = function() {
  Arena.start();
  let level = 0, score = 0;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:24px;width:100%;max-width:460px">
      <div id="ns-info" style="font-family:var(--font-display);margin-bottom:16px;color:var(--text2)">
        Niveau <span id="ns-l" style="color:var(--accent)">1</span> — Score: <span id="ns-s">0</span>
      </div>
      <div id="ns-seq" style="
        font-family:var(--font-display);font-size:3rem;
        letter-spacing:8px;margin:20px 0;min-height:70px;
        color:var(--accent);
      "></div>
      <div id="ns-msg" style="color:var(--text2);margin-bottom:16px;min-height:24px"></div>
      <div id="ns-pad" style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;max-width:300px;margin:0 auto"></div>
      <div id="ns-input" style="font-family:var(--font-display);font-size:2rem;letter-spacing:8px;min-height:60px;margin-top:16px;color:var(--accent2)"></div>
    </div>
  `;

  function buildPad(onPress) {
    const pad = document.getElementById('ns-pad');
    pad.innerHTML = '';
    [1,2,3,4,5,6,7,8,9,'←',0,'✓'].forEach(k => {
      const btn = document.createElement('button');
      btn.textContent = k;
      btn.style.cssText = `
        padding:16px;border-radius:8px;
        background:var(--surface);border:2px solid var(--border);
        color:var(--text);font-family:var(--font-display);font-size:1.2rem;
        cursor:pointer;transition:all 0.15s;
      `;
      btn.onmouseenter = () => btn.style.borderColor = 'var(--accent)';
      btn.onmouseleave = () => btn.style.borderColor = 'var(--border)';
      btn.onclick = () => onPress(k);
      pad.appendChild(btn);
    });
  }

  function runLevel() {
    level++;
    const seqLen = level + 2; // starts at 3 digits
    document.getElementById('ns-l').textContent = level;
    document.getElementById('ns-msg').textContent = 'Mémorise !';
    document.getElementById('ns-pad').innerHTML = '';
    document.getElementById('ns-input').textContent = '';

    // Generate sequence
    const seq = Array.from({ length: seqLen }, () => Math.floor(Math.random() * 10));

    // Show sequence
    const seqEl = document.getElementById('ns-seq');
    seqEl.textContent = seq.join(' ');

    // Hide after 1.2s per digit
    const showTime = seqLen * 1000 + 500;
    setTimeout(() => {
      seqEl.textContent = '? ? ?'.replace(/\?/g, '?').split('').slice(0, seqLen * 2 - 1).join('') ;
      seqEl.textContent = Array(seqLen).fill('_').join(' ');
      document.getElementById('ns-msg').textContent = 'Tape la séquence :';

      let typed = [];
      buildPad(k => {
        if (k === '←') {
          typed.pop();
          document.getElementById('ns-input').textContent = typed.join(' ') || '';
          return;
        }
        if (k === '✓') {
          validate();
          return;
        }
        if (typed.length >= seqLen) return;
        typed.push(k);
        document.getElementById('ns-input').textContent = typed.join(' ');
        if (typed.length === seqLen) validate();
      });

      function validate() {
        document.getElementById('ns-pad').innerHTML = '';
        const correct = typed.join('') === seq.join('');
        if (correct) {
          score += level * 50;
          document.getElementById('ns-s').textContent = score;
          document.getElementById('ns-seq').textContent = seq.join(' ');
          document.getElementById('ns-msg').innerHTML = `<span style="color:var(--accent)">✅ Parfait !</span>`;
          if (level >= 8) {
            setTimeout(() => Arena.end('win', score), 1000);
          } else {
            setTimeout(runLevel, 1200);
          }
        } else {
          document.getElementById('ns-seq').textContent = seq.join(' ');
          document.getElementById('ns-msg').innerHTML = `<span style="color:var(--danger)">❌ La bonne séquence était: ${seq.join(' ')}</span>`;
          setTimeout(() => Arena.end(level > 3 ? 'win' : 'loss', score), 1500);
        }
      }
    }, showTime);
  }

  runLevel();
};
