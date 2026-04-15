// Generic game stub generator
// This file creates playable stub versions for all remaining games

(function() {
  // Get current game info from global
  const gameConfigs = {
    colorflash: { name: 'Color Flash', type: 'reaction', desc: 'Clique sur la couleur affichée !', colors: ['#ff4444','#00ff88','#00c8ff','#ffa500','#ff00aa'] },
    taptap: { name: 'Tap Tap Bot', type: 'tapping', desc: 'Tape le plus vite possible !' },
    slidepuzzle: { name: 'Slide Sprint', type: 'puzzle', desc: 'Résous le puzzle numérique !' },
    wordsearch: { name: 'Word Hunter', type: 'word', desc: 'Trouve les mots cachés !' },
    sudokubot: { name: 'Sudoku Bot', type: 'sudoku', desc: 'Course au Sudoku !' },
    picross: { name: 'Pixel Logic', type: 'puzzle', desc: 'Nonogramme en duel !' },
    anagram: { name: 'AnagramBot', type: 'word', desc: 'Trouve l\'anagramme !' },
    binarybot: { name: 'Binary Bot', type: 'math', desc: 'Convertis en binaire !' },
    sequencer: { name: 'Sequencer', type: 'math', desc: 'Trouve le prochain nombre !' },
    primehunt: { name: 'Prime Hunt', type: 'math', desc: 'Identifie les premiers !' },
    balancescale: { name: 'Balance Bot', type: 'math', desc: 'Équilibre la balance !' },
    pathrecall: { name: 'Path Recall', type: 'memory', desc: 'Mémorise le chemin !' },
    numberseq: { name: 'Number Seq', type: 'memory', desc: 'Mémorise les chiffres !' },
    whichone: { name: 'Which Changed?', type: 'memory', desc: 'Repère le changement !' },
    snapbot: { name: 'Snap Bot', type: 'reaction', desc: 'Snap quand les cartes matchent !' },
    breakbot: { name: 'Break-Bot', type: 'arcade', desc: 'Casse-briques en compétition !' },
    asteroids: { name: 'Robo Asteroids', type: 'arcade', desc: 'Asteroids contre le robot !' },
    froggerbot: { name: 'Frogger Bot', type: 'arcade', desc: 'Traverse avant le robot !' },
    wordchain: { name: 'Word Chain', type: 'word', desc: 'Chaine de mots !' },
    scramble: { name: 'Scramble Bot', type: 'word', desc: 'Reconstitue les mots !' },
    pixelrace: { name: 'Pixel Race', type: 'creative', desc: 'Reproduis le pixel art !' },
    colorguess: { name: 'Color Guess', type: 'creative', desc: 'Devine la couleur hex !' },
    symmetry: { name: 'Symmetry Bot', type: 'creative', desc: 'Complète le dessin !' },
    shapematch: { name: 'Shape Match', type: 'creative', desc: 'Associe les formes !' },
    robosoccer: { name: 'Robo Soccer', type: 'sport', desc: 'Pénalty contre le robot !' },
    chess: { name: 'RoboChess', type: 'strategy', desc: 'Échecs express !' },
    othello: { name: 'Flip-Bot', type: 'strategy', desc: 'Reversi contre l\'IA !' },
    minesweeper: { name: 'Bot Mines', type: 'strategy', desc: 'Démine plus vite !' },
  };

  const config = gameConfigs[window.GAME_ID];
  if (!config) return; // Use default startGame from engine.js

  window.startGame = function() {
    Arena.start();
    const c = Arena.getContainer();

    // Generate a mini-game based on type
    if (config.type === 'reaction') renderReactionGame(c, config);
    else if (config.type === 'tapping') renderTappingGame(c, config);
    else if (config.type === 'math') renderMathGame(c, config);
    else if (config.type === 'memory') renderMemoryGame(c, config);
    else if (config.type === 'word') renderWordGame(c, config);
    else if (config.type === 'sport') renderSportGame(c, config);
    else renderComingSoon(c, config);
  };

  function renderReactionGame(c, config) {
    // Color Flash type
    const COLORS = config.colors || ['#ff4444','#00ff88','#00c8ff','#ffa500','#ff00aa'];
    let score = 0, round = 0, ROUNDS = 10, robotScore = 0;
    c.innerHTML = `
      <div style="text-align:center;padding:24px;width:100%;max-width:440px">
        <div style="font-family:var(--font-display);margin-bottom:16px">
          👤 <span id="rg-ps" style="color:var(--accent)">0</span> &nbsp;|&nbsp; Round <span id="rg-r">1</span>/${ROUNDS} &nbsp;|&nbsp; 🤖 <span id="rg-rs" style="color:var(--danger)">0</span>
        </div>
        <div id="rg-target" style="width:100px;height:100px;border-radius:50%;margin:0 auto 20px;border:4px solid rgba(255,255,255,0.2)"></div>
        <div id="rg-msg" style="color:var(--text2);margin-bottom:16px">${config.desc}</div>
        <div id="rg-btns" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"></div>
        <div id="rg-feedback" style="font-family:var(--font-display);margin-top:12px;min-height:28px"></div>
      </div>`;
    function nextRound() {
      round++;
      if (round > ROUNDS) { Arena.end(score > robotScore ? 'win':'loss', score*100); return; }
      document.getElementById('rg-r').textContent = round;
      document.getElementById('rg-feedback').textContent = '';
      const target = COLORS[Math.floor(Math.random()*COLORS.length)];
      document.getElementById('rg-target').style.background = target;
      const choices = [target, ...COLORS.filter(c2=>c2!==target).sort(()=>Math.random()-0.5).slice(0,3)].sort(()=>Math.random()-0.5);
      const btns = document.getElementById('rg-btns');
      btns.innerHTML = '';
      let answered = false;
      const robotTime = 800 + Math.random()*1200;
      const robotTimer = setTimeout(() => {
        if (!answered) { answered=true; robotScore++; document.getElementById('rg-rs').textContent=robotScore; document.getElementById('rg-feedback').innerHTML=`<span style="color:var(--danger)">🤖 Robot plus rapide !</span>`; setTimeout(nextRound,800); }
      }, robotTime);
      choices.forEach(col => {
        const btn = document.createElement('button');
        btn.style.cssText = `width:50px;height:50px;border-radius:50%;background:${col};border:3px solid transparent;cursor:pointer;transition:transform 0.15s`;
        btn.onclick = () => {
          if (answered) return; answered=true; clearTimeout(robotTimer);
          if (col === target) { score++; document.getElementById('rg-ps').textContent=score; document.getElementById('rg-feedback').innerHTML=`<span style="color:var(--accent)">✅ Correct !</span>`; }
          else { robotScore++; document.getElementById('rg-rs').textContent=robotScore; document.getElementById('rg-feedback').innerHTML=`<span style="color:var(--danger)">❌ Mauvaise couleur</span>`; }
          setTimeout(nextRound, 800);
        };
        btn.onmouseenter=()=>btn.style.transform='scale(1.15)'; btn.onmouseleave=()=>btn.style.transform='scale(1)';
        btns.appendChild(btn);
      });
    }
    nextRound();
  }

  function renderTappingGame(c, config) {
    let score = 0, timeLeft = 15, running = true;
    c.innerHTML = `
      <div style="text-align:center;padding:24px;width:100%;max-width:380px">
        <div style="font-family:var(--font-display);margin-bottom:12px">
          ⏱️ <span id="tap-t" style="color:var(--accent)">15</span>s &nbsp;|&nbsp; Score: <span id="tap-s">0</span>
        </div>
        <div id="tap-btn" style="width:160px;height:160px;border-radius:50%;margin:0 auto 20px;background:var(--surface);border:4px solid var(--accent);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:3rem;transition:transform 0.05s;user-select:none" onclick="tapClick()">👆</div>
        <p style="color:var(--text2)">Le robot tape à 8/sec. Peux-tu faire mieux ?</p>
      </div>`;
    const timer = setInterval(()=>{ if(!running)return; timeLeft--; document.getElementById('tap-t').textContent=timeLeft; if(timeLeft<=0){ clearInterval(timer); running=false; const robotScore=8*15; Arena.end(score>robotScore?'win':'loss',score*10); }}, 1000);
    window.tapClick = () => { if(!running)return; score++; document.getElementById('tap-s').textContent=score; const btn=document.getElementById('tap-btn'); btn.style.transform='scale(0.9)'; setTimeout(()=>btn.style.transform='scale(1)',50); };
  }

  function renderMathGame(c, config) {
    // Sequence game
    let score = 0, round = 0, ROUNDS = 8;
    function genSeq() {
      const types = ['arithmetic','geometric','squares'];
      const t = types[Math.floor(Math.random()*types.length)];
      let seq = [];
      if (t==='arithmetic') { const s=Math.floor(Math.random()*5)+1, d=Math.floor(Math.random()*5)+1; for(let i=0;i<5;i++) seq.push(s+d*i); }
      else if (t==='geometric') { const s=Math.floor(Math.random()*3)+1, r=Math.floor(Math.random()*3)+2; for(let i=0;i<5;i++) seq.push(s*Math.pow(r,i)); }
      else { const s=Math.floor(Math.random()*5)+1; for(let i=s;i<s+5;i++) seq.push(i*i); }
      return seq;
    }
    c.innerHTML = `<div style="text-align:center;padding:24px;width:100%;max-width:460px">
      <div style="font-family:var(--font-display);margin-bottom:16px">Trouve le suivant: Round <span id="sq-r">1</span>/${ROUNDS} | Score: <span id="sq-s" style="color:var(--accent)">0</span></div>
      <div id="sq-seq" style="font-family:var(--font-display);font-size:1.6rem;margin:16px 0;color:var(--text)"></div>
      <div id="sq-choices" style="display:flex;gap:10px;flex-wrap:wrap;justify-content:center"></div>
      <div id="sq-fb" style="font-family:var(--font-display);margin-top:12px;min-height:28px"></div>
    </div>`;
    function nextQ() {
      round++; if(round>ROUNDS){Arena.end(score>ROUNDS/2?'win':'loss',score*150);return;}
      document.getElementById('sq-r').textContent=round;
      document.getElementById('sq-fb').textContent='';
      const seq=genSeq(); const ans=seq[4];
      document.getElementById('sq-seq').textContent=seq.slice(0,4).join(' → ')+' → ?';
      const choices=new Set([ans]);
      while(choices.size<4){const w=ans+Math.floor(Math.random()*20)-10;if(w!==ans&&w>0)choices.add(w);}
      const arr=[...choices].sort(()=>Math.random()-0.5);
      const el=document.getElementById('sq-choices'); el.innerHTML='';
      arr.forEach(ch=>{const btn=document.createElement('button');btn.style.cssText='padding:12px 20px;border-radius:8px;background:var(--surface);border:2px solid var(--border);color:var(--text);font-family:var(--font-display);font-size:1.1rem;cursor:pointer;transition:all 0.15s';btn.textContent=ch;btn.onclick=()=>{if(ch===ans){score++;document.getElementById('sq-s').textContent=score;document.getElementById('sq-fb').innerHTML=`<span style="color:var(--accent)">✅</span>`;}else{document.getElementById('sq-fb').innerHTML=`<span style="color:var(--danger)">❌ Réponse: ${ans}</span>`;}setTimeout(nextQ,900);};btn.onmouseenter=()=>btn.style.borderColor='var(--accent)';btn.onmouseleave=()=>btn.style.borderColor='var(--border)';el.appendChild(btn);});
    }
    nextQ();
  }

  function renderMemoryGame(c, config) {
    const EMOJIS=['🤖','🦾','👾','🎮','⚡','🔥','💎','🏆','🚀','🎯'];
    let seq=[], shown=false, playerSeq=[], canClick=false, round=0;
    c.innerHTML=`<div style="text-align:center;padding:20px;width:100%;max-width:400px">
      <div id="mem-msg" style="font-family:var(--font-display);margin-bottom:12px;color:var(--text2)">Mémorise la séquence !</div>
      <div id="mem-grid" style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin:16px auto;max-width:300px"></div>
      <div id="mem-info" style="color:var(--text3);font-size:0.85rem">Niveau <span id="mem-l">1</span></div>
    </div>`;
    function renderGrid(highlight=-1){const g=document.getElementById('mem-grid');g.innerHTML='';EMOJIS.slice(0,6).forEach((e,i)=>{const btn=document.createElement('div');btn.style.cssText=`width:70px;height:70px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:2rem;border:2px solid ${i===highlight?'var(--accent)':'var(--border)'};background:${i===highlight?'rgba(0,255,136,0.2)':'var(--surface)'};cursor:${canClick?'pointer':'default'};transition:all 0.15s`;btn.textContent=e;if(canClick)btn.onclick=()=>playerClick(i);g.appendChild(btn);});}
    function nextRound(){round++;seq.push(Math.floor(Math.random()*6));document.getElementById('mem-l').textContent=round;document.getElementById('mem-msg').textContent='Observe...';canClick=false;renderGrid();let i=0;function show(){if(i>=seq.length){setTimeout(()=>{canClick=true;playerSeq=[];document.getElementById('mem-msg').textContent='À toi !';renderGrid();},400);return;}renderGrid(seq[i]);setTimeout(()=>{renderGrid();setTimeout(()=>{i++;show();},300);},700);}setTimeout(show,600);}
    function playerClick(i){if(!canClick)return;playerSeq.push(i);const pos=playerSeq.length-1;if(playerSeq[pos]!==seq[pos]){canClick=false;document.getElementById('mem-msg').innerHTML=`<span style="color:var(--danger)">❌ Erreur au niveau ${round}</span>`;setTimeout(()=>Arena.end(round>3?'win':'loss',round*100),1200);return;}if(playerSeq.length===seq.length){if(round>=8){setTimeout(()=>Arena.end('win',round*150),600);}else{setTimeout(nextRound,800);}}}
    nextRound();
  }

  function renderWordGame(c, config) {
    const ANAGRAMS=[['ROBOT','BORT'],['ARENE','RÉNAE'],['ECRAN','CRANE'],['SOURIS','SIROUX'],['CLAVIER','CAVLERI'],['RESEAU','SAREUX'],['DONNEE','ONDÉNE'],['DISQUE','DIQUESE']];
    let score=0,round=0,ROUNDS=6;
    c.innerHTML=`<div style="text-align:center;padding:24px;width:100%;max-width:460px">
      <div style="font-family:var(--font-display);margin-bottom:12px">Anagramme | Round <span id="ag-r">1</span>/${ROUNDS} | <span id="ag-s" style="color:var(--accent)">0</span> pts</div>
      <div id="ag-q" style="font-family:var(--font-display);font-size:2.5rem;color:var(--accent);margin:16px 0;letter-spacing:8px"></div>
      <p style="color:var(--text2);margin-bottom:16px">Quel mot se cache ici ?</p>
      <input id="ag-inp" type="text" style="padding:12px 16px;border-radius:8px;background:var(--surface);border:2px solid var(--border);color:var(--text);font-family:var(--font-display);font-size:1.1rem;text-transform:uppercase;outline:none;text-align:center;width:240px" maxlength="12" placeholder="Ta réponse...">
      <br><button id="ag-sub" style="margin-top:12px;padding:10px 24px;border-radius:8px;background:var(--accent);color:var(--bg);font-family:var(--font-display);border:none;cursor:pointer" onclick="agSubmit()">Valider</button>
      <div id="ag-fb" style="font-family:var(--font-display);margin-top:12px;min-height:28px"></div>
    </div>`;
    let current;
    function nextQ(){round++;if(round>ROUNDS){Arena.end(score>ROUNDS/2?'win':'loss',score*150);return;}document.getElementById('ag-r').textContent=round;document.getElementById('ag-fb').textContent='';document.getElementById('ag-inp').value='';current=ANAGRAMS[Math.floor(Math.random()*ANAGRAMS.length)];document.getElementById('ag-q').textContent=current[1];}
    window.agSubmit=()=>{const v=document.getElementById('ag-inp').value.toUpperCase().trim();if(v===current[0]){score++;document.getElementById('ag-s').textContent=score;document.getElementById('ag-fb').innerHTML=`<span style="color:var(--accent)">✅ Correct !</span>`;}else{document.getElementById('ag-fb').innerHTML=`<span style="color:var(--danger)">❌ C'était: ${current[0]}</span>`;}setTimeout(nextQ,1000);};
    document.getElementById('ag-inp').addEventListener('keydown',e=>{if(e.key==='Enter')agSubmit();});
    nextQ();
  }

  function renderSportGame(c, config) {
    let score=0, round=0, ROUNDS=5;
    c.innerHTML=`<div style="text-align:center;padding:24px;width:100%;max-width:400px">
      <div style="font-family:var(--font-display);margin-bottom:12px">Pénalty | But <span id="sk-r">1</span>/${ROUNDS} | <span id="sk-s" style="color:var(--accent)">0</span> buts</div>
      <div style="font-size:4rem;margin:10px 0">⚽</div>
      <div id="sk-goal" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:300px;margin:0 auto 16px">
        ${[0,1,2,3,4,5,6,7,8].map(i=>`<button style="height:70px;border-radius:6px;background:rgba(255,255,255,0.05);border:2px solid var(--border);cursor:pointer;font-size:1.5rem;transition:all 0.15s" onmouseenter="this.style.background='rgba(0,255,136,0.1)'" onmouseleave="this.style.background='rgba(255,255,255,0.05)'" onclick="skShoot(${i})">🟩</button>`).join('')}
      </div>
      <div id="sk-fb" style="font-family:var(--font-display);min-height:28px"></div>
    </div>`;
    window.skShoot=(zone)=>{round++;if(round>ROUNDS)return;document.getElementById('sk-r').textContent=Math.min(round+1,ROUNDS);const robotZone=Math.floor(Math.random()*9);const scored=robotZone!==zone;if(scored){score++;document.getElementById('sk-s').textContent=score;document.getElementById('sk-fb').innerHTML=`<span style="color:var(--accent)">⚽ BUT !</span>`;}else{document.getElementById('sk-fb').innerHTML=`<span style="color:var(--danger)">🤖 Arrêté !</span>`;}if(round>=ROUNDS)setTimeout(()=>Arena.end(score>=3?'win':'loss',score*120),1000);};
  }

  function renderComingSoon(c, config) {
    c.innerHTML=`<div style="text-align:center;padding:40px">
      <div style="font-size:4rem;margin-bottom:16px">🚧</div>
      <h2 style="font-family:var(--font-display);color:var(--accent);margin-bottom:8px">${config.name}</h2>
      <p style="color:var(--text2);margin-bottom:24px">${config.desc}<br>Ce jeu est en cours de développement !</p>
      <button class="btn-secondary" onclick="Arena.end('draw',0)">Terminer (partie nulle)</button>
    </div>`;
  }
})();
