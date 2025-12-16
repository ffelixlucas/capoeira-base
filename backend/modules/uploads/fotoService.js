const fs = require("fs");
const logger = require("../../utils/logger");

function normalizarNome(nome = "") {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

async function limparFotosAntigas(bucket, pastaResized, alunoId) {
  const [files] = await bucket.getFiles({ prefix: pastaResized });

  if (!files.length) return;

  logger.info("[fotoService] Limpando fotos antigas", {
    alunoId,
    total: files.length,
  });

  await Promise.all(
    files.map((file) =>
      file.delete().catch((err) =>
        logger.warn("[fotoService] Falha ao apagar arquivo antigo", {
          file: file.name,
          err,
        })
      )
    )
  );
}

async function processarFotoAluno({ file, aluno, bucket }) {
  const pastaBase = `fotos-perfil/alunos/${aluno.org_slug}/${aluno.id}`;
  const pastaResized = `${pastaBase}/fotos-perfil-resized/`;

  /* ------------------------------------------------------------------ */
  /* 🧹 1) REMOVE TODAS AS FOTOS ANTIGAS                                 */
  /* ------------------------------------------------------------------ */
  await limparFotosAntigas(bucket, pastaResized, aluno.id);

  /* ------------------------------------------------------------------ */
  /* 🏷️ nome humano + timestamp                                         */
  /* ------------------------------------------------------------------ */
  const nomeBase = normalizarNome(aluno.nome || "aluno");
  const timestamp = new Date()
    .toISOString()
    .replace(/[:T]/g, "-")
    .split(".")[0];

  const baseArquivo = `${nomeBase}_${timestamp}`;

  const originalPath = `${pastaBase}/${baseArquivo}.jpg`;
  const resizedPath = `${pastaResized}${baseArquivo}_400x400.jpg`;

  /* ------------------------------------------------------------------ */
  /* 🔼 2) Upload da ORIGINAL                                           */
  /* ------------------------------------------------------------------ */
  await bucket.upload(file.path, {
    destination: originalPath,
    metadata: {
      contentType: "image/jpeg",
      cacheControl: "no-store",
    },
  });

  fs.unlink(file.path, () => {});

  logger.info("[fotoService] Foto original enviada", {
    alunoId: aluno.id,
    path: originalPath,
  });

  /* ------------------------------------------------------------------ */
  /* ⏳ 3) Aguarda resize (Cloud Function)                               */
  /* ------------------------------------------------------------------ */
  const MAX_TENTATIVAS = 12;
  const INTERVALO = 600;

  let existeResize = false;

  for (let i = 0; i < MAX_TENTATIVAS; i++) {
    const [exists] = await bucket.file(resizedPath).exists();
    if (exists) {
      existeResize = true;
      break;
    }
    await new Promise((r) => setTimeout(r, INTERVALO));
  }

  if (!existeResize) {
    logger.warn("[fotoService] Resize não encontrado, usando original");
    return `https://storage.googleapis.com/${bucket.name}/${originalPath}`;
  }

  /* ------------------------------------------------------------------ */
  /* 🧹 4) Remove ORIGINAL                                              */
  /* ------------------------------------------------------------------ */
  try {
    await bucket.file(originalPath).delete();
  } catch {}

  /* ------------------------------------------------------------------ */
  /* 🔗 5) URL FINAL                                                    */
  /* ------------------------------------------------------------------ */
  return `https://storage.googleapis.com/${bucket.name}/${resizedPath}`;
}

module.exports = {
  processarFotoAluno,
};
