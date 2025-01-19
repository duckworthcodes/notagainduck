function scrollToSection(sectionId) {
  const section = document.getElementById(sectionId);
  if (section) {
    section.scrollIntoView({ behavior: 'smooth' });
  }
}
const heroTitle = document.querySelector('.hero-title');
const text = "Manage Your Projects With ProjectVision";
let index = 0;

function typeWriter() {
  if (index < text.length) {
    heroTitle.innerHTML += text.charAt(index);
    index++;
    setTimeout(typeWriter, 75); // Adjust typing speed here
  } else {
    // After the text is fully typed, wait for 5 seconds and restart the animation
    setTimeout(() => {
      heroTitle.innerHTML = ''; // Clear the text
      index = 0; // Reset the index
      typeWriter(); // Restart the typewriter effect
    }, 5000); // 5000 milliseconds = 5 seconds
  }
}

// Start typewriter effect on page load
window.addEventListener('load', () => {
  heroTitle.innerHTML = ''; // Clear initial text
  typeWriter();
});
// Scroll to Section Function
function scrollToSection(sectionId) {
const section = document.getElementById(sectionId);
if (section) {
  section.scrollIntoView({ behavior: 'smooth' });
}
}

// Animate Cards on Scroll
const cards = document.querySelectorAll('.card');

function checkScroll() {
cards.forEach((card) => {
  const cardTop = card.getBoundingClientRect().top;
  const windowHeight = window.innerHeight;

  if (cardTop < windowHeight * 0.8) {
    card.classList.add('animate');
  }
});
}

window.addEventListener('scroll', checkScroll);

// Particle Animation
const heroAnimation = document.querySelector('.hero-animation');

function createParticle() {
const particle = document.createElement('div');
particle.classList.add('particle');
particle.style.left = `${Math.random() * 100}%`;
particle.style.top = `${Math.random() * 100}%`;
particle.style.animationDuration = `${Math.random() * 4 + 3}s`;
heroAnimation.appendChild(particle);

// Remove particle after animation ends
particle.addEventListener('animationend', () => {
  particle.remove();
});
}

// Generate particles every 500ms
setInterval(createParticle, 500);

// Glow Effect on Hover for Buttons
const buttons = document.querySelectorAll('.primary-button, .secondary-button');

buttons.forEach((button) => {
button.addEventListener('mouseenter', () => {
  button.style.boxShadow = '0 0 20px rgba(255, 215, 0, 0.8)';
});

button.addEventListener('mouseleave', () => {
  button.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
});
});
// Confetti Effect
const ctaButton = document.querySelector('.cta-button');

ctaButton.addEventListener('click', () => {
confetti({
  particleCount: 100,
  spread: 70,
  origin: { y: 0.6 },
});
});
// Redirect to index.html
function redirectToIndex() {
  window.location.href = 'main.html'; // Redirect to index.html
}
// Particle Animation
// Enhanced Particle System
const canvas = document.getElementById('hero-canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

class Particle {
  constructor(x, y, size, color, velocity) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
  }

  update() {
    this.x += this.velocity.x;
    this.y += this.velocity.y;

    if (this.size > 0.2) this.size -= 0.1;
  }
}

function createParticles() {
  const size = Math.random() * 5 + 1;
  const x = Math.random() * canvas.width;
  const y = Math.random() * canvas.height;
  const color = `rgba(255, 255, 255, ${Math.random()})`;
  const velocity = {
    x: (Math.random() - 0.5) * 2,
    y: (Math.random() - 0.5) * 2,
  };
  particles.push(new Particle(x, y, size, color, velocity));
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((particle, index) => {
    particle.draw();
    particle.update();

    if (particle.size <= 0.2) {
      particles.splice(index, 1);
    }
  });

  requestAnimationFrame(animateParticles);
}

setInterval(createParticles, 100);
animateParticles();

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});