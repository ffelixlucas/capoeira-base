let imagens = [];
let indiceAtual = 0;
let intervalo;

function atualizarImagemPrincipal() {
  const imagemPrincipal = document.getElementById('imagem-principal');
  imagemPrincipal.src = imagens[indiceAtual].imagem_url;
  imagemPrincipal.alt = imagens[indiceAtual].titulo || `Imagem ${indiceAtual + 1}`;

  // Atualiza destaque na miniatura
  document.querySelectorAll('.miniatura').forEach((thumb, i) => {
    thumb.classList.toggle('ativa', i === indiceAtual);
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

fetch('http://localhost:3000/api/galeria')
  .then(res => res.json())
  .then(data => {
    if (!data || data.length === 0) {
      document.getElementById('slider').innerText = 'Nenhuma imagem disponível.';
      return;
    }

    imagens = data;

    const thumbnails = document.getElementById('thumbnails');

    data.forEach((img, index) => {
      const miniatura = document.createElement('img');
      miniatura.src = img.imagem_url;
      miniatura.alt = img.titulo || `Miniatura ${index + 1}`;
      miniatura.className = 'miniatura';
      miniatura.addEventListener('click', () => {
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
  .catch(err => {
    console.error('Erro ao carregar galeria:', err);
    document.getElementById('slider').innerText = 'Erro ao carregar imagens.';
  });
