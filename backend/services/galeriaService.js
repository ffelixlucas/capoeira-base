const bucket = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');
const galeriaRepository = require('../repositories/galeriaRepository');

async function processarUpload(imagem, titulo = null, criadoPor = null) {
  return new Promise((resolve, reject) => {
    const nomeArquivo = `galeria/${uuidv4()}-${imagem.originalname}`;
    const blob = bucket.file(nomeArquivo);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: imagem.mimetype
      }
    });

    blobStream.on('error', (err) => reject(err));

    blobStream.on('finish', async () => {
      try {
        const url = `https://storage.googleapis.com/${bucket.name}/${nomeArquivo}`;
        await galeriaRepository.salvarImagem(url, titulo, criadoPor);
        resolve(url);
      } catch (error) {
        reject(error);
      }
    });

    blobStream.end(imagem.buffer);
  });
}


async function obterTodasImagens() {
  const imagens = await galeriaRepository.buscarTodasImagens();
  return imagens;
}


module.exports = {
  processarUpload,
  obterTodasImagens
};
