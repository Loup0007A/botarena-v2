const express = require('express');
const router = express.Router();
const { Users, Scores, db, log } = require('../models/db');
const { requireAdmin } = require('../middleware/auth');
const { GAMES } = require('../config/games');

router.use(requireAdmin);

// Dashboard
router.get('/', (req, res) => {
  const users = Users.getAll();
  const scores = Scores.getAll();
  const logs = db.get('logs').value().slice(-100).reverse();
  const today = new Date().toDateString();
  const stats = {
    totalUsers: users.filter(u => u.role !== 'admin').length,
    activeBans: users.filter(u => u.banned).length,
    totalGames: scores.length,
    todayLogins: logs.filter(l => l.type === 'login_success' && new Date(l.timestamp).toDateString() === today).length,
    todayRegisters: logs.filter(l => l.type === 'user_register' && new Date(l.timestamp).toDateString() === today).length,
    topGame: getTopGame(scores)
  };
  res.render('admin/dashboard', { title: 'Admin - RoboArena', users, stats, recentLogs: logs.slice(0, 20), GAMES });
});

function getTopGame(scores) {
  if (!scores.length) return 'N/A';
  const count = {};
  scores.forEach(s => { count[s.gameName] = (count[s.gameName] || 0) + 1; });
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
}

// Users management
router.get('/users', (req, res) => {
  const users = Users.getAll().filter(u => u.role !== 'admin');
  res.render('admin/users', { title: 'Joueurs - Admin', users });
});

// User detail
router.get('/users/:id', (req, res) => {
  const user = Users.findById(req.params.id);
  if (!user) return res.redirect('/admin/users');
  const userScores = Scores.getByUser(user.id);
  res.render('admin/user-detail', { title: `${user.username} - Admin`, targetUser: user, userScores });
});

// Ban user
router.post('/users/:id/ban', (req, res) => {
  const { reason } = req.body;
  Users.ban(req.params.id, reason || 'Violation des règles', req.user.id);
  res.redirect('/admin/users');
});

// Unban user
router.post('/users/:id/unban', (req, res) => {
  Users.unban(req.params.id, req.user.id);
  res.redirect('/admin/users');
});

// Delete user
router.post('/users/:id/delete', (req, res) => {
  const user = Users.findById(req.params.id);
  if (user && user.role !== 'admin') {
    db.get('users').remove({ id: req.params.id }).write();
    log('user_delete', { userId: req.params.id, adminId: req.user.id });
  }
  res.redirect('/admin/users');
});

// Logs
router.get('/logs', (req, res) => {
  const type = req.query.type || null;
  let logs = db.get('logs').value().reverse();
  if (type) logs = logs.filter(l => l.type === type);
  const logTypes = [...new Set(db.get('logs').value().map(l => l.type))];
  res.render('admin/logs', { title: 'Logs - Admin', logs: logs.slice(0, 500), logTypes, currentType: type });
});

// Play as robot (admin plays instead of bot)
router.get('/play/:gameId', (req, res) => {
  const game = GAMES.find(g => g.id === req.params.gameId);
  if (!game) return res.redirect('/admin');
  res.render('admin/play-as-robot', { title: `Jouer comme Robot - ${game.name}`, game });
});

// Games overview
router.get('/games', (req, res) => {
  const scores = Scores.getAll();
  const gameStats = GAMES.map(g => {
    const gameScores = scores.filter(s => s.gameId === g.id);
    const wins = gameScores.filter(s => s.result === 'win').length;
    return { ...g, plays: gameScores.length, robotWins: gameScores.length - wins, playerWins: wins };
  });
  res.render('admin/games', { title: 'Jeux - Admin', gameStats });
});

// Leaderboard
router.get('/leaderboard', (req, res) => {
  const scores = Scores.getLeaderboard(null, 50);
  res.render('admin/leaderboard', { title: 'Classement - Admin', scores });
});

module.exports = router;
