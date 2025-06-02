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
    if (!resposta.ok) {
      throw new Error(`Erro na API: ${resposta.status} ${resposta.statusText}`);
    }
    const eventos = await resposta.json();
    console.log("Eventos recebidos:", eventos);
    const container = document.getElementById("eventos-container");

    if (!Array.isArray(eventos) || eventos.length === 0) {
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
            onclick="abrirModalImagem('${
              evento.imagem_url || "https://via.placeholder.com/350x200"
            }', '${evento.titulo}')"
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
                <a href="https://wa.me/55${evento.telefone_contato.replace(
                  /\D/g,
                  ""
                )}" 
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
          <small style="color: #888; font-style: italic;">Clique para ver mais detalhes</small>

          </div>
      `;
      card.addEventListener("click", (e) => {
        if (
          e.target.tagName !== "IMG" &&
          !e.target.classList.contains("toggle-detalhe") &&
          !e.target.classList.contains("icone-whatsapp") &&
          !e.target.classList.contains("evento-endereco")
        ) {
          abrirModalEvento(evento);
        }
      });
      container.appendChild(card);
    });

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
    document.getElementById("eventos-container").innerHTML =
      "<p>Erro ao carregar eventos. Tente novamente mais tarde.</p>";
  }
}

function formatarData(inicio, fim) {
  const d1 = new Date(inicio);
  if (isNaN(d1)) return "Data inválida";
  const d2 = fim ? new Date(fim) : null;

  const opcoes = {
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  };
  const data1 = d1.toLocaleDateString("pt-BR", opcoes).toUpperCase();
  const data2 =
    d2 && !isNaN(d2)
      ? d2.toLocaleDateString("pt-BR", opcoes).toUpperCase()
      : null;

  return data2 ? `${data1} até ${data2}` : data1;
}

function abrirModalImagem(src, alt = "") {
  const modal = document.getElementById("imagem-ampliada-modal");
  const imagem = document.getElementById("imagem-ampliada");
  imagem.src = src;
  imagem.alt = alt;
  modal.style.display = "flex";
}

function fecharModalImagem() {
  document.getElementById("imagem-ampliada-modal").style.display = "none";
}

function scrollCarrossel(direcao) {
  const container = document.getElementById("eventos-container");
  const largura = container.offsetWidth;
  container.scrollBy({
    left: direcao === "direita" ? largura : -largura,
    behavior: "smooth",
  });
}

function abrirModalEvento(evento) {
  const modal = document.getElementById("evento-modal");
  const modalContent = document.querySelector("#evento-modal .modal-content");
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
  modalData.innerHTML = `<i class="fas fa-calendar-alt"></i> ${formatarData(
    evento.data_inicio,
    evento.data_fim
  )}`;
  modalDesc.textContent = evento.descricao_curta || "Sem descrição curta.";
  modalLocal.innerHTML = evento.local
    ? `<i class="fas fa-map-marker-alt"></i> ${evento.local}`
    : "";
  modalEndereco.href = evento.endereco
    ? `https://www.google.com/maps/search/?q=${encodeURIComponent(
        evento.endereco
      )}`
    : "#";
  modalEndereco.textContent = evento.endereco || "";
  modalWhatsapp.innerHTML = evento.telefone_contato
    ? `
      <a href="https://wa.me/55${evento.telefone_contato.replace(
        /\D/g,
        ""
      )}" target="_blank" class="icone-whatsapp">
        <i class="fab fa-whatsapp"></i>
      </a>
      <span class="numero-whatsapp">${evento.telefone_contato}</span>
    `
    : "";
  modalDetalhe.innerHTML = evento.descricao_completa
    ? evento.descricao_completa.replace(/\n/g, "<br>")
    : "Sem informações adicionais.";

  // Ajusta dinamicamente o modal para caber na tela
  modalContent.style.height = "auto"; // Reseta a altura
  modalContent.style.maxHeight = "90vh"; // Limita à altura da viewport
  modalContent.style.overflowY = "auto"; // Permite rolagem interna se necessário

  // Força o navegador a recalcular o layout e ajustar tamanhos
  setTimeout(() => {
    const alturaDisponivel = window.innerHeight * 0.9; // 90% da altura da janela
    const alturaConteudo = modalContent.scrollHeight;

    if (alturaConteudo > alturaDisponivel) {
      // Se o conteúdo for maior que a tela, reduz fonte e espaçamentos
      modalContent.style.fontSize = "0.9rem";
      modalContent.querySelector(".modal-body").style.gap = "8px";
      modalImagem.style.maxHeight = "200px";
      modalContent.querySelector(".modal-body h3").style.fontSize = "1.6rem";
    } else {
      // Reseta estilos para o padrão
      modalContent.style.fontSize = "";
      modalContent.querySelector(".modal-body").style.gap = "";
      modalImagem.style.maxHeight = "250px";
      modalContent.querySelector(".modal-body h3").style.fontSize = "";
    }
  }, 0);

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  modalImagem.onload = () => {
    modalImagem.onclick = () =>
      abrirModalImagem(
        evento.imagem_url || "https://via.placeholder.com/400x250",
        evento.titulo
      );
  };
  modalImagem.onerror = () => {
    modalImagem.src = "https://via.placeholder.com/400x250";
    modalImagem.onclick = () =>
      abrirModalImagem("https://via.placeholder.com/400x250", evento.titulo);
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

async function compartilharEvento() {
  const modalContent = document.querySelector("#evento-modal .modal-content");
  const modalImagem = document.getElementById("modal-imagem");
  try {
    modalContent.classList.add("capture");

    // Garantir que a imagem do evento e o logotipo estejam carregados
    const imgEvento = new Image();
    imgEvento.src = modalImagem.src;
    imgEvento.crossOrigin = "Anonymous";
    const imgLogo = new Image();
    imgLogo.src = "../media/logo.png";
    imgLogo.crossOrigin = "Anonymous";

    await Promise.all([
      new Promise((resolve) => {
        imgEvento.onload = resolve;
        imgEvento.onerror = () => {
          imgEvento.src = "https://via.placeholder.com/400x250";
          resolve();
        };
      }),
      new Promise((resolve) => {
        imgLogo.onload = resolve;
        imgLogo.onerror = () => {
          console.warn("Logotipo não encontrado, usando imagem padrão.");
          imgLogo.src = "https://via.placeholder.com/150";
          resolve();
        };
      }),
    ]);

    // Forçar a imagem a ser renderizada no DOM antes da captura
    modalImagem.src = imgEvento.src;

    // Ajustar o estilo da imagem para garantir que ela seja renderizada com o tamanho correto
    modalImagem.style.width = "100%";
    modalImagem.style.maxWidth = "960px";
    modalImagem.style.maxHeight = "950px";
    modalImagem.style.height = "auto";

    // Pequeno atraso para garantir que o DOM renderize a imagem corretamente
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Ajustar os estilos do modal para captura
    const originalWidth = modalContent.style.width;
    const originalMaxWidth = modalContent.style.maxWidth;
    const originalHeight = modalContent.style.height;
    const originalMargin = modalContent.style.margin;
    const originalPadding = modalContent.style.padding;
    modalContent.style.width = "1080px";
    modalContent.style.maxWidth = "1080px";
    modalContent.style.height = "1920px";
    modalContent.style.margin = "0";
    modalContent.style.padding = "0";
    modalContent.style.opacity = "1";
    modalContent.style.transform = "none";
    modalContent.style.overflow = "hidden";

    // Capturar a imagem com html2canvas
    const canvas = await html2canvas(modalContent, {
      scale: 3,
      backgroundColor: "#ffffff",
      useCORS: true,
      width: 1080,
      height: 1920,
      scrollX: 0,
      scrollY: 0,
      imageTimeout: 10000,
      logging: true,
      windowWidth: 1080,
      windowHeight: 1920,
    });

    // Restaurar os estilos originais
    modalContent.classList.remove("capture");
    modalContent.style.width = originalWidth;
    modalContent.style.maxWidth = originalMaxWidth;
    modalContent.style.height = originalHeight;
    modalContent.style.margin = originalMargin;
    modalContent.style.padding = originalPadding;
    modalContent.style.opacity = "";
    modalContent.style.transform = "";
    modalContent.style.overflow = "";

    // Gerar o arquivo para compartilhamento
    const blob = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/png", 1.0)
    );
    const file = new File([blob], "evento-capoeira.png", { type: "image/png" });
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [file] })
    ) {
      await navigator.share({
        files: [file],
        title: `Evento: ${document.getElementById("modal-titulo").textContent}`,
        text: `Confira o evento "${
          document.getElementById("modal-titulo").textContent
        }" do Capoeira Nota 10!`,
      });
      console.log("Evento compartilhado com sucesso!");
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "evento-capoeira.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      alert(
        "Imagem do evento baixada! Você pode compartilhá-la manualmente no WhatsApp ou outras plataformas."
      );
    }
  } catch (err) {
    console.error("Erro ao gerar ou compartilhar a imagem:", err);
    alert(
      "Ocorreu um erro ao gerar a imagem. Verifique o console para mais detalhes e confirme se o logotipo (/media/logo.png) está no caminho correto."
    );
  }
}

document.addEventListener("click", (e) => {
  const modal = document.getElementById("evento-modal");
  if (e.target === modal) fecharModalEvento();
});

document.addEventListener("click", (e) => {
  const modal = document.getElementById("imagem-ampliada-modal");
  if (e.target === modal) fecharImagemAmpliada();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    fecharModalImagem();
    fecharModalEvento();
    fecharImagemAmpliada();
  }
});

document.addEventListener("DOMContentLoaded", carregarEventos);
