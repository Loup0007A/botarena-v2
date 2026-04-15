const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = path.join(__dirname, '../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const adapter = new FileSync(path.join(dataDir, 'db.json'));
const db = low(adapter);

// Default structure
db.defaults({
  users: [],
  sessions: [],
  logs: [],
  scores: [],
  bans: []
}).write();

// Initialize admin if not exists
function initAdmin() {
  const adminExists = db.get('users').find({ role: 'admin' }).value();
  if (!adminExists) {
    const hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'RoboArena@Admin2024!', 12);
    db.get('users').push({
      id: uuidv4(),
      username: process.env.ADMIN_USERNAME || 'admin',
      email: process.env.CONTACT_EMAIL || 'lr000000007@gmail.com',
      password: hashedPassword,
      role: 'admin',
      avatar: '🤖',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
      banned: false
    }).write();
    console.log('[DB] Admin account created');
  }
}

// Log an event
function log(type, data) {
  db.get('logs').push({
    id: uuidv4(),
    type,
    data,
    timestamp: new Date().toISOString()
  }).write();
  // Keep only last 10000 logs
  const logs = db.get('logs').value();
  if (logs.length > 10000) {
    db.set('logs', logs.slice(-10000)).write();
  }
}

// User methods
const Users = {
  findById: (id) => db.get('users').find({ id }).value(),
  findByUsername: (username) => db.get('users').find({ username: username.toLowerCase() }).value(),
  findByEmail: (email) => db.get('users').find({ email: email.toLowerCase() }).value(),
  getAll: () => db.get('users').value(),
  create: (data) => {
    const user = {
      id: uuidv4(),
      username: data.username.toLowerCase(),
      email: data.email.toLowerCase(),
      password: bcrypt.hashSync(data.password, 12),
      role: 'player',
      avatar: data.avatar || '👤',
      createdAt: new Date().toISOString(),
      lastLogin: null,
      wins: 0,
      losses: 0,
      gamesPlayed: 0,
      banned: false,
      banReason: null
    };
    db.get('users').push(user).write();
    log('user_register', { username: user.username, email: user.email });
    return user;
  },
  update: (id, data) => {
    db.get('users').find({ id }).assign(data).write();
    return db.get('users').find({ id }).value();
  },
  ban: (id, reason, adminId) => {
    db.get('users').find({ id }).assign({ banned: true, banReason: reason }).write();
    db.get('bans').push({ id: uuidv4(), userId: id, reason, adminId, date: new Date().toISOString() }).write();
    log('user_ban', { userId: id, reason, adminId });
  },
  unban: (id, adminId) => {
    db.get('users').find({ id }).assign({ banned: false, banReason: null }).write();
    log('user_unban', { userId: id, adminId });
  },
  recordGame: (userId, won) => {
    const user = Users.findById(userId);
    if (user) {
      db.get('users').find({ id: userId }).assign({
        gamesPlayed: (user.gamesPlayed || 0) + 1,
        wins: (user.wins || 0) + (won ? 1 : 0),
        losses: (user.losses || 0) + (won ? 0 : 1)
      }).write();
    }
  },
  verifyPassword: (user, password) => bcrypt.compareSync(password, user.password)
};

// Scores methods
const Scores = {
  add: (data) => {
    db.get('scores').push({
      id: uuidv4(),
      userId: data.userId,
      username: data.username,
      gameId: data.gameId,
      gameName: data.gameName,
      score: data.score,
      result: data.result, // 'win' | 'loss' | 'draw'
      duration: data.duration,
      timestamp: new Date().toISOString()
    }).write();
  },
  getLeaderboard: (gameId, limit = 10) => {
    let q = db.get('scores').filter({ result: 'win' });
    if (gameId) q = q.filter({ gameId });
    return q.sortBy('score').reverse().take(limit).value();
  },
  getByUser: (userId) => db.get('scores').filter({ userId }).value(),
  getAll: () => db.get('scores').value()
};

module.exports = { db, Users, Scores, log, initAdmin };
