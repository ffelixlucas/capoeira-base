// Seletores principais
const navMenu = document.getElementById('nav-menu');
const navToggle = document.getElementById('nav-toggle');
const navClose = document.getElementById('nav-close');

// Mostrar menu ao clicar no ícone (hamburguer)
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.add('show-menu');
    document.body.style.overflow = 'hidden'; // Evita scroll em segundo plano
  });
}

// Esconder menu ao clicar no "X"
if (navClose) {
  navClose.addEventListener('click', () => {
    navMenu.classList.remove('show-menu');
    document.body.style.overflow = 'auto';
  });
}

// Fechar menu ao clicar em qualquer link
const navLinks = document.querySelectorAll('.nav__link');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('show-menu');
    document.body.style.overflow = 'auto';
  });
});

// Fechar menu ao clicar fora dele (mobile only)
document.addEventListener('click', (e) => {
  const clickedOutside = !navMenu.contains(e.target) && !navToggle.contains(e.target);
  const isMenuOpen = navMenu.classList.contains('show-menu');
  const isMobile = window.innerWidth <= 768;

  if (isMobile && isMenuOpen && clickedOutside) {
    navMenu.classList.remove('show-menu');
    document.body.style.overflow = 'auto';
  }
});