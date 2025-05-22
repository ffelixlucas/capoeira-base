// Modal de agendamento
function openModal() {
    document.getElementById('modal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  
  function closeModal() {
    document.getElementById('modal').style.display = 'none';
    document.body.style.overflow = 'auto';
  }
  
  function agendarAula() {
    alert('Aula agendada com sucesso! Entraremos em contato em breve para confirmar.');
    closeModal();
  }
  
  window.onclick = function(event) {
    if (event.target == document.getElementById('modal')) {
      closeModal();
    }
  }
  
  // Copiar endereço
  function copiarEndereco() {
    const endereco = 'Estr. Ecológica de Pinhais, 3472 - Jardim Karla, Pinhais - PR, 83328-200';
    navigator.clipboard.writeText(endereco).then(() => {
      alert('Endereço copiado para a área de transferência!');
    });
  }
  
  // Animação ao rolar
  function animateOnScroll() {
    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach(element => {
      const elementPosition = element.getBoundingClientRect().top;
      const screenPosition = window.innerHeight / 1.3;
      
      if(elementPosition < screenPosition) {
        element.classList.add('animated');
      }
    });
  }
  
  window.addEventListener('scroll', animateOnScroll);
  window.addEventListener('load', animateOnScroll);
  
  // Smooth scroll para links internos
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      document.querySelector(this.getAttribute('href')).scrollIntoView({
        behavior: 'smooth'
      });
    });
  });