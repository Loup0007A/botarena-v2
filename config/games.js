const GAMES = [
  // === RÉFLEXES ===
  { id: 'quickdraw', name: 'Quick Draw', category: 'Réflexes', icon: '🎯', desc: 'Tire plus vite que le robot !', difficulty: 'Facile', color: '#ff6b35' },
  { id: 'colorflash', name: 'Color Flash', category: 'Réflexes', icon: '🌈', desc: 'Clique sur la bonne couleur avant le robot', difficulty: 'Facile', color: '#f7931e' },
  { id: 'taptap', name: 'Tap Tap Bot', category: 'Réflexes', icon: '👆', desc: 'Tape le plus vite possible !', difficulty: 'Facile', color: '#ff4757' },
  { id: 'avoider', name: 'Bot Avoider', category: 'Réflexes', icon: '🚀', desc: 'Évite les missiles robots', difficulty: 'Moyen', color: '#5352ed' },
  { id: 'simonbot', name: 'Simon Bot', category: 'Mémoire', icon: '🔔', desc: 'Répète la séquence plus vite que le robot', difficulty: 'Moyen', color: '#2ed573' },

  // === STRATÉGIE ===
  { id: 'tictactoe', name: 'Tic Tac Toe X', category: 'Stratégie', icon: '⭕', desc: 'Morpion contre une IA imbattable... ou presque', difficulty: 'Moyen', color: '#1e90ff' },
  { id: 'connect4', name: 'Connect-R', category: 'Stratégie', icon: '🔴', desc: 'Puissance 4 contre le robot', difficulty: 'Moyen', color: '#e84393' },
  { id: 'minesweeper', name: 'Bot Mines', category: 'Stratégie', icon: '💣', desc: 'Démine plus vite que le robot', difficulty: 'Difficile', color: '#747d8c' },
  { id: 'chess', name: 'RoboChess', category: 'Stratégie', icon: '♟️', desc: 'Échecs express contre le robot', difficulty: 'Difficile', color: '#2f3542' },
  { id: 'othello', name: 'Flip-Bot', category: 'Stratégie', icon: '⚫', desc: 'Othello / Reversi contre l\'IA', difficulty: 'Difficile', color: '#57606f' },

  // === PUZZLE ===
  { id: 'slidepuzzle', name: 'Slide Sprint', category: 'Puzzle', icon: '🧩', desc: 'Résous le puzzle avant le robot', difficulty: 'Moyen', color: '#ff6348' },
  { id: 'wordsearch', name: 'Word Hunter', category: 'Puzzle', icon: '🔤', desc: 'Trouve les mots cachés plus vite', difficulty: 'Facile', color: '#ffa502' },
  { id: 'sudokubot', name: 'Sudoku Bot', category: 'Puzzle', icon: '🔢', desc: 'Course au sudoku contre l\'IA', difficulty: 'Difficile', color: '#7bed9f' },
  { id: 'picross', name: 'Pixel Logic', category: 'Puzzle', icon: '🖼️', desc: 'Nonogramme / Picross en duel', difficulty: 'Difficile', color: '#70a1ff' },
  { id: 'anagram', name: 'AnagramBot', category: 'Puzzle', icon: '🔡', desc: 'Trouve l\'anagramme avant le robot', difficulty: 'Moyen', color: '#eccc68' },

  // === MATHS & LOGIQUE ===
  { id: 'mathrace', name: 'Math Race', category: 'Maths', icon: '➕', desc: 'Calculs mentaux contre le robot', difficulty: 'Moyen', color: '#ff4757' },
  { id: 'binarybot', name: 'Binary Bot', category: 'Maths', icon: '💻', desc: 'Convertis en binaire plus vite que l\'IA', difficulty: 'Difficile', color: '#2ed573' },
  { id: 'sequencer', name: 'Sequencer', category: 'Maths', icon: '📈', desc: 'Trouve le prochain nombre de la suite', difficulty: 'Moyen', color: '#1e90ff' },
  { id: 'primehunt', name: 'Prime Hunt', category: 'Maths', icon: '🔱', desc: 'Identifie les nombres premiers', difficulty: 'Moyen', color: '#a29bfe' },
  { id: 'balancescale', name: 'Balance Bot', category: 'Maths', icon: '⚖️', desc: 'Équilibre la balance avant le robot', difficulty: 'Facile', color: '#fd79a8' },

  // === MÉMOIRE ===
  { id: 'memorycards', name: 'Memory Clash', category: 'Mémoire', icon: '🃏', desc: 'Memory cards contre l\'IA', difficulty: 'Moyen', color: '#00b894' },
  { id: 'pathrecall', name: 'Path Recall', category: 'Mémoire', icon: '🗺️', desc: 'Mémorise et rejoue le chemin', difficulty: 'Moyen', color: '#6c5ce7' },
  { id: 'numberseq', name: 'Number Seq', category: 'Mémoire', icon: '🔢', desc: 'Mémorise la séquence de chiffres', difficulty: 'Facile', color: '#fdcb6e' },
  { id: 'whichone', name: 'Which Changed?', category: 'Mémoire', icon: '👁️', desc: 'Repère ce qui a changé sur la grille', difficulty: 'Moyen', color: '#e17055' },
  { id: 'snapbot', name: 'Snap Bot', category: 'Mémoire', icon: '⚡', desc: 'Frappe quand les cartes sont identiques', difficulty: 'Facile', color: '#74b9ff' },

  // === ACTION / ARCADE ===
  { id: 'pongbot', name: 'Pong Bot', category: 'Arcade', icon: '🏓', desc: 'Pong classique contre le robot', difficulty: 'Moyen', color: '#00cec9' },
  { id: 'snakerace', name: 'Snake Race', category: 'Arcade', icon: '🐍', desc: 'Snake en duel contre l\'IA', difficulty: 'Moyen', color: '#55efc4' },
  { id: 'breakbot', name: 'Break-Bot', category: 'Arcade', icon: '🧱', desc: 'Casse-briques en compétition', difficulty: 'Moyen', color: '#fd79a8' },
  { id: 'asteroids', name: 'Robo Asteroids', category: 'Arcade', icon: '🌙', desc: 'Asteroids contre le robot', difficulty: 'Difficile', color: '#636e72' },
  { id: 'froggerbot', name: 'Frogger Bot', category: 'Arcade', icon: '🐸', desc: 'Traverse la route avant le robot', difficulty: 'Moyen', color: '#00b894' },

  // === MOT / CULTURE ===
  { id: 'hangmanbot', name: 'Hangman Bot', category: 'Mots', icon: '🪢', desc: 'Pendu contre l\'IA', difficulty: 'Facile', color: '#b2bec3' },
  { id: 'typingrace', name: 'Type Racer', category: 'Mots', icon: '⌨️', desc: 'Frappe le texte plus vite que le robot', difficulty: 'Moyen', color: '#fdcb6e' },
  { id: 'wordchain', name: 'Word Chain', category: 'Mots', icon: '🔗', desc: 'Chaine de mots contre le robot', difficulty: 'Moyen', color: '#a29bfe' },
  { id: 'scramble', name: 'Scramble Bot', category: 'Mots', icon: '🔀', desc: 'Reconstitue les mots brouillés', difficulty: 'Facile', color: '#74b9ff' },
  { id: 'quizbot', name: 'Quiz Bot', category: 'Culture', icon: '❓', desc: 'Quiz de culture générale contre l\'IA', difficulty: 'Moyen', color: '#e84393' },

  // === CRÉATIVITÉ / DESSIN ===
  { id: 'pixelrace', name: 'Pixel Race', category: 'Créativité', icon: '🎨', desc: 'Reproduis le pixel art le plus vite', difficulty: 'Moyen', color: '#fd79a8' },
  { id: 'colorguess', name: 'Color Guess', category: 'Créativité', icon: '🎭', desc: 'Devine la couleur hexadécimale', difficulty: 'Difficile', color: '#6c5ce7' },
  { id: 'symmetry', name: 'Symmetry Bot', category: 'Créativité', icon: '🪞', desc: 'Complète le dessin symétrique', difficulty: 'Moyen', color: '#00b894' },
  { id: 'shapematch', name: 'Shape Match', category: 'Créativité', icon: '🔷', desc: 'Associe les formes plus vite', difficulty: 'Facile', color: '#0984e3' },

  // === BONUS ===
  { id: 'robosoccer', name: 'Robo Soccer', category: 'Sport', icon: '⚽', desc: 'Penalty contre le gardien robot', difficulty: 'Moyen', color: '#27ae60' },
  { id: 'rockpaperbot', name: 'RPS Ultra', category: 'Chance', icon: '✊', desc: 'Pierre-Feuille-Ciseaux contre une IA qui lit dans tes pensées', difficulty: 'Facile', color: '#e74c3c' },
  { id: 'mazerobot', name: 'Maze Runner', category: 'Arcade', icon: '🌀', desc: 'Sors du labyrinthe avant le robot', difficulty: 'Moyen', color: '#9b59b6' }
];

const CATEGORIES = [...new Set(GAMES.map(g => g.category))];

function getGameById(id) {
  return GAMES.find(g => g.id === id);
}

function getGamesByCategory(category) {
  return GAMES.filter(g => g.category === category);
}

module.exports = { GAMES, CATEGORIES, getGameById, getGamesByCategory };
