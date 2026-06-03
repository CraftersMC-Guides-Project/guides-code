document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('interactive-background');
  const ctx = canvas.getContext('2d');

  let particles = [];
  const numberOfParticles = 100;
  const maxRadius = 3;
  const minRadius = 1;
  const maxSpeed = 0.5;
  const minSpeed = 0.1;
  const lineColor = 'rgba(255, 255, 255, 0.1)';
  const particleColor = 'rgba(255, 255, 255, 0.8)';

  function setCanvasSize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.radius = Math.random() * (maxRadius - minRadius) + minRadius;
      this.speedX = (Math.random() - 0.5) * maxSpeed * 2 + (this.radius / maxRadius) * minSpeed; // Smaller particles move slower
      this.speedY = (Math.random() - 0.5) * maxSpeed * 2 + (this.radius / maxRadius) * minSpeed;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = particleColor;
      ctx.fill();
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
        this.speedX *= -1;
      }
      if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
        this.speedY *= -1;
      }
    }
  }

  function init() {
    setCanvasSize();
    particles = [];
    for (let i = 0; i < numberOfParticles; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i; j < particles.length; j++) {
        const p1 = particles[i];
        const p2 = particles[j];
        const distance = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

        if (distance < 100) {
          ctx.beginPath();
          ctx.strokeStyle = lineColor;
          ctx.lineWidth = 0.5;
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
  }

  window.addEventListener('resize', init);

  init();
  animate();
});