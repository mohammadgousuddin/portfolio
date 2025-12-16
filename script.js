// Set year in footer
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// Mobile menu toggle
const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('.menu');
if (toggle && menu){
  toggle.addEventListener('click', () => {
    const opened = menu.classList.toggle('open');
    toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
  });
}

// Highlight active link
const links = document.querySelectorAll('.menu a');
links.forEach(a => {
  const path = location.pathname.split('/').pop() || 'index.html';
  if (a.getAttribute('href') === path) a.classList.add('active');
});
