const bucket = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const galeriaRepository = require('../repositories/galeriaRepository');

async function processarUpload(imagem, titulo = null, criadoPor = null, legenda = null) {
  const totalItens = await galeriaRepository.contarTotalItens();

  if (totalItens >= 20) {
    throw new Error('Limite de 20 itens atingido. Exclua um para continuar.');
  }

  const nomeArquivo = `galeria/${uuidv4()}-${imagem.originalname}`;
  const blob = bucket.file(nomeArquivo);

  return new Promise((resolve, reject) => {
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: imagem.mimetype
      }
    });

    blobStream.on('error', (err) => reject(err));

    blobStream.on('finish', async () => {
      try {
        const url = `https://storage.googleapis.com/${bucket.name}/${nomeArquivo}`;
        const id = await galeriaRepository.salvarImagem(url, titulo, criadoPor, legenda);
        const novaImagem = await galeriaRepository.buscarPorId(id);
        resolve(novaImagem);
      } catch (error) {
        reject(error);
      }
    });

    blobStream.end(imagem.buffer);
  });
}


async function obterTodasImagens() {
  return await galeriaRepository.buscarTodasImagens();
}

async function atualizarOrdemGaleria(lista) {
  if (!Array.isArray(lista) || lista.length === 0) {
    throw new Error('Lista de ordem inválida');
  }

  for (const item of lista) {
    if (typeof item.id !== 'number' || typeof item.ordem !== 'number') {
      throw new Error('Formato inválido na lista de ordem');
    }
  }

  return await galeriaRepository.atualizarOrdem(lista);
}

async function removerImagemPorId(id) {
  const imagem = await galeriaRepository.buscarPorId(id);

  if (!imagem) {
    throw new Error('Imagem não encontrada');
  }

  const url = imagem.imagem_url;
  const caminhoArquivo = decodeURIComponent(
    new URL(url).pathname.replace(/^\/[^/]+\//, '')
  );

  await bucket.file(caminhoArquivo).delete();
  await galeriaRepository.excluir(id);
}

module.exports = {
  processarUpload,
  obterTodasImagens,
  atualizarOrdemGaleria,
  removerImagemPorId
};
