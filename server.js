require('dotenv').config();
const express = require('express');
const session = require('express-session');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');

const { initAdmin, log } = require('./models/db');
const { injectUser, optionalAuth } = require('./middleware/auth');
const { GAMES, CATEGORIES } = require('./config/games');
const { Scores } = require('./models/db');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── DEFAULT TEMPLATE VARIABLES (FIX GLOBAL) ───
app.use((req, res, next) => {
  res.locals.title = 'RoboArena';
  res.locals.description = 'RoboArena - Défie les robots dans 40 mini-jeux épiques !';
  res.locals.keywords = 'jeux, robots, mini-jeux, IA, RoboArena';
  next();
});

// ─── Security ───
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

// ─── Logging ───
const logDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir);
const accessLogStream = fs.createWriteStream(path.join(logDir, 'access.log'), { flags: 'a' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('dev'));

// ─── Middleware ───
app.use(cors({ origin: process.env.SITE_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '1d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  }
}));

// ─── Sessions ───
app.use(session({
  secret: process.env.SESSION_SECRET || 'roboarena_dev_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  },
  name: 'roboarena.sid'
}));

// ─── Template Engine ───
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Global middleware ───
app.use(optionalAuth);
app.use(injectUser);

// ─── ROUTES ───
// Auth routes mounted at / so /login, /register, /logout work directly
app.use('/', require('./routes/auth'));

app.use('/games', require('./routes/games'));
app.use('/admin', require('./routes/admin'));

// ─── HOME ───
app.get('/', (req, res) => {
  const leaderboard = Scores.getLeaderboard(null, 5);
  const featured = GAMES.slice(0, 8);

  res.render('home', {
    title: 'RoboArena - Défie les Robots dans 40 Mini-Jeux !',
    description: 'Affronte des robots dans 40 mini-jeux épiques.',
    keywords: 'RoboArena, jeux, robots, mini-jeux, IA',
    leaderboard,
    featured,
    categories: CATEGORIES,
    totalGames: GAMES.length
  });
});

// ─── LEADERBOARD ───
app.get('/leaderboard', (req, res) => {
  const gameId = req.query.game || null;
  const leaderboard = Scores.getLeaderboard(gameId, 50);

  res.render('leaderboard', {
    title: 'Classement - RoboArena',
    description: 'Meilleurs joueurs',
    leaderboard,
    games: GAMES,
    currentGame: gameId
  });
});

// ─── ABOUT ───
app.get('/about', (req, res) => {
  res.render('about', {
    title: 'À Propos - RoboArena',
    description: 'Plateforme de mini-jeux contre des robots'
  });
});

// ─── robots.txt ───
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Allow: /games
Allow: /leaderboard
Allow: /about
Allow: /login
Allow: /register

Disallow: /admin
Disallow: /admin/*
Disallow: /api/
Disallow: /data/

Sitemap: https://botarena-s3yp.onrender.com/sitemap.xml`);
});

// ─── CRON ───
app.get('/cron', (req, res) => {
  console.log('Cron exécuté', new Date());
  res.send('OK');
});

app.get('/google77d908c4db9f2d8c.html', (req, res) => {
  res.sendFile(__dirname + '/google77d908c4db9f2d8c.html');
});

app.get('/sitemap.xml', (req, res) => {
  res.set('Content-Type', 'application/xml; charset=utf-8');
  res.sendFile(__dirname + '/sitemap.xml');
});


// ─── PWA MANIFEST ───
app.get('/manifest.json', (req, res) => {
  res.json({
    name: 'RoboArena',
    short_name: 'RoboArena',
    start_url: '/',
    display: 'standalone',
    theme_color: '#00ff88',
    background_color: '#0a0a1a'
  });
});

// ─── 404 ───
app.use((req, res) => {
  res.status(404).render('404', {
    title: '404 - RoboArena',
    description: 'Page introuvable'
  });
});

// ─── ERROR ───
app.use((err, req, res, next) => {
  console.error(err);
  log('server_error', { url: req.url, error: err.message });

  res.status(500).render('500', {
    title: 'Erreur serveur',
    description: 'Erreur interne'
  });
});

// ─── START ───
initAdmin();

app.listen(PORT, () => {
  console.log(`🤖 RoboArena running on http://localhost:${PORT}`);
  console.log(`🎮 ${GAMES.length} games loaded`);
});

module.exports = app;
