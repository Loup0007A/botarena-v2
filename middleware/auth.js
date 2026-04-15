const { Users } = require('../models/db');

// Require authentication
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    const user = Users.findById(req.session.userId);
    if (!user) {
      req.session.destroy();
      return res.redirect('/login?error=session_expired');
    }
    if (user.banned) {
      req.session.destroy();
      return res.redirect('/login?error=banned&reason=' + encodeURIComponent(user.banReason || 'Compte banni'));
    }
    req.user = user;
    return next();
  }
  req.session.returnTo = req.originalUrl;
  res.redirect('/login');
}

// Require admin role
function requireAdmin(req, res, next) {
  if (req.session && req.session.userId) {
    const user = Users.findById(req.session.userId);
    if (user && user.role === 'admin') {
      req.user = user;
      return next();
    }
  }
  res.status(403).redirect('/');
}

// Optional auth (attach user if logged in)
function optionalAuth(req, res, next) {
  if (req.session && req.session.userId) {
    const user = Users.findById(req.session.userId);
    if (user && !user.banned) req.user = user;
  }
  next();
}

// Inject user into all templates
function injectUser(req, res, next) {
  res.locals.user = req.user || null;
  res.locals.siteName = 'RoboArena';
  res.locals.siteUrl = process.env.SITE_URL || 'https://roboarena.io';
  next();
}

module.exports = { requireAuth, requireAdmin, optionalAuth, injectUser };
