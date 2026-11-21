const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const particles = [];
const pointer = { x: width * 0.65, y: height * 0.45, targetX: width * 0.65, targetY: height * 0.45 };

// Kunang-kunang latar belakang yang melayang pelan
for (let i = 0; i < 38; i++) {
  particles.push({
    x: Math.random() * width,
    y: Math.random() * height,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
    radius: Math.random() * 2 + 1,
    alpha: Math.random() * 0.6 + 0.2,
    phase: Math.random() * Math.PI * 2,
    isBurst: false
  });
}

// Spawn percikan lembut saat klik atau gerakkan kursor
function spawnLight(x, y, count = 1, isBurst = false) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = isBurst ? Math.random() * 1.6 + 0.4 : Math.random() * 0.5 + 0.1;
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.25,
      radius: isBurst ? Math.random() * 2.6 + 1.2 : Math.random() * 1.8 + 0.8,
      alpha: 0.9,
      life: 1,
      decay: isBurst ? 0.012 : 0.018,
      isBurst: true
    });
  }
}

window.addEventListener('mousemove', (e) => {
  pointer.targetX = e.clientX;
  pointer.targetY = e.clientY;
  if (Math.random() > 0.45) {
    spawnLight(e.clientX, e.clientY, 1, false);
  }
});

window.addEventListener('click', (e) => {
  spawnLight(e.clientX, e.clientY, 14, true);
});

function animate() {
  ctx.clearRect(0, 0, width, height);

  // Gerak kursor dengan easing lembut
  pointer.x += (pointer.targetX - pointer.x) * 0.08;
  pointer.y += (pointer.targetY - pointer.y) * 0.08;

  // Cahaya hangat yang mengikuti kursor
  const glow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 90);
  glow.addColorStop(0, 'rgba(255, 224, 150, 0.16)');
  glow.addColorStop(1, 'rgba(255, 224, 150, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, 90, 0, Math.PI * 2);
  ctx.fill();

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;

    if (!p.isBurst) {
      p.phase += 0.02;
      const currentAlpha = p.alpha * (0.6 + 0.4 * Math.sin(p.phase));

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.fillStyle = `rgba(255, 232, 168, ${currentAlpha})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    } else {
      p.life -= p.decay;
      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }
      ctx.fillStyle = `rgba(255, 214, 130, ${p.life * 0.85})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  requestAnimationFrame(animate);
}

animate();
