const canvas = document.getElementById('scene');
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

const stars = [];
const fireflies = [];
const bursts = [];
const pointer = {
  x: width * 0.65,
  y: height * 0.4,
  targetX: width * 0.65,
  targetY: height * 0.4
};

function initScene() {
  stars.length = 0;
  fireflies.length = 0;

  // Bintang di langit bagian atas hingga tengah
  const starCount = Math.floor((width * height) / 7500);
  for (let i = 0; i < starCount; i++) {
    stars.push({
      x: Math.random() * width,
      y: Math.random() * (height * 0.72),
      radius: Math.random() * 1.4 + 0.3,
      alpha: Math.random() * 0.75 + 0.2,
      speed: Math.random() * 0.025 + 0.008,
      phase: Math.random() * Math.PI * 2
    });
  }

  // Kunang-kunang di area bawah sekitar pegunungan
  for (let i = 0; i < 32; i++) {
    fireflies.push({
      x: Math.random() * width,
      y: height * 0.45 + Math.random() * (height * 0.52),
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.25,
      radius: Math.random() * 2 + 1,
      alpha: Math.random() * 0.6 + 0.25,
      phase: Math.random() * Math.PI * 2
    });
  }
}

initScene();

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  initScene();
});

function spawnLight(x, y, count = 1, isBurst = false) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = isBurst ? Math.random() * 1.5 + 0.3 : Math.random() * 0.45 + 0.1;
    bursts.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.3,
      radius: isBurst ? Math.random() * 2.5 + 1.2 : Math.random() * 1.7 + 0.8,
      life: 1,
      decay: isBurst ? 0.011 : 0.018
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

function drawSkyAndMoon() {
  // Gradasi langit malam dalam
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#040711');
  skyGrad.addColorStop(0.45, '#0b1428');
  skyGrad.addColorStop(0.8, '#162542');
  skyGrad.addColorStop(1, '#1d2f4f');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Posisi bulan di sisi kanan atas agar ruang kiri & tengah lega
  const moonX = width * 0.78;
  const moonY = height * 0.2;
  const moonRadius = Math.min(width, height) * 0.055;

  // Pendar cahaya bulan lembut
  const moonGlow = ctx.createRadialGradient(moonX, moonY, moonRadius * 0.4, moonX, moonY, moonRadius * 5.5);
  moonGlow.addColorStop(0, 'rgba(255, 244, 214, 0.28)');
  moonGlow.addColorStop(0.4, 'rgba(180, 210, 255, 0.08)');
  moonGlow.addColorStop(1, 'rgba(180, 210, 255, 0)');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius * 5.5, 0, Math.PI * 2);
  ctx.fill();

  // Lingkaran bulan purnama lembut
  ctx.fillStyle = '#fff8e6';
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
  ctx.fill();

  // Tekstur bayangan halus di permukaan bulan
  ctx.fillStyle = 'rgba(215, 205, 185, 0.28)';
  ctx.beginPath();
  ctx.arc(moonX - moonRadius * 0.25, moonY - moonRadius * 0.15, moonRadius * 0.22, 0, Math.PI * 2);
  ctx.arc(moonX + moonRadius * 0.2, moonY + moonRadius * 0.25, moonRadius * 0.16, 0, Math.PI * 2);
  ctx.fill();
}

function drawStars() {
  for (const s of stars) {
    s.phase += s.speed;
    const alpha = s.alpha * (0.55 + 0.45 * Math.sin(s.phase));
    ctx.fillStyle = `rgba(255, 250, 235, ${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMountainLayer(points, fillStyle) {
  ctx.fillStyle = fillStyle;
  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(0, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }

  const last = points[points.length - 1];
  ctx.lineTo(last.x, last.y);
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();
}

function drawMountains() {
  // Lapisan gunung jauh (kabut biru malam)
  drawMountainLayer(
    [
      { x: 0, y: height * 0.62 },
      { x: width * 0.18, y: height * 0.5 },
      { x: width * 0.36, y: height * 0.6 },
      { x: width * 0.56, y: height * 0.44 },
      { x: width * 0.76, y: height * 0.56 },
      { x: width * 0.92, y: height * 0.47 },
      { x: width, y: height * 0.54 }
    ],
    '#121d33'
  );

  // Kabut tipis di antara lapisan gunung
  const mistGrad = ctx.createLinearGradient(0, height * 0.48, 0, height * 0.75);
  mistGrad.addColorStop(0, 'rgba(130, 165, 220, 0)');
  mistGrad.addColorStop(0.5, 'rgba(130, 165, 220, 0.08)');
  mistGrad.addColorStop(1, 'rgba(130, 165, 220, 0)');
  ctx.fillStyle = mistGrad;
  ctx.fillRect(0, height * 0.48, width, height * 0.27);

  // Lapisan gunung tengah
  drawMountainLayer(
    [
      { x: 0, y: height * 0.7 },
      { x: width * 0.14, y: height * 0.63 },
      { x: width * 0.32, y: height * 0.54 },
      { x: width * 0.5, y: height * 0.68 },
      { x: width * 0.7, y: height * 0.53 },
      { x: width * 0.88, y: height * 0.64 },
      { x: width, y: height * 0.6 }
    ],
    '#0b1323'
  );

  // Lapisan bukit depan paling gelap (membuat teks pojok kiri terbaca jelas)
  drawMountainLayer(
    [
      { x: 0, y: height * 0.76 },
      { x: width * 0.22, y: height * 0.73 },
      { x: width * 0.45, y: height * 0.81 },
      { x: width * 0.68, y: height * 0.71 },
      { x: width * 0.86, y: height * 0.77 },
      { x: width, y: height * 0.74 }
    ],
    '#060a14'
  );
}

function drawParticles() {
  // Easing kursor halus
  pointer.x += (pointer.targetX - pointer.x) * 0.08;
  pointer.y += (pointer.targetY - pointer.y) * 0.08;

  const cursorGlow = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 85);
  cursorGlow.addColorStop(0, 'rgba(255, 224, 150, 0.14)');
  cursorGlow.addColorStop(1, 'rgba(255, 224, 150, 0)');
  ctx.fillStyle = cursorGlow;
  ctx.beginPath();
  ctx.arc(pointer.x, pointer.y, 85, 0, Math.PI * 2);
  ctx.fill();

  // Kunang-kunang alami
  for (const f of fireflies) {
    f.x += f.vx;
    f.y += f.vy;
    f.phase += 0.025;

    if (f.x < 0) f.x = width;
    if (f.x > width) f.x = 0;
    if (f.y < height * 0.45) f.vy = Math.abs(f.vy);
    if (f.y > height * 0.97) f.vy = -Math.abs(f.vy);

    const alpha = f.alpha * (0.45 + 0.55 * Math.sin(f.phase));
    ctx.fillStyle = `rgba(255, 232, 150, ${alpha})`;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Percikan cahaya dari kursor/klik
  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i];
    b.x += b.vx;
    b.y += b.vy;
    b.life -= b.decay;

    if (b.life <= 0) {
      bursts.splice(i, 1);
      continue;
    }

    ctx.fillStyle = `rgba(255, 218, 135, ${b.life * 0.9})`;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius * b.life, 0, Math.PI * 2);
    ctx.fill();
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  drawSkyAndMoon();
  drawStars();
  drawMountains();
  drawParticles();
  requestAnimationFrame(animate);
}

animate();
