const bucket = require('../config/firebase');
const { v4: uuidv4 } = require('uuid');

async function processarUpload(imagem) {
  return new Promise((resolve, reject) => {
    const nomeArquivo = `galeria/${uuidv4()}-${imagem.originalname}`;
    const blob = bucket.file(nomeArquivo);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: imagem.mimetype
      }
    });

    blobStream.on('error', (err) => reject(err));
    blobStream.on('finish', () => {
      const url = `https://storage.googleapis.com/${bucket.name}/${nomeArquivo}`;
      resolve(url);
    });

    blobStream.end(imagem.buffer);
  });
}

module.exports = {
  processarUpload
};
