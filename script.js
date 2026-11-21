const sceneCanvas = document.getElementById('scene');
const sceneCtx = sceneCanvas.getContext('2d');

const drawCanvas = document.getElementById('drawLayer');
const drawCtx = drawCanvas.getContext('2d');

const brushBtn = document.getElementById('brushBtn');
const eraserBtn = document.getElementById('eraserBtn');
const clearBtn = document.getElementById('clearBtn');

let width = (sceneCanvas.width = drawCanvas.width = window.innerWidth);
let height = (sceneCanvas.height = drawCanvas.height = window.innerHeight);

const stars = [];
const fireflies = [];
const bursts = [];
const pointer = {
  x: width * 0.65,
  y: height * 0.4,
  targetX: width * 0.65,
  targetY: height * 0.4
};

// State menggambar
let isDrawing = false;
let currentTool = 'brush'; // 'brush' | 'eraser'
let lastX = 0;
let lastY = 0;

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

// Resize dengan mempertahankan coretan yang sudah digambar
window.addEventListener('resize', () => {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  tempCanvas.getContext('2d').drawImage(drawCanvas, 0, 0);

  width = sceneCanvas.width = drawCanvas.width = window.innerWidth;
  height = sceneCanvas.height = drawCanvas.height = window.innerHeight;

  drawCtx.drawImage(tempCanvas, 0, 0);
  initScene();
});

// Kontrol tombol alat
brushBtn.addEventListener('click', () => {
  currentTool = 'brush';
  brushBtn.classList.add('active');
  eraserBtn.classList.remove('active');
  drawCanvas.style.cursor = 'crosshair';
});

eraserBtn.addEventListener('click', () => {
  currentTool = 'eraser';
  eraserBtn.classList.add('active');
  brushBtn.classList.remove('active');
  drawCanvas.style.cursor = 'cell';
});

clearBtn.addEventListener('click', () => {
  drawCtx.clearRect(0, 0, width, height);
});

// Percikan cahaya ringan saat menggambar
function spawnLight(x, y, count = 1) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.5 + 0.1;
    bursts.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 0.25,
      radius: Math.random() * 1.8 + 0.8,
      life: 1,
      decay: 0.02
    });
  }
}

// Logika menggambar & menghapus pada layer atas
function getPos(e) {
  if (e.touches && e.touches.length > 0) {
    return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }
  return { x: e.clientX, y: e.clientY };
}

function startStroke(e) {
  isDrawing = true;
  const pos = getPos(e);
  lastX = pos.x;
  lastY = pos.y;
  drawStroke(pos.x, pos.y);
}

function moveStroke(e) {
  const pos = getPos(e);
  pointer.targetX = pos.x;
  pointer.targetY = pos.y;

  if (!isDrawing) return;
  drawStroke(pos.x, pos.y);
}

function endStroke() {
  isDrawing = false;
}

function drawStroke(x, y) {
  drawCtx.lineCap = 'round';
  drawCtx.lineJoin = 'round';

  if (currentTool === 'brush') {
    drawCtx.globalCompositeOperation = 'source-over';

    // Lapisan 1: Pendar glow kuning emas luas di bagian luar
    drawCtx.strokeStyle = 'rgba(255, 200, 0, 0.45)';
    drawCtx.lineWidth = 7;
    drawCtx.shadowColor = '#ffbe0b';
    drawCtx.shadowBlur = 22;

    drawCtx.beginPath();
    drawCtx.moveTo(lastX, lastY);
    drawCtx.lineTo(x, y);
    drawCtx.stroke();

    // Lapisan 2: Inti garis kuning berkilau terang di bagian tengah
    drawCtx.strokeStyle = '#fff394';
    drawCtx.lineWidth = 2.6;
    drawCtx.shadowColor = '#ffd60a';
    drawCtx.shadowBlur = 12;

    drawCtx.beginPath();
    drawCtx.moveTo(lastX, lastY);
    drawCtx.lineTo(x, y);
    drawCtx.stroke();

    if (Math.random() > 0.45) {
      spawnLight(x, y, 2);
    }
  } else if (currentTool === 'eraser') {
    drawCtx.globalCompositeOperation = 'destination-out';
    drawCtx.shadowBlur = 0;
    drawCtx.lineWidth = 32;

    drawCtx.beginPath();
    drawCtx.moveTo(lastX, lastY);
    drawCtx.lineTo(x, y);
    drawCtx.stroke();
  }

  lastX = x;
  lastY = y;
}

drawCanvas.addEventListener('mousedown', startStroke);
window.addEventListener('mousemove', moveStroke);
window.addEventListener('mouseup', endStroke);

drawCanvas.addEventListener('touchstart', startStroke, { passive: true });
drawCanvas.addEventListener('touchmove', moveStroke, { passive: true });
window.addEventListener('touchend', endStroke);

