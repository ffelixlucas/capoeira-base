// === Modal de agendamento ===
function openModal() {
  document.getElementById("modal").style.display = "flex";
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
  document.body.style.overflow = "auto";
}

function agendarAula() {
  alert(
    "Aula agendada com sucesso! Entraremos em contato em breve para confirmar."
  );
  closeModal();
}

window.onclick = function (event) {
  if (event.target == document.getElementById("modal")) {
    closeModal();
  }
};

// === Copiar endereço ===
function copiarEndereco() {
  const endereco =
    "Estr. Ecológica de Pinhais, 3472 - Jardim Karla, Pinhais - PR, 83328-200";
  navigator.clipboard.writeText(endereco).then(() => {
    alert("Endereço copiado para a área de transferência!");
  });
}

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

// === Smooth scroll ===
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    document.querySelector(this.getAttribute("href")).scrollIntoView({
      behavior: "smooth",
    });
  });
});

// === Carregar eventos da API ===
async function carregarEventos() {
  try {
    const resposta = await fetch("http://localhost:3000/api/agenda");
    const eventos = await resposta.json();
    const container = document.getElementById("eventos-container");

    if (!eventos || eventos.length === 0) {
      container.innerHTML = "<p class='text-center text-white'>Nenhum evento cadastrado no momento.</p>";
      return;
    }

    eventos.forEach((evento) => {
      const card = document.createElement("div");
      card.className = "evento";
      card.innerHTML = `
        <img src="${evento.imagem_url || "https://via.placeholder.com/400x250"}"
             alt="${evento.titulo}"
             class="evento-imagem"
        />
        <div class="evento-info">
          <span class="evento-data">
            <i class="fas fa-calendar-alt"></i> ${formatarData(evento.data_inicio, evento.data_fim)}
          </span>
          <h3 class="evento-titulo">${evento.titulo}</h3>
          ${evento.descricao_curta ? `<p class="evento-desc">${evento.descricao_curta}</p>` : ""}
          ${evento.local ? `<p class="evento-local"><i class="fas fa-map-marker-alt"></i> ${evento.local}</p>` : ""}
          ${evento.endereco ? `
            <a href="https://www.google.com/maps/search/?q=${encodeURIComponent(evento.endereco)}" 
               target="_blank" 
               class="evento-endereco">
              ${evento.endereco}
            </a>` : ""}
          ${evento.telefone_contato ? `
            <div class="evento-whatsapp">
              <a href="https://wa.me/55${evento.telefone_contato.replace(/\D/g, "")}" 
                 target="_blank" 
                 class="icone-whatsapp">
                <i class="fab fa-whatsapp"></i>
              </a>
              <span class="numero-whatsapp">${evento.telefone_contato}</span>
            </div>` : ""}
          <span class="toggle-detalhe" data-id="${evento.id}">
            Ver mais
          </span>
        </div>
      `;
      card.addEventListener("click", () => abrirModalEvento(evento));
      const toggle = card.querySelector(".toggle-detalhe");
      toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        abrirModalEvento(evento);
      });
      container.appendChild(card);
    });
  } catch (err) {
    console.error("Erro ao carregar eventos:", err);
    document.getElementById("eventos-container").innerHTML = 
      "<p class='text-center text-white'>Erro ao carregar eventos.</p>";
  }
}

function formatarData(inicio, fim) {
  const d1 = new Date(inicio);
  const d2 = fim ? new Date(fim) : null;
  const opcoes = {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  };
  const data1 = d1.toLocaleDateString("pt-BR", opcoes).toUpperCase();
  const data2 = d2?.toLocaleDateString("pt-BR", opcoes).toUpperCase();
  return data2 ? `${data1} - ${data2}` : data1;
}

