// Quiz Bot - Quiz de culture générale
window.startGame = function() {
  Arena.start();
  const QUESTIONS = [
    { q: "Quelle est la capitale de l'Australie ?", choices: ["Sydney", "Melbourne", "Canberra", "Perth"], a: 2 },
    { q: "Combien de côtés a un hexagone ?", choices: ["5", "6", "7", "8"], a: 1 },
    { q: "Qui a peint la Joconde ?", choices: ["Raphaël", "Michel-Ange", "Léonard de Vinci", "Botticelli"], a: 2 },
    { q: "Quelle est la planète la plus proche du Soleil ?", choices: ["Vénus", "Mars", "Mercure", "Terre"], a: 2 },
    { q: "En quelle année a été fondée Wikipedia ?", choices: ["1999", "2001", "2003", "2005"], a: 1 },
    { q: "Quel est l'élément chimique de symbole Fe ?", choices: ["Fluor", "Fer", "Francium", "Fermium"], a: 1 },
    { q: "Combien de joueurs dans une équipe de football ?", choices: ["9", "10", "11", "12"], a: 2 },
    { q: "Quelle langue est la plus parlée dans le monde ?", choices: ["Anglais", "Espagnol", "Mandarin", "Hindi"], a: 2 },
    { q: "Quel est le plus grand océan ?", choices: ["Atlantique", "Indien", "Arctique", "Pacifique"], a: 3 },
    { q: "Dans quel pays se trouve la Tour de Pise ?", choices: ["Espagne", "France", "Italie", "Portugal"], a: 2 },
    { q: "Qui a écrit 'Les Misérables' ?", choices: ["Zola", "Flaubert", "Hugo", "Balzac"], a: 2 },
    { q: "Quelle est la formule chimique de l'eau ?", choices: ["CO2", "H2O", "NaCl", "O2"], a: 1 },
  ];

  let round = 0, pScore = 0, rScore = 0;
  const ROUNDS = 8, ROBOT_TIME = 4000;
  const shuffled = QUESTIONS.sort(() => Math.random()-0.5).slice(0, ROUNDS);
  let robotTimer = null, answered = false;

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="text-align:center;padding:20px;width:100%;max-width:560px">
      <div style="display:flex;justify-content:space-between;font-family:var(--font-display);margin-bottom:12px">
        <span>👤 <span id="qb-ps" style="color:var(--accent)">0</span></span>
        <span style="color:var(--text3)">Q <span id="qb-r">1</span>/${ROUNDS}</span>
        <span>🤖 <span id="qb-rs" style="color:var(--danger)">0</span></span>
      </div>
      <div id="qb-progress" style="height:3px;background:var(--border);border-radius:2px;margin-bottom:20px;overflow:hidden">
        <div id="qb-bar" style="height:100%;background:var(--warn);width:100%"></div>
      </div>
      <div id="qb-q" style="font-size:1.15rem;font-weight:600;margin-bottom:20px;line-height:1.5;min-height:60px"></div>
      <div id="qb-choices" style="display:grid;grid-template-columns:1fr 1fr;gap:10px"></div>
      <div id="qb-feedback" style="font-family:var(--font-display);font-size:1rem;margin-top:14px;min-height:30px"></div>
    </div>
  `;

  function showQuestion() {
    answered = false;
    const q = shuffled[round];
    document.getElementById('qb-r').textContent = round + 1;
    document.getElementById('qb-q').textContent = q.q;
    document.getElementById('qb-feedback').textContent = '';

    const bar = document.getElementById('qb-bar');
    bar.style.transition = 'none'; bar.style.width = '100%';
    requestAnimationFrame(() => { bar.style.transition = `width ${ROBOT_TIME}ms linear`; bar.style.width = '0%'; });

    const choicesEl = document.getElementById('qb-choices');
    choicesEl.innerHTML = '';
    q.choices.forEach((ch, i) => {
      const btn = document.createElement('button');
      btn.style.cssText = 'padding:14px;border-radius:8px;background:var(--surface);border:2px solid var(--border);color:var(--text);font-size:0.95rem;cursor:pointer;transition:all 0.15s;text-align:left';
      btn.textContent = `${['A','B','C','D'][i]}. ${ch}`;
      btn.onmouseenter = () => { if (!answered) btn.style.borderColor = 'var(--accent)'; };
      btn.onmouseleave = () => { if (!answered) btn.style.borderColor = 'var(--border)'; };
      btn.onclick = () => answer(i, btn, q.a);
      choicesEl.appendChild(btn);
    });

    // Robot answers after ROBOT_TIME
    robotTimer = setTimeout(() => {
      if (!answered) {
        answered = true;
        // Robot gets it right 75% of the time
        const robotCorrect = Math.random() < 0.75;
        if (robotCorrect) { rScore++; document.getElementById('qb-rs').textContent = rScore; }
        document.getElementById('qb-feedback').innerHTML = `<span style="color:var(--danger)">⏱️ Temps écoulé ! Robot: ${robotCorrect ? '✅' : '❌'} Réponse: ${q.choices[q.a]}</span>`;
        highlightAnswers(q.a, -1);
        round++;
        setTimeout(round < ROUNDS ? showQuestion : endGame, 1500);
      }
    }, ROBOT_TIME);
  }

  function answer(idx, btn, correct) {
    if (answered) return;
    answered = true;
    clearTimeout(robotTimer);
    if (idx === correct) {
      pScore++; document.getElementById('qb-ps').textContent = pScore;
      document.getElementById('qb-feedback').innerHTML = `<span style="color:var(--accent)">✅ Correct !</span>`;
      btn.style.background = 'rgba(0,255,136,0.2)'; btn.style.borderColor = 'var(--accent)';
    } else {
      rScore++; document.getElementById('qb-rs').textContent = rScore;
      document.getElementById('qb-feedback').innerHTML = `<span style="color:var(--danger)">❌ Faux ! Réponse: ${shuffled[round].choices[correct]}</span>`;
      btn.style.background = 'rgba(255,68,68,0.2)'; btn.style.borderColor = 'var(--danger)';
      highlightAnswers(correct, idx);
    }
    round++;
    setTimeout(round < ROUNDS ? showQuestion : endGame, 1200);
  }

  function highlightAnswers(correct, wrong) {
    document.querySelectorAll('#qb-choices button').forEach((btn, i) => {
      if (i === correct) { btn.style.background = 'rgba(0,255,136,0.2)'; btn.style.borderColor = 'var(--accent)'; }
    });
  }

  function endGame() {
    const result = pScore > rScore ? 'win' : pScore < rScore ? 'loss' : 'draw';
    Arena.end(result, pScore * 150);
  }

  showQuestion();
};
