const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
const sound = document.getElementById("fireSound");

let audioUnlocked = false;
const isMobile = window.innerWidth < 500; // detect mobile
const PARTICLE_COUNT = isMobile ? 25 : 50; // reduce particles on mobile
const SPEED_MULTIPLIER = isMobile ? 1.2 : 1;

// 🔊 Unlock audio
function unlockAudio() {
  if (!audioUnlocked) {
    sound.muted = false;
    sound.play().catch(() => {});
    audioUnlocked = true;
  }
}

// Resize canvas and scale for devicePixelRatio
function resize() {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx.scale(dpr, dpr);
}
resize();
window.addEventListener("resize", resize);

// Firework class
class Firework {
  constructor() {
    this.x = Math.random() * canvas.width / (window.devicePixelRatio || 1);
    this.y = canvas.height / (window.devicePixelRatio || 1);
    this.z = Math.random() * 2 + 0.5; // depth
    this.targetY = Math.random() * canvas.height * 0.4 / (window.devicePixelRatio || 1);
    this.color = `hsl(${Math.random() * 360},100%,60%)`;
    this.speed = (Math.random() * 3 + 4) * this.z * SPEED_MULTIPLIER;
    this.exploded = false;
    this.particles = [];
  }

  explode() {
    if (audioUnlocked) sound.cloneNode().play();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      this.particles.push({
        x: this.x,
        y: this.y,
        z: this.z,
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 5 * this.z,
        life: 70
      });
    }
  }

  update() {
    if (!this.exploded) {
      this.y -= this.speed;
      if (this.y <= this.targetY) {
        this.exploded = true;
        this.explode();
      }
    } else {
      this.particles.forEach(p => {
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.life--;
      });
    }
  }

  draw() {
    if (!this.exploded) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2 * this.z, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    } else {
      this.particles.forEach(p => {
        if (p.life > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2 * p.z, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        }
      });
    }
  }
}

// Animation loop
let fireworks = [];

function animate() {
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(0, 0, canvas.width / (window.devicePixelRatio || 1), canvas.height / (window.devicePixelRatio || 1));

  if (Math.random() < 0.06) fireworks.push(new Firework());

  fireworks.forEach((f, i) => {
    f.update();
    f.draw();
    if (f.exploded && f.particles.every(p => p.life <= 0)) {
      fireworks.splice(i, 1);
    }
  });

  requestAnimationFrame(animate);
}

animate();