function scrollCarrossel(direcao) {
  const container = document.getElementById("eventos-container");
  const scrollAmount = container.offsetWidth;
  container.scrollBy({
    left: direcao === "direita" ? scrollAmount : -scrollAmount,
    behavior: "smooth"
  });

  const botoes = document.querySelectorAll(".btn-carrossel");
  botoes.forEach(btn => {
    btn.disabled = true;
    setTimeout(() => btn.disabled = false, 600);
  });
}

function abrirModalEvento(evento) {
  const modal = document.getElementById("evento-modal");
  const modalImagem = document.getElementById("modal-imagem");
  const modalTitulo = document.getElementById("modal-titulo");
  const modalData = document.getElementById("modal-data");
  const modalDesc = document.getElementById("modal-desc");
  const modalLocal = document.getElementById("modal-local");
  const modalEndereco = document.getElementById("modal-endereco");
  const modalWhatsapp = document.getElementById("modal-whatsapp");
  const modalDetalhe = document.getElementById("modal-detalhe");

  modalImagem.src = evento.imagem_url || "https://via.placeholder.com/400x250";
  modalImagem.alt = evento.titulo;
  modalTitulo.textContent = evento.titulo;
  modalData.innerHTML = `<i class="fas fa-calendar-alt"></i> ${formatarData(evento.data_inicio, evento.data_fim)}`;
  modalDesc.textContent = evento.descricao_curta || "";
  modalLocal.innerHTML = evento.local ? `<i class="fas fa-map-marker-alt"></i> ${evento.local}` : "";
  modalEndereco.href = evento.endereco ? `https://www.google.com/maps/search/?q=${encodeURIComponent(evento.endereco)}` : "#";
  modalEndereco.textContent = evento.endereco || "";
  modalWhatsapp.innerHTML = evento.telefone_contato ? `
    <a href="https://wa.me/55${evento.telefone_contato.replace(/\D/g, "")}" target="_blank" class="icone-whatsapp">
      <i class="fab fa-whatsapp"></i>
    </a>
    <span class="numero-whatsapp">${evento.telefone_contato}</span>
  ` : "";
  modalDetalhe.textContent = evento.descricao_completa || "Sem informações adicionais.";

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  // Adicionar evento de clique na imagem após ela ser carregada
  modalImagem.onload = () => {
    modalImagem.onclick = () => abrirImagemAmpliada(evento.imagem_url || "https://via.placeholder.com/400x250", evento.titulo);
  };
  modalImagem.onerror = () => {
    modalImagem.onclick = () => abrirImagemAmpliada("https://via.placeholder.com/400x250", evento.titulo);
  };
}

function fecharModalEvento() {
  const modal = document.getElementById("evento-modal");
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}

function abrirImagemAmpliada(src, alt) {
  const modal = document.getElementById("imagem-ampliada-modal");
  const imagem = document.getElementById("imagem-ampliada");
  imagem.src = src;
  imagem.alt = alt;
  modal.style.display = "flex";
}

function fecharImagemAmpliada() {
  const modal = document.getElementById("imagem-ampliada-modal");
  modal.style.display = "none";
}

// Fechar modal do evento ao clicar fora
document.addEventListener("click", (e) => {
  const modal = document.getElementById("evento-modal");
  if (e.target === modal) fecharModalEvento();
});

// Fechar modal da imagem ampliada ao clicar fora
document.addEventListener("click", (e) => {
  const modal = document.getElementById("imagem-ampliada-modal");
  if (e.target === modal) fecharImagemAmpliada();
});

// Fechar ambos os modais ao pressionar Esc
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    fecharImagemAmpliada();
    fecharModalEvento();
  }
});

document.addEventListener("DOMContentLoaded", carregarEventos);
function abrirModalImagem(src, alt = "") {
  const modal = document.getElementById("imagem-modal");
  const imagem = document.getElementById("imagem-expandida");
  imagem.src = src;
  imagem.alt = alt;
  modal.style.display = "flex";
}

function fecharModalImagem() {
  document.getElementById("imagem-modal").style.display = "none";
}
// Fechar modal ao pressionar ESC
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    fecharModalImagem();
  }
});

