// Memory Clash - Memory cards contre l'IA
window.startGame = function() {
  Arena.start();
  const EMOJIS = ['🤖','🦾','👾','🎮','⚡','🔥','💎','🏆','🌈','🎯','🚀','🎭'];
  const pairs = EMOJIS.slice(0, 8);
  let cards = [...pairs, ...pairs].sort(() => Math.random() - 0.5).map((e, i) => ({ id: i, emoji: e, flipped: false, matched: false }));
  let playerScore = 0, robotScore = 0;
  let selected = [], canClick = true, gameOver = false;
  let robotMemory = {}; // robot remembers seen cards

  const c = Arena.getContainer();
  c.innerHTML = `
    <div style="width:100%;max-width:560px;padding:16px">
      <div style="display:flex;justify-content:space-between;margin-bottom:16px;font-family:var(--font-display)">
        <span>👤 <span id="mc-ps" style="color:var(--accent)">0</span> paires</span>
        <span style="color:var(--text3)" id="mc-turn">Ton tour</span>
        <span>🤖 <span id="mc-rs" style="color:var(--danger)">0</span> paires</span>
      </div>
      <div id="mc-board" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px"></div>
    </div>
  `;

  function render() {
    const board = document.getElementById('mc-board');
    board.innerHTML = '';
    cards.forEach((card, i) => {
      const el = document.createElement('div');
      el.style.cssText = `
        aspect-ratio:1;border-radius:8px;
        display:flex;align-items:center;justify-content:center;
        font-size:2rem;cursor:${card.matched||card.flipped||!canClick?'default':'pointer'};
        border:2px solid ${card.matched?'var(--accent)':card.flipped?'var(--accent2)':'var(--border)'};
        background:${card.matched?'rgba(0,255,136,0.1)':card.flipped?'var(--surface2)':'var(--surface)'};
        transition:all 0.2s;
        ${card.matched?'opacity:0.6':''}
      `;
      el.textContent = card.flipped || card.matched ? card.emoji : '❓';
      if (!card.matched && !card.flipped && canClick) {
        el.onclick = () => playerClick(i);
        el.onmouseenter = () => { if (!card.matched && !card.flipped) el.style.borderColor = 'var(--accent)'; };
        el.onmouseleave = () => { if (!card.matched && !card.flipped) el.style.borderColor = 'var(--border)'; };
      }
      board.appendChild(el);
    });
  }

  function playerClick(i) {
    if (!canClick || cards[i].flipped || cards[i].matched) return;
    robotMemory[i] = cards[i].emoji; // robot sees this card
    cards[i].flipped = true;
    selected.push(i);
    render();
    if (selected.length === 2) {
      canClick = false;
      const [a, b] = selected;
      if (cards[a].emoji === cards[b].emoji) {
        setTimeout(() => {
          cards[a].matched = cards[b].matched = true;
          cards[a].flipped = cards[b].flipped = false;
          playerScore++;
          document.getElementById('mc-ps').textContent = playerScore;
          selected = []; canClick = true;
          render();
          checkEnd();
        }, 600);
      } else {
        setTimeout(() => {
          cards[a].flipped = cards[b].flipped = false;
          selected = []; canClick = true;
          render();
          robotTurn();
        }, 900);
      }
    }
  }

  function robotTurn() {
    document.getElementById('mc-turn').textContent = '🤖 Tour du robot...';
    canClick = false;

    setTimeout(() => {
      // Robot tries to find a pair from memory
      const seenPairs = {};
      Object.entries(robotMemory).forEach(([idx, emoji]) => {
        if (!cards[idx].matched) {
          if (!seenPairs[emoji]) seenPairs[emoji] = [];
          seenPairs[emoji].push(parseInt(idx));
        }
      });

      let found = Object.values(seenPairs).find(arr => arr.length >= 2);
      let rA, rB;

      if (found && Math.random() < 0.7) { // 70% chance robot uses memory
        rA = found[0]; rB = found[1];
      } else {
        // Pick random unmatched cards
        const unmatched = cards.map((c,i) => c.matched ? -1 : i).filter(i => i >= 0);
        rA = unmatched[Math.floor(Math.random() * unmatched.length)];
        do { rB = unmatched[Math.floor(Math.random() * unmatched.length)]; } while (rB === rA);
      }

      cards[rA].flipped = true; render();
      robotMemory[rA] = cards[rA].emoji;

      setTimeout(() => {
        cards[rB].flipped = true; render();
        robotMemory[rB] = cards[rB].emoji;

        setTimeout(() => {
          if (cards[rA].emoji === cards[rB].emoji) {
            cards[rA].matched = cards[rB].matched = true;
            cards[rA].flipped = cards[rB].flipped = false;
            robotScore++;
            document.getElementById('mc-rs').textContent = robotScore;
            render();
            checkEnd() || setTimeout(robotTurn, 600);
          } else {
            cards[rA].flipped = cards[rB].flipped = false;
            document.getElementById('mc-turn').textContent = 'Ton tour';
            canClick = true; render();
          }
        }, 700);
      }, 600);
    }, 800);
  }

  function checkEnd() {
    if (cards.every(c => c.matched)) {
      const result = playerScore > robotScore ? 'win' : playerScore < robotScore ? 'loss' : 'draw';
      Arena.end(result, playerScore * 150);
      return true;
    }
    return false;
  }

  render();
};
