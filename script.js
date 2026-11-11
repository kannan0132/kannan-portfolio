const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav-links');
menuButton.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false');
}));

const roles = ['AWS & DevOps Engineer', 'Cloud Infrastructure Enthusiast', 'Automation Learner'];
const roleElement = document.getElementById('rotating-role');
let roleIndex = 0;
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setInterval(() => {
    roleIndex = (roleIndex + 1) % roles.length;
    roleElement.animate([{opacity: 0, transform: 'translateY(5px)'}, {opacity: 1, transform: 'translateY(0)'}], {duration: 450});
    roleElement.textContent = roles[roleIndex];
  }, 3000);
}

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); }
  });
}, {threshold: 0.12});
document.querySelectorAll('.section-heading, .about-content, .skill-card, .project-card, .timeline-item, .recognition, .certifications, .contact-panel').forEach(el => {
  el.classList.add('reveal'); observer.observe(el);
});
document.getElementById('year').textContent = new Date().getFullYear();
