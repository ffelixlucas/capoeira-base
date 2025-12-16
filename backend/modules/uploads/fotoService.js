const path = require("path");
const logger = require("../../utils/logger");

async function processarFotoAluno({ file, aluno, bucket }) {
  // 🔹 nome base
  const primeiroNome = aluno.nome.split(" ")[0].toLowerCase();
  const ext = path.extname(file.originalname) || ".jpg";
  const nomeBase = `${Date.now()}_${primeiroNome}_${aluno.id}`;

  const pastaBase = `fotos-perfil/alunos/${aluno.org_slug}`;
  const originalPath = `${pastaBase}/${nomeBase}${ext}`;

const fs = require("fs");

// 1️⃣ upload original
await bucket.upload(file.path, {
  destination: originalPath,
  metadata: { contentType: file.mimetype },
});

// 🧹 limpeza do arquivo temporário (não bloqueante)
fs.unlink(file.path, (err) => {
  if (err) {
    logger.warn("[fotoService] Falha ao remover arquivo temporário", err);
  } else {
    logger.debug("[fotoService] Arquivo temporário removido");
  }
});


  logger.debug("[fotoService] Upload original feito", originalPath);

  // 2️⃣ aguardar resized
  const LABEL = process.env.RESIZED_LABEL || "400x400";
  const resizedPath = `${pastaBase}/fotos-perfil-resized/${nomeBase}_${LABEL}${ext}`;

  let fotoFinalPath = originalPath;

  // Não aguardar pelo resized aqui, só fazer o upload original
  logger.warn("[fotoService] Redimensionamento não encontrado, usando original");

  // 3️⃣ apagar foto antiga
  if (aluno.foto_url) {
    try {
      const decoded = decodeURIComponent(aluno.foto_url);
      const match = decoded.match(/fotos-perfil\/[^?]+/);
      if (match) {
        await bucket.file(match[0]).delete();
        logger.info("[fotoService] Foto antiga removida", match[0]);
      }
    } catch (err) {
      logger.warn("[fotoService] Falha ao remover foto antiga");
    }
  }

  // 4️⃣ Limpeza assíncrona da foto original, após tempo
  setTimeout(async () => {
    try {
      const [exists] = await bucket.file(resizedPath).exists();
      if (exists) {
        // Apagar original, após verificar se resized existe
        await bucket.file(originalPath).delete();
        logger.info("[fotoService] Original removido após resize");
      }
    } catch (err) {
      logger.warn("[fotoService] Falha ao remover foto original após resize");
    }
  }, 10000); // Espera 10 segundos para limpar (não bloqueante)

  // 5️⃣ gerar URL
  const [url] = await bucket.file(fotoFinalPath).getSignedUrl({
    action: "read",
    expires: "03-01-2030",
  });

  return url;
}

module.exports = {
  processarFotoAluno,
};
