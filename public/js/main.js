// RoboArena - Main JS

// ── Mobile nav ──
function toggleMenu() {
  document.getElementById('navMobile').classList.toggle('open');
}
document.addEventListener('click', (e) => {
  const nav = document.getElementById('navMobile');
  if (nav && !e.target.closest('.navbar') && !e.target.closest('#navMobile')) {
    nav.classList.remove('open');
  }
});

// ── Particles ──
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const count = window.innerWidth < 600 ? 20 : 40;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position:absolute;
      width:${Math.random()*3+1}px; height:${Math.random()*3+1}px;
      background:${Math.random() > 0.5 ? '#00ff88' : '#00c8ff'};
      border-radius:50%;
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      opacity:${Math.random()*0.5+0.1};
      animation: particleFloat ${Math.random()*10+10}s linear infinite;
      animation-delay:-${Math.random()*10}s;
    `;
    container.appendChild(p);
  }
}

const style = document.createElement('style');
style.textContent = `
@keyframes particleFloat {
  0% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 0.5; }
  90% { opacity: 0.3; }
  100% { transform: translateY(-100vh) translateX(${Math.random()*100-50}px); opacity: 0; }
}`;
document.head.appendChild(style);
initParticles();

// ── Active nav link ──
document.querySelectorAll('.nav-link').forEach(link => {
  if (link.href === window.location.href) link.style.color = 'var(--accent)';
});

// ── Toast notification ──
window.showToast = function(message, type = 'info') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    padding:14px 24px; border-radius:8px; font-family:var(--font-display);
    font-size:0.88rem; max-width:320px;
    animation: slideIn 0.3s ease; box-shadow: 0 8px 32px rgba(0,0,0,0.4);
    ${type === 'success' ? 'background:#0e2a1e; border:1px solid #00ff88; color:#00ff88;' :
      type === 'error' ? 'background:#2a0e0e; border:1px solid #ff4444; color:#ff8080;' :
      'background:#1a1a30; border:1px solid #444; color:#e8e8f0;'}
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => { toast.style.animation = 'slideOut 0.3s ease forwards'; setTimeout(() => toast.remove(), 300); }, 3000);
};

const s2 = document.createElement('style');
s2.textContent = `
@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100px); opacity: 0; } }
`;
document.head.appendChild(s2);
