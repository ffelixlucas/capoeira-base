let imagens = [];
let indiceAtual = 0;
let intervalo;

function atualizarImagemPrincipal() {
  const imagemPrincipal = document.getElementById("imagem-principal");
  const legendaEl = document.getElementById("legenda-imagem");
  imagemPrincipal.onclick = () =>
    abrirModalImagem(
      imagens[indiceAtual].imagem_url,
      imagens[indiceAtual].titulo || ""
    );
  imagemPrincipal.style.cursor = "zoom-in";

  imagemPrincipal.src = imagens[indiceAtual].imagem_url;
  imagemPrincipal.alt =
    imagens[indiceAtual].titulo || `Imagem ${indiceAtual + 1}`;

  legendaEl.textContent = imagens[indiceAtual].legenda || ""; // 👈 insere legenda se existir

  // Atualiza destaque na miniatura
  document.querySelectorAll(".miniatura").forEach((thumb, i) => {
    thumb.classList.toggle("ativa", i === indiceAtual);
  });
}

function iniciarSlider() {
  intervalo = setInterval(() => {
    indiceAtual = (indiceAtual + 1) % imagens.length;
    atualizarImagemPrincipal();
  }, 5000);
}

function pararSlider() {
  clearInterval(intervalo);
}

fetch(`${CONFIG.API_BASE_URL}/galeria`)
  .then((res) => res.json())
  .then((data) => {
    if (!data || data.length === 0) {
      document.getElementById("slider").innerText =
        "Nenhuma imagem disponível.";
      return;
    }

    imagens = data;

    const thumbnails = document.getElementById("thumbnails");

    data.forEach((img, index) => {
      const miniatura = document.createElement("img");
      miniatura.src = img.imagem_url;
      miniatura.alt = img.titulo || `Miniatura ${index + 1}`;
      miniatura.className = "miniatura";
      miniatura.addEventListener("click", () => {
        indiceAtual = index;
        atualizarImagemPrincipal();
        pararSlider();
        iniciarSlider(); // reinicia o tempo
      });
      thumbnails.appendChild(miniatura);
    });

    atualizarImagemPrincipal();
    iniciarSlider();
  })
  .catch((err) => {
    console.error("Erro ao carregar galeria:", err);
    document.getElementById("slider").innerText = "Erro ao carregar imagens.";
  });
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
  
  // Fechar com ESC ou clique fora
  document.addEventListener("click", (e) => {
    const modal = document.getElementById("imagem-modal");
    if (e.target === modal) fecharModalImagem();
  });
  
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") fecharModalImagem();
  });
  