// --- RENDER PEMANDANGAN MALAM ---
function drawSkyAndMoon() {
  const skyGrad = sceneCtx.createLinearGradient(0, 0, 0, height);
  skyGrad.addColorStop(0, '#040711');
  skyGrad.addColorStop(0.45, '#0b1428');
  skyGrad.addColorStop(0.8, '#162542');
  skyGrad.addColorStop(1, '#1d2f4f');
  sceneCtx.fillStyle = skyGrad;
  sceneCtx.fillRect(0, 0, width, height);

  const moonX = width * 0.78;
  const moonY = height * 0.2;
  const moonRadius = Math.min(width, height) * 0.055;

  // Pendar cahaya bulan lembut
  const moonGlow = sceneCtx.createRadialGradient(moonX, moonY, moonRadius * 0.4, moonX, moonY, moonRadius * 5.5);
  moonGlow.addColorStop(0, 'rgba(255, 244, 214, 0.28)');
  moonGlow.addColorStop(0.4, 'rgba(180, 210, 255, 0.08)');
  moonGlow.addColorStop(1, 'rgba(180, 210, 255, 0)');
  sceneCtx.fillStyle = moonGlow;
  sceneCtx.beginPath();
  sceneCtx.arc(moonX, moonY, moonRadius * 5.5, 0, Math.PI * 2);
  sceneCtx.fill();

  // Lingkaran bulan
  sceneCtx.fillStyle = '#fff8e6';
  sceneCtx.beginPath();
  sceneCtx.arc(moonX, moonY, moonRadius, 0, Math.PI * 2);
  sceneCtx.fill();

  // Tekstur bayangan halus di permukaan bulan
  sceneCtx.fillStyle = 'rgba(215, 205, 185, 0.28)';
  sceneCtx.beginPath();
  sceneCtx.arc(moonX - moonRadius * 0.25, moonY - moonRadius * 0.15, moonRadius * 0.22, 0, Math.PI * 2);
  sceneCtx.arc(moonX + moonRadius * 0.2, moonY + moonRadius * 0.25, moonRadius * 0.16, 0, Math.PI * 2);
  sceneCtx.fill();
}

function drawStars() {
  for (const s of stars) {
    s.phase += s.speed;
    const alpha = s.alpha * (0.55 + 0.45 * Math.sin(s.phase));
    sceneCtx.fillStyle = `rgba(255, 250, 235, ${alpha})`;
    sceneCtx.beginPath();
    sceneCtx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    sceneCtx.fill();
  }
}

function drawMountainLayer(points, fillStyle) {
  sceneCtx.fillStyle = fillStyle;
  sceneCtx.beginPath();
  sceneCtx.moveTo(0, height);
  sceneCtx.lineTo(0, points[0].y);

  for (let i = 0; i < points.length - 1; i++) {
    const xc = (points[i].x + points[i + 1].x) / 2;
    const yc = (points[i].y + points[i + 1].y) / 2;
    sceneCtx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
  }

  const last = points[points.length - 1];
  sceneCtx.lineTo(last.x, last.y);
  sceneCtx.lineTo(width, height);
  sceneCtx.closePath();
  sceneCtx.fill();
}

function drawMountains() {
  // Lapisan gunung jauh
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
  const mistGrad = sceneCtx.createLinearGradient(0, height * 0.48, 0, height * 0.75);
  mistGrad.addColorStop(0, 'rgba(130, 165, 220, 0)');
  mistGrad.addColorStop(0.5, 'rgba(130, 165, 220, 0.08)');
  mistGrad.addColorStop(1, 'rgba(130, 165, 220, 0)');
  sceneCtx.fillStyle = mistGrad;
  sceneCtx.fillRect(0, height * 0.48, width, height * 0.27);

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

  // Lapisan bukit depan paling gelap
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
  pointer.x += (pointer.targetX - pointer.x) * 0.08;
  pointer.y += (pointer.targetY - pointer.y) * 0.08;

  const cursorGlow = sceneCtx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, 85);
  cursorGlow.addColorStop(
    0,
    currentTool === 'eraser' ? 'rgba(160, 205, 255, 0.14)' : 'rgba(255, 214, 10, 0.16)'
  );
  cursorGlow.addColorStop(1, 'rgba(255, 214, 10, 0)');
  sceneCtx.fillStyle = cursorGlow;
  sceneCtx.beginPath();
  sceneCtx.arc(pointer.x, pointer.y, 85, 0, Math.PI * 2);
  sceneCtx.fill();

  for (const f of fireflies) {
    f.x += f.vx;
    f.y += f.vy;
    f.phase += 0.025;

    if (f.x < 0) f.x = width;
    if (f.x > width) f.x = 0;
    if (f.y < height * 0.45) f.vy = Math.abs(f.vy);
    if (f.y > height * 0.97) f.vy = -Math.abs(f.vy);

    const alpha = f.alpha * (0.45 + 0.55 * Math.sin(f.phase));
    sceneCtx.fillStyle = `rgba(255, 232, 150, ${alpha})`;
    sceneCtx.beginPath();
    sceneCtx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    sceneCtx.fill();
  }

  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i];
    b.x += b.vx;
    b.y += b.vy;
    b.life -= b.decay;

    if (b.life <= 0) {
      bursts.splice(i, 1);
      continue;
    }

    sceneCtx.fillStyle = `rgba(255, 224, 70, ${b.life * 0.95})`;
    sceneCtx.beginPath();
    sceneCtx.arc(b.x, b.y, b.radius * b.life, 0, Math.PI * 2);
    sceneCtx.fill();
  }
}

function animate() {
  sceneCtx.clearRect(0, 0, width, height);
  drawSkyAndMoon();
  drawStars();
  drawMountains();
  drawParticles();
  requestAnimationFrame(animate);
}

animate();
