const express = require('express');
const router = express.Router();
const { Users, log } = require('../models/db');
const { requireAuth } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Trop de créations de compte. Réessayez dans 1 heure.'
});

// GET /login
router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('auth/login', {
    title: 'Connexion - RoboArena',
    error: req.query.error,
    reason: req.query.reason
  });
});

// POST /login
router.post('/login', loginLimiter, (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.render('auth/login', { title: 'Connexion', error: 'missing_fields' });
  }
  const user = Users.findByUsername(username.trim());
  if (!user || !Users.verifyPassword(user, password)) {
    log('login_fail', { username: username.trim(), ip: req.ip });
    return res.render('auth/login', { title: 'Connexion', error: 'invalid_credentials' });
  }
  if (user.banned) {
    return res.render('auth/login', { title: 'Connexion', error: 'banned', reason: user.banReason });
  }
  req.session.userId = user.id;
  Users.update(user.id, { lastLogin: new Date().toISOString() });
  log('login_success', { userId: user.id, username: user.username, ip: req.ip });
  const returnTo = req.session.returnTo || (user.role === 'admin' ? '/admin' : '/');
  delete req.session.returnTo;
  res.redirect(returnTo);
});

// GET /register
router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/');
  res.render('auth/register', { title: 'Inscription - RoboArena', error: null });
});

// POST /register
router.post('/register', registerLimiter, (req, res) => {
  const { username, email, password, confirm, avatar } = req.body;
  if (!username || !email || !password || !confirm) {
    return res.render('auth/register', { title: 'Inscription', error: 'missing_fields' });
  }
  if (password !== confirm) {
    return res.render('auth/register', { title: 'Inscription', error: 'password_mismatch' });
  }
  if (password.length < 8) {
    return res.render('auth/register', { title: 'Inscription', error: 'password_too_short' });
  }
  if (!/^[a-zA-Z0-9_-]{3,20}$/.test(username)) {
    return res.render('auth/register', { title: 'Inscription', error: 'invalid_username' });
  }
  if (Users.findByUsername(username)) {
    return res.render('auth/register', { title: 'Inscription', error: 'username_taken' });
  }
  if (Users.findByEmail(email)) {
    return res.render('auth/register', { title: 'Inscription', error: 'email_taken' });
  }
  const avatars = ['🤖', '👾', '🦾', '🧠', '👽', '🎮', '🔥', '⚡', '💎', '🏆'];
  const user = Users.create({
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password,
    avatar: avatars.includes(avatar) ? avatar : avatars[Math.floor(Math.random() * avatars.length)]
  });
  req.session.userId = user.id;
  res.redirect('/');
});

// GET /logout
router.get('/logout', requireAuth, (req, res) => {
  log('logout', { userId: req.session.userId });
  req.session.destroy(() => res.redirect('/'));
});

// GET /profile
router.get('/profile', requireAuth, (req, res) => {
  const { Scores } = require('../models/db');
  const scores = Scores.getByUser(req.user.id).slice(-20).reverse();
  res.render('auth/profile', {
    title: 'Mon Profil - RoboArena',
    scores
  });
});

module.exports = router;
