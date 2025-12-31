const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
const sound = document.getElementById("fireSound");

let audioUnlocked = false;
const isMobile = window.innerWidth < 768; // mobile detection
const PARTICLE_COUNT = isMobile ? 20 : 35;
const SPEED_MULTIPLIER = isMobile ? 1.5 : 1;

// Unlock audio
function unlockAudio() {
  if (!audioUnlocked) {
    sound.muted = false;
    sound.play().catch(() => {});
    audioUnlocked = true;
  }
}

// Resize canvas
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

// Particle class for 2D fireworks
class Particle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.radius = Math.random() * 2 + 1;
    this.color = color;
    this.angle = Math.random() * Math.PI * 2;
    this.speed = Math.random() * 5 * SPEED_MULTIPLIER;
    this.life = 60;
    this.gravity = 0.05;
  }

  update() {
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed + this.gravity;
    this.speed *= 0.95; // slow down gradually
    this.life--;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.shadowBlur = 10; // neon glow
    ctx.shadowColor = this.color;
    ctx.fill();
  }
}

// Firework class
class Firework {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height;
    this.targetY = Math.random() * canvas.height * 0.4;
    this.speed = (Math.random() * 5 + 6) * SPEED_MULTIPLIER;
    this.color = `hsl(${Math.random() * 360}, 100%, 60%)`;
    this.exploded = false;
    this.particles = [];
  }

  explode() {
    if (audioUnlocked) sound.cloneNode().play();
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      this.particles.push(new Particle(this.x, this.y, this.color));
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
      this.particles.forEach(p => p.update());
    }
  }

  draw() {
    if (!this.exploded) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.color;
      ctx.fill();
    } else {
      this.particles.forEach(p => {
        if (p.life > 0) p.draw();
      });
    }
  }
}

// Animation loop
let fireworks = [];

function animate() {
  // Solid background (black)
  ctx.fillStyle = "#000000"; // or any color you like
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Optional: draw fireworks trails
  // ctx.fillStyle = "rgba(0,0,0,0.25)";
  // ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (Math.random() < 0.08) fireworks.push(new Firework());

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
