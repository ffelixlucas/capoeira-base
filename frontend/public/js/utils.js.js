// === Animação ao rolar ===
function animateOnScroll() {
  const elements = document.querySelectorAll(".scroll-animate");
  elements.forEach((element) => {
    const elementPosition = element.getBoundingClientRect().top;
    const screenPosition = window.innerHeight / 1.3;

    if (elementPosition < screenPosition) {
      element.classList.add("animated");
    }
  });
}

window.addEventListener("scroll", animateOnScroll);
window.addEventListener("load", animateOnScroll);

// === Copiar endereço ===
function copiarEndereco() {
  const endereco =
    "Estr. Ecológica de Pinhais, 3472 - Jardim Karla, Pinhais - PR, 83328-200";
  navigator.clipboard.writeText(endereco).then(() => {
    alert("Endereço copiado para a área de transferência!");
  });
}

// === Smooth scroll ===
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});











