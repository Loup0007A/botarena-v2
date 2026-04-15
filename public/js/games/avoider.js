// Bot Avoider - Évite les missiles robots
window.startGame = function() {
  Arena.start();
  const c = Arena.getContainer();
  c.innerHTML = `<canvas id="avoidCanvas" style="border:2px solid var(--border);border-radius:8px;background:#080813;display:block;max-width:100%"></canvas>
  <div style="color:var(--text3);font-size:0.78rem;margin-top:6px">Souris / tactile pour bouger</div>`;
  const canvas = document.getElementById('avoidCanvas');
  const ctx = canvas.getContext('2d');
  const W = Math.min(500, window.innerWidth - 80), H = 420;
  canvas.width = W; canvas.height = H;

  let px = W/2, py = H - 60, score = 0, running = true;
  let missiles = [], stars = [], spawnRate = 80, tick = 0;

  // Generate stars
  for (let i = 0; i < 60; i++) stars.push({ x: Math.random()*W, y: Math.random()*H, s: Math.random()*1.5+0.3 });

  canvas.addEventListener('mousemove', e => {
    const r = canvas.getBoundingClientRect();
    px = (e.clientX - r.left) * (W / r.width);
    py = Math.max(30, Math.min(H - 30, (e.clientY - r.top) * (H / r.height)));
  });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const r = canvas.getBoundingClientRect();
    px = (e.touches[0].clientX - r.left) * (W / r.width);
    py = Math.max(30, Math.min(H - 30, (e.touches[0].clientY - r.top) * (H / r.height)));
  }, { passive: false });

  function spawnMissile() {
    const x = Math.random() * W;
    const angle = Math.atan2(py - (-20), px - x) + (Math.random()-0.5)*0.5;
    const speed = 2.5 + score/200;
    missiles.push({ x, y: -20, vx: Math.cos(angle)*speed, vy: Math.sin(angle)*speed, r: 5 });
  }

  function loop() {
    if (!running) return;
    tick++;
    if (tick % Math.max(20, spawnRate - score/10) === 0) spawnMissile();
    score++;

    ctx.fillStyle = '#080813'; ctx.fillRect(0, 0, W, H);

    // Stars
    stars.forEach(s => { ctx.fillStyle = `rgba(255,255,255,${s.s*0.3})`; ctx.fillRect(s.x, s.y, s.s, s.s); });

    // Score
    ctx.fillStyle = 'rgba(0,255,136,0.8)'; ctx.font = 'bold 14px Orbitron, monospace';
    ctx.textAlign = 'left'; ctx.fillText(`Score: ${score}`, 10, 24);
    ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,100,100,0.6)'; ctx.font = '12px Exo 2';
    ctx.fillText('🤖 Vague robotique en cours...', W/2, H - 10);

    // Player ship
    ctx.save(); ctx.translate(px, py);
    ctx.fillStyle = '#00ff88'; ctx.shadowBlur = 10; ctx.shadowColor = '#00ff88';
    ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(12, 12); ctx.lineTo(0, 6); ctx.lineTo(-12, 12); ctx.closePath(); ctx.fill();
    ctx.restore(); ctx.shadowBlur = 0;

    // Missiles
    for (let i = missiles.length - 1; i >= 0; i--) {
      const m = missiles[i];
      m.x += m.vx; m.y += m.vy;
      if (m.y > H + 20 || m.x < -20 || m.x > W + 20) { missiles.splice(i, 1); continue; }

      ctx.fillStyle = '#ff4444'; ctx.shadowBlur = 6; ctx.shadowColor = '#ff4444';
      ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, Math.PI*2); ctx.fill();
      ctx.shadowBlur = 0;

      // Collision
      const dx = m.x - px, dy = m.y - py;
      if (Math.sqrt(dx*dx + dy*dy) < m.r + 14) {
        running = false;
        Arena.end(score > 500 ? 'win' : 'loss', score);
        return;
      }
    }

    // Time limit win
    if (score >= 1800) { running = false; Arena.end('win', score); return; }
    requestAnimationFrame(loop);
  }
  loop();
};
