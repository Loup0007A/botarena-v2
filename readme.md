# 🤖 RoboArena

**Plateforme de mini-jeux en ligne — Humains VS Robots**

> Défie des robots dans 40 mini-jeux épiques : réflexes, stratégie, mémoire, maths, arcade et plus encore !

---

## 🚀 Installation rapide

```bash
# 1. Cloner le dépôt
git clone https://github.com/Loup007A/roboarena.git
cd roboarena

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# Editer .env avec vos valeurs (secrets, URL, etc.)

# 4. Démarrer le serveur
npm start
# → http://localhost:3000
```

---

## ⚙️ Configuration (.env)

| Variable | Description |
|---|---|
| `PORT` | Port du serveur (défaut: 3000) |
| `NODE_ENV` | `production` ou `development` |
| `SESSION_SECRET` | Clé secrète sessions (changez-la !) |
| `JWT_SECRET` | Clé secrète JWT (changez-la !) |
| `ADMIN_PASSWORD` | Mot de passe admin initial |
| `SITE_URL` | URL publique du site |

**⚠️ Important en production :** Changez absolument `SESSION_SECRET` et `ADMIN_PASSWORD` !

---

## 🏗️ Architecture

```
roboarena/
├── server.js              # Serveur Express principal
├── .env.example           # Template de configuration
├── config/
│   └── games.js           # Définition des 40 jeux
├── middleware/
│   └── auth.js            # Authentification & sécurité
├── models/
│   └── db.js              # Base de données (LowDB/JSON)
├── routes/
│   ├── auth.js            # Login, Register, Logout, Profile
│   ├── games.js           # Liste & pages de jeux
│   └── admin.js           # Panel administrateur
├── views/                 # Templates EJS
│   ├── home.ejs
│   ├── partials/          # Header & Footer
│   ├── auth/              # Login, Register, Profil
│   ├── games/             # Liste & jeu individuel
│   └── admin/             # Dashboard admin complet
├── public/
│   ├── css/main.css       # Design system complet
│   └── js/
│       ├── main.js        # JS global
│       └── games/         # Un fichier JS par jeu
└── data/
    └── db.json            # Base de données (auto-créée)
```

---

## 🎮 Les 40 jeux

| Catégorie | Jeux |
|---|---|
| ⚡ Réflexes | Quick Draw, Color Flash, Tap Tap Bot, Bot Avoider, Simon Bot |
| ♟️ Stratégie | Tic Tac Toe X, Connect-R, Bot Mines, RoboChess, Flip-Bot |
| 🧩 Puzzle | Slide Sprint, Word Hunter, Sudoku Bot, Pixel Logic, AnagramBot |
| ➕ Maths | Math Race, Binary Bot, Sequencer, Prime Hunt, Balance Bot |
| 🧠 Mémoire | Memory Clash, Path Recall, Number Seq, Which Changed?, Snap Bot |
| 🕹️ Arcade | Pong Bot, Snake Race, Break-Bot, Robo Asteroids, Frogger Bot |
| 🔤 Mots | Hangman Bot, Type Racer, Word Chain, Scramble Bot |
| ❓ Culture | Quiz Bot |
| 🎨 Créativité | Pixel Race, Color Guess, Symmetry Bot, Shape Match |
| ⚽ Sport | Robo Soccer |
| 🎲 Chance | RPS Ultra |
| 🌀 Arcade | Maze Runner |

---

## 🔐 Sécurité

- **Sessions** : `express-session` avec cookie HttpOnly + SameSite
- **Mots de passe** : `bcryptjs` avec salt factor 12
- **Headers** : `helmet` (XSS, CSRF, CSP, etc.)
- **Rate limiting** : Login (10 req/15min), Inscription (5 req/h)
- **CORS** : Restreint à `SITE_URL`
- **Logs** : Accès, connexions, bans, erreurs

---

## 👑 Panel Admin

Accès : `/admin` (compte `admin` créé automatiquement au 1er démarrage)

Fonctionnalités :
- 📊 **Dashboard** : stats en temps réel
- 👥 **Joueurs** : liste, détails, ban/unban, suppression
- 📋 **Logs** : logs filtrables (connexions, bans, erreurs, parties...)
- 🎮 **Jeux** : statistiques par jeu, lien "Jouer en robot"
- 🏆 **Classement** : vue complète

---

## 🌐 Déploiement

### VPS (recommandé)
```bash
# Installer Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 pour la production
npm install -g pm2
pm2 start server.js --name roboarena
pm2 save
pm2 startup

# Nginx comme reverse proxy
# Pointer roboarena.io → localhost:3000
```

### Variables d'environnement production obligatoires
```env
NODE_ENV=production
SESSION_SECRET=VOTRE_SECRET_FORT_ICI
ADMIN_PASSWORD=VOTRE_MDP_ADMIN_FORT
SITE_URL=https://roboarena.io
```

---

## 🔍 SEO

- `robots.txt` dynamique → `/robots.txt`
- `sitemap.xml` dynamique (40 pages jeux) → `/sitemap.xml`
- Balises Open Graph complètes
- Schema.org WebSite + Game
- Balises canonical
- Meta description par page
- Manifest PWA

---

## 📧 Contact

- **Auteur** : Loup007A
- **Email** : lr000000007@gmail.com
- **GitHub** : https://github.com/Loup007A

---

## 📄 Licence

MIT — Libre d'utilisation, modification et distribution.
