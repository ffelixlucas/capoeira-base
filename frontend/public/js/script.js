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
      container.innerHTML = "<p>Nenhum evento cadastrado no momento.</p>";
      return;
    }

    eventos.forEach((evento) => {
      const card = document.createElement("div");
      card.className = "evento";
      card.innerHTML = `
        <img src="${evento.imagem_url || "https://via.placeholder.com/350x200"}"
            alt="${evento.titulo}"
            class="w-full h-[200px] object-contain bg-gray-100 rounded-t-lg cursor-zoom-in"
            onclick="abrirModalImagem('${evento.imagem_url}', '${
        evento.titulo
      }')"
        />
        <div class="evento-info">
          <span class="evento-data" style="color: #d97706; font-weight: 600;">
            📅 ${formatarData(evento.data_inicio, evento.data_fim)}
          </span>

          <h3 class="evento-titulo" style="font-weight: bold; margin-top: 5px;">
            ${evento.titulo}
          </h3>

          ${
            evento.descricao_curta
              ? `<p class="evento-desc">${evento.descricao_curta}</p>`
              : ""
          }
          ${
            evento.local ? `<p class="evento-local">📍 ${evento.local}</p>` : ""
          }
          ${
            evento.endereco
              ? `<a href="https://www.google.com/maps/search/?q=${encodeURIComponent(
                  evento.endereco
                )}" target="_blank" class="evento-endereco">${
                  evento.endereco
                }</a>`
              : ""
          }

          ${
            evento.telefone_contato
              ? `
              <div class="evento-whatsapp">
                <a href="https://wa.me/55${evento.telefone_contato.replace(/\D/g, '')}" 
                   target="_blank" 
                   class="icone-whatsapp"
                   title="Conversar no WhatsApp">
                  <i class="fab fa-whatsapp"></i>
                </a>
                <span class="numero-whatsapp">${evento.telefone_contato}</span>
              </div>
              `
              : ""
          }
          
          
          

          <a href="#" class="evento-link toggle-detalhe" data-id="${
            evento.id
          }" style="color: #1d4ed8; display: block; margin-top: 6px;">
            Ver mais informações
          </a>

          <div class="evento-detalhe" id="detalhe-${
            evento.id
          }" style="display: none; background-color: #f9f9f9; padding: 10px; border-left: 4px solid #16a34a; margin-top: 10px; border-radius: 4px;">
            ${evento.descricao_completa || "Sem informações adicionais."}
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    // Ativar a expansão/colapso dos detalhes
    document.querySelectorAll(".toggle-detalhe").forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const id = link.getAttribute("data-id");
        const detalhe = document.getElementById(`detalhe-${id}`);
        const estaVisivel = detalhe.style.display === "block";
        detalhe.style.display = estaVisivel ? "none" : "block";
        link.textContent = estaVisivel
          ? "Ver mais informações"
          : "Ocultar informações";
      });
    });
  } catch (err) {
    console.error("Erro ao carregar eventos:", err);
    document.getElementById("eventos-container").innerText =
      "Erro ao carregar eventos.";
  }
}

function formatarData(inicio, fim) {
  const d1 = new Date(inicio);
  const d2 = fim ? new Date(fim) : null;

  const opcoes = {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  };
  const data1 = d1.toLocaleDateString("pt-BR", opcoes).toUpperCase();
  const data2 = d2?.toLocaleDateString("pt-BR", opcoes).toUpperCase();

  return data2 ? `${data1} até ${data2}` : data1;
}

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

// Iniciar ao carregar a página
document.addEventListener("DOMContentLoaded", () => {
  carregarEventos();
});
