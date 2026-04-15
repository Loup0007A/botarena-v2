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
  setHeaders: (res, path) => {
    if (path.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
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
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax'
  },
  name: 'roboarena.sid'
}));

// ─── Template Engine ───
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Global Template Vars ───
app.use(optionalAuth);
app.use(injectUser);

// ─── Routes ───
app.use('/auth', require('./routes/auth'));
app.use('/games', require('./routes/games'));
app.use('/admin', require('./routes/admin'));

// Homepage
app.get('/', (req, res) => {
  const leaderboard = Scores.getLeaderboard(null, 5);
  const featured = GAMES.slice(0, 8);
  res.render('home', {
    title: 'RoboArena - Défie les Robots dans 40 Mini-Jeux !',
    description: 'RoboArena est la plateforme de mini-jeux où tu affrontes des robots dans 40 défis épiques. Réflexes, stratégie, mémoire — bats les machines !',
    keywords: 'RoboArena, mini-jeux robot, jeux contre IA, jeux en ligne, défi robot, jeux navigateur',
    leaderboard,
    featured,
    categories: CATEGORIES,
    totalGames: GAMES.length
  });
});

// Leaderboard page
app.get('/leaderboard', (req, res) => {
  const gameId = req.query.game || null;
  const leaderboard = Scores.getLeaderboard(gameId, 50);
  res.render('leaderboard', {
    title: 'Classement - RoboArena',
    description: 'Classement des meilleurs joueurs de RoboArena',
    leaderboard,
    games: GAMES,
    currentGame: gameId
  });
});

// About
app.get('/about', (req, res) => {
  res.render('about', {
    title: 'À Propos - RoboArena',
    description: 'Découvrez RoboArena, la plateforme de mini-jeux contre des robots créée par Loup007A.'
  });
});

// robots.txt
app.get('/robots.txt', (req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *
Allow: /
Allow: /games
Allow: /leaderboard
Allow: /about
Allow: /register
Disallow: /admin
Disallow: /admin/*
Disallow: /auth/logout
Disallow: /api/
Disallow: /data/

Sitemap: ${process.env.SITE_URL || 'https://roboarena.io'}/sitemap.xml`);
});

// sitemap.xml
app.get('/sitemap.xml', (req, res) => {
  const base = process.env.SITE_URL || 'https://roboarena.io';
  const now = new Date().toISOString().split('T')[0];
  const staticRoutes = ['', '/games', '/leaderboard', '/about', '/login', '/register'];
  const gameRoutes = GAMES.map(g => `/games/${g.id}`);
  const allRoutes = [...staticRoutes, ...gameRoutes];

  const urls = allRoutes.map(route => {
    const priority = route === '' ? '1.0' : route.startsWith('/games/') ? '0.8' : '0.6';
    return `  <url>
    <loc>${base}${route}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${route === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${priority}</priority>
  </url>`;
  }).join('\n');

  res.header('Content-Type', 'application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`);
});

// manifest.json (PWA)
app.get('/manifest.json', (req, res) => {
  res.json({
    name: 'RoboArena',
    short_name: 'RoboArena',
    description: 'Défie les robots dans 40 mini-jeux !',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a1a',
    theme_color: '#00ff88',
    icons: [
      { src: '/images/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/images/icon-512.png', sizes: '512x512', type: 'image/png' }
    ]
  });
});

// 404
app.use((req, res) => {
  res.status(404).render('404', { title: '404 - RoboArena', description: 'Page introuvable' });
});

// 500
app.use((err, req, res, next) => {
  console.error(err.stack);
  log('server_error', { url: req.url, error: err.message });
  res.status(500).render('500', { title: '500 - RoboArena', description: 'Erreur serveur' });
});

// ─── Start ───
initAdmin();
app.listen(PORT, () => {
  console.log(`\n🤖 RoboArena démarré sur http://localhost:${PORT}`);
  console.log(`📁 Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🎮 ${GAMES.length} jeux disponibles\n`);
});

module.exports = app;
