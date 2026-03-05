const bucket = require("../../config/firebase");
const { v4: uuidv4 } = require("uuid");
const galeriaRepository = require("./galeriaRepository");
const logger = require("../../utils/logger.js");

const TITULO_MAX_CHARS = 160;

function normalizeTitulo(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeLegenda(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function validateTitulo(titulo) {
  if (!titulo) {
    throw new Error("Título é obrigatório.");
  }

  if (titulo.length > TITULO_MAX_CHARS) {
    throw new Error(`Título excede ${TITULO_MAX_CHARS} caracteres.`);
  }
}

async function processarUpload(
  imagem,
  titulo = null,
  criadoPor = null,
  legenda = null,
  organizacaoId = null
) {
  const totalItens = await galeriaRepository.contarTotalItens(organizacaoId);
  const limiteItens = Number(process.env.GALERIA_MAX_ITENS || 200);

  if (totalItens >= limiteItens) {
    throw new Error(`Limite de ${limiteItens} itens atingido. Exclua um para continuar.`);
  }

  const tituloFinal = normalizeTitulo(titulo);
  const legendaFinal = normalizeLegenda(legenda);

  validateTitulo(tituloFinal);

  const nomeArquivo = `galeria/${uuidv4()}-${imagem.originalname}`;
  const file = bucket.file(nomeArquivo);

  try {
    await file.save(imagem.buffer, {
      metadata: {
        contentType: imagem.mimetype,
      },
    });

    const url = `https://storage.googleapis.com/${bucket.name}/${nomeArquivo}`;

    try {
      const id = await galeriaRepository.salvarImagem(
        url,
        tituloFinal,
        criadoPor,
        legendaFinal,
        organizacaoId
      );
      const novaImagem = await galeriaRepository.buscarPorId(id, organizacaoId);
      return novaImagem;
    } catch (dbError) {
      // Evita arquivo órfão no bucket quando falha ao persistir no banco.
      await file.delete({ ignoreNotFound: true }).catch(() => undefined);
      throw dbError;
    }
  } catch (error) {
    logger.error("Erro no upload direto:", error);
    throw error;
  }
}

async function obterTodasImagens(organizacaoId) {
  return await galeriaRepository.buscarTodasImagens(organizacaoId);
}

async function atualizarOrdemGaleria(lista, organizacaoId) {
  if (!Array.isArray(lista) || lista.length === 0) {
    throw new Error("Lista de ordem inválida");
  }

  for (const item of lista) {
    item.id = Number(item.id);
    item.ordem = Number(item.ordem);

    if (isNaN(item.id) || isNaN(item.ordem)) {
      throw new Error("ID ou ordem inválido");
    }
  }

  return await galeriaRepository.atualizarOrdem(lista, organizacaoId);
}

async function removerImagemPorId(id, organizacaoId) {
  const imagem = await galeriaRepository.buscarPorId(id, organizacaoId);

  if (!imagem) {
    throw new Error("Imagem não encontrada");
  }

  const url = imagem.imagem_url;
  const caminhoArquivo = decodeURIComponent(
    new URL(url).pathname.replace(/^\/[^/]+\//, "")
  );

  await bucket.file(caminhoArquivo).delete();
  await galeriaRepository.excluir(id, organizacaoId);
}

async function atualizarNoticia(id, { titulo, legenda }, organizacaoId) {
  const imagem = await galeriaRepository.buscarPorId(id, organizacaoId);
  if (!imagem) {
    throw new Error("Imagem não encontrada.");
  }

  const tituloFinal =
    typeof titulo === "string" ? normalizeTitulo(titulo) : normalizeTitulo(imagem.titulo);
  const legendaFinal =
    typeof legenda === "string" ? normalizeLegenda(legenda) : normalizeLegenda(imagem.legenda);

  validateTitulo(tituloFinal);

  if (!legendaFinal) {
    throw new Error("Conteúdo não pode ser vazio.");
  }

  return await galeriaRepository.atualizarNoticia(id, {
    titulo: tituloFinal,
    legenda: legendaFinal,
  }, organizacaoId);
}

module.exports = {
  processarUpload,
  atualizarNoticia,
  obterTodasImagens,
  atualizarOrdemGaleria,
  removerImagemPorId,
};
