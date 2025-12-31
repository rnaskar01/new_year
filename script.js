const canvas = document.getElementById("fireworks");
const ctx = canvas.getContext("2d");
const sound = document.getElementById("fireSound");

let audioUnlocked = false;

/* 🔊 UNLOCK AUDIO */
function unlockAudio() {
  if (!audioUnlocked) {
    sound.muted = false;
    sound.play().catch(() => {});
    audioUnlocked = true;
  }
}

/* CANVAS */
function resize() {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
}
resize();
addEventListener("resize", resize);

/* 🎆 3D FIREWORK */
class Firework {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = canvas.height;
    this.z = Math.random() * 2 + 0.5; // DEPTH
    this.targetY = Math.random() * canvas.height * 0.4;
    this.color = `hsl(${Math.random() * 360},100%,60%)`;
    this.speed = (Math.random() * 3 + 4) * this.z;
    this.exploded = false;
    this.particles = [];
  }

  explode() {
    if (audioUnlocked) sound.cloneNode().play();
    for (let i = 0; i < 50; i++) {
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
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2 * p.z, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
      });
    }
  }
}

/* LOOP */
let fireworks = [];

function animate() {
  ctx.fillStyle = "rgba(0,0,0,0.25)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
