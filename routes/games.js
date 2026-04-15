const express = require('express');
const router = express.Router();
const { requireAuth, optionalAuth } = require('../middleware/auth');
const { Scores, Users, log } = require('../models/db');
const { GAMES, CATEGORIES, getGameById } = require('../config/games');

// Games list
router.get('/', optionalAuth, (req, res) => {
  const cat = req.query.cat || null;
  const filtered = cat ? GAMES.filter(g => g.category === cat) : GAMES;
  res.render('games/index', {
    title: 'Tous les Jeux - RoboArena',
    games: filtered,
    categories: CATEGORIES,
    currentCat: cat,
    description: 'Affrontez 40 robots dans des mini-jeux de réflexes, stratégie, mémoire et plus encore !'
  });
});

// Individual game page
router.get('/:gameId', optionalAuth, (req, res) => {
  const game = getGameById(req.params.gameId);
  if (!game) return res.status(404).render('404', { title: '404 - RoboArena' });
  const leaderboard = Scores.getLeaderboard(game.id, 10);
  res.render(`games/play`, {
    title: `${game.name} - RoboArena`,
    description: `Jouez à ${game.name} contre le robot sur RoboArena. ${game.desc}`,
    game,
    leaderboard
  });
});

// POST: record game result
router.post('/:gameId/result', requireAuth, (req, res) => {
  const game = getGameById(req.params.gameId);
  if (!game) return res.status(404).json({ error: 'Game not found' });
  const { score, result, duration } = req.body;
  if (!['win', 'loss', 'draw'].includes(result)) return res.status(400).json({ error: 'Invalid result' });

  Scores.add({
    userId: req.user.id,
    username: req.user.username,
    gameId: game.id,
    gameName: game.name,
    score: parseInt(score) || 0,
    result,
    duration: parseInt(duration) || 0
  });
  Users.recordGame(req.user.id, result === 'win');
  log('game_result', { userId: req.user.id, gameId: game.id, result, score });

  res.json({ success: true, message: result === 'win' ? '🏆 Victoire !' : result === 'draw' ? '🤝 Égalité' : '🤖 Le robot gagne' });
});

module.exports = router;
