// RoboArena - Game Engine
// Shared infrastructure for all mini-games

const Arena = {
  gameId: window.GAME_ID,
  gameName: window.GAME_NAME,
  isLogged: window.IS_LOGGED,
  score: 0,
  startTime: null,
  running: false,

  getContainer() { return document.getElementById('gameContainer'); },
  getArena() { return document.getElementById('gameArena'); },

  show(elementId) {
    ['gameStart','gameContainer','gameResult'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = id === elementId ? 'flex' : 'none';
    });
    if (elementId === 'gameContainer') {
      const el = document.getElementById('gameContainer');
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.flexDirection = 'column';
    }
  },

  start() {
    this.score = 0;
    this.startTime = Date.now();
    this.running = true;
    this.show('gameContainer');
  },

  async end(result, score) {
    this.running = false;
    this.score = score || this.score;
    const duration = Math.round((Date.now() - this.startTime) / 1000);

    const icons = { win: '🏆', loss: '😔', draw: '🤝' };
    const titles = { win: 'Victoire !', loss: 'Défaite...', draw: 'Égalité !' };
    const msgs = {
      win: 'Tu as battu le robot ! Bien joué.',
      loss: 'Le robot a gagné cette fois. Réessaie !',
      draw: "Match nul. Revanche ?"
    };

    document.getElementById('resultIcon').textContent = icons[result];
    document.getElementById('resultTitle').textContent = titles[result];
    document.getElementById('resultMsg').textContent = msgs[result];
    document.getElementById('resultScore').textContent = this.score;
    this.show('gameResult');

    if (this.isLogged) {
      try {
        const res = await fetch(`/games/${this.gameId}/result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ score: this.score, result, duration })
        });
        const data = await res.json();
        if (data.success) showToast(data.message, result === 'win' ? 'success' : 'info');
      } catch(e) { console.error('Score not saved:', e); }
    }
  },

  addScore(points) {
    this.score += points;
  }
};

window.Arena = Arena;

// If no specific game JS loaded, show default
window.loadDefaultGame = function() {
  startGame();
};

// Global startGame is overridden by each game's script
window.startGame = function() {
  Arena.start();
  Arena.getContainer().innerHTML = `
    <div style="text-align:center;padding:40px">
      <div style="font-size:3rem;margin-bottom:20px">🔧</div>
      <h2 style="font-family:var(--font-display);color:var(--accent)">Jeu en construction</h2>
      <p style="color:var(--text2);margin:12px 0 24px">Ce jeu arrive bientôt !</p>
      <button class="btn-secondary" onclick="Arena.end('draw', 0)">Terminer</button>
    </div>
  `;
};
