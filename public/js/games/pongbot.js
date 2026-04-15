// Pong Bot - Pong classique contre le robot
window.startGame = function() {
  Arena.start();
  const c = Arena.getContainer();
  c.innerHTML = `<canvas id="pong" style="border:2px solid var(--border);border-radius:8px;background:#0a0a1a;display:block;max-width:100%"></canvas>`;

  const canvas = document.getElementById('pong');
  const ctx = canvas.getContext('2d');
  const W = Math.min(600, window.innerWidth - 80);
  const H = Math.round(W * 0.6);
  canvas.width = W; canvas.height = H;

  const PAD_W = W * 0.02, PAD_H = H * 0.18, BALL_R = W * 0.015;
  const SPEED = W * 0.007;
  const WIN_SCORE = 5;

  let player = { x: PAD_W, y: H/2 - PAD_H/2, score: 0 };
  let robot = { x: W - PAD_W*2, y: H/2 - PAD_H/2, score: 0 };
  let ball = { x: W/2, y: H/2, vx: SPEED * (Math.random()>0.5?1:-1), vy: SPEED * (Math.random()>0.5?0.5:-0.5) };
  let mouseY = H/2;
  let running = true;

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouseY = (e.clientY - rect.top) * (H / rect.height);
  });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouseY = (e.touches[0].clientY - rect.top) * (H / rect.height);
  }, { passive: false });

  function resetBall(dir = 1) {
    ball.x = W/2; ball.y = H/2;
    ball.vx = SPEED * dir;
    ball.vy = SPEED * (Math.random() * 1.2 - 0.6);
  }

  function update() {
    if (!running) return;

    // Player paddle follows mouse
    player.y = Math.max(0, Math.min(H - PAD_H, mouseY - PAD_H/2));

    // Robot AI - tracks ball with slight lag
    const robotCenter = robot.y + PAD_H/2;
    const diff = ball.y - robotCenter;
    const robotSpeed = H * 0.018 * (0.7 + Math.random() * 0.4);
    robot.y += Math.sign(diff) * Math.min(Math.abs(diff), robotSpeed);
    robot.y = Math.max(0, Math.min(H - PAD_H, robot.y));

    // Ball movement
    ball.x += ball.vx;
    ball.y += ball.vy;

    // Wall bounce
    if (ball.y - BALL_R < 0) { ball.y = BALL_R; ball.vy *= -1; }
    if (ball.y + BALL_R > H) { ball.y = H - BALL_R; ball.vy *= -1; }

    // Player paddle collision
    if (ball.x - BALL_R < player.x + PAD_W && ball.vx < 0 &&
        ball.y > player.y && ball.y < player.y + PAD_H) {
      ball.vx = Math.abs(ball.vx) * 1.05;
      ball.vy += (ball.y - (player.y + PAD_H/2)) * 0.04;
      ball.vx = Math.min(ball.vx, SPEED * 3);
    }

    // Robot paddle collision
    if (ball.x + BALL_R > robot.x && ball.vx > 0 &&
        ball.y > robot.y && ball.y < robot.y + PAD_H) {
      ball.vx = -Math.abs(ball.vx) * 1.02;
      ball.vy += (ball.y - (robot.y + PAD_H/2)) * 0.03;
    }

    // Score
    if (ball.x < 0) { robot.score++; if (robot.score >= WIN_SCORE) { endGame(); return; } resetBall(1); }
    if (ball.x > W) { player.score++; if (player.score >= WIN_SCORE) { endGame(); return; } resetBall(-1); }
  }

  function draw() {
    ctx.fillStyle = '#080813'; ctx.fillRect(0, 0, W, H);

    // Center line
    ctx.setLineDash([H/20, H/20]);
    ctx.strokeStyle = '#2a2a4a'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(W/2, 0); ctx.lineTo(W/2, H); ctx.stroke();
    ctx.setLineDash([]);

    // Scores
    ctx.fillStyle = 'rgba(0,255,136,0.6)'; ctx.font = `bold ${H*0.1}px Orbitron, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(player.score, W/4, H*0.15);
    ctx.fillStyle = 'rgba(255,68,68,0.6)';
    ctx.fillText(robot.score, W*3/4, H*0.15);

    // Labels
    ctx.fillStyle = 'rgba(255,255,255,0.2)'; ctx.font = `${H*0.04}px Exo 2, sans-serif`;
    ctx.fillText('TOI', W/4, H*0.25);
    ctx.fillText('ROBOT', W*3/4, H*0.25);

    // Player paddle
    ctx.fillStyle = '#00ff88';
    ctx.shadowBlur = 10; ctx.shadowColor = '#00ff88';
    ctx.fillRect(player.x, player.y, PAD_W, PAD_H);

    // Robot paddle
    ctx.fillStyle = '#ff4444'; ctx.shadowColor = '#ff4444';
    ctx.fillRect(robot.x, robot.y, PAD_W, PAD_H);

    // Ball
    ctx.fillStyle = '#fff'; ctx.shadowColor = '#fff'; ctx.shadowBlur = 8;
    ctx.beginPath(); ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI*2); ctx.fill();
    ctx.shadowBlur = 0;
  }

  function endGame() {
    running = false;
    const result = player.score >= WIN_SCORE ? 'win' : 'loss';
    Arena.end(result, player.score * 200);
  }

  function loop() {
    if (!running) return;
    update(); draw();
    requestAnimationFrame(loop);
  }
  loop();
};
