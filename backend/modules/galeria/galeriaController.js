const logger = require("../../utils/logger.js");
const galeriaService = require("./galeriaService");

async function uploadImagem(req, res) {
  try {
    const imagem = req.file;
    const { titulo = null, legenda = null } = req.body;
    const criadoPor = req.user?.id || null;
    const organizacaoId = req.user?.organizacao_id || null;

    if (!imagem) {
      return res.status(400).json({ erro: "Nenhum arquivo enviado." });
    }

    const novaImagem = await galeriaService.processarUpload(
      imagem,
      titulo,
      criadoPor,
      legenda,
      organizacaoId
    );
    return res.status(200).json(novaImagem);
  } catch (error) {
    logger.error("Erro no controller de upload:", error);
    const message = error?.message || "Erro interno no servidor.";
    const status = /limite|arquivo|inválido|invalido|não encontrada|nao encontrada|obrigat[oó]rio|excede|too long|data too long/i.test(message) ? 400 : 500;
    return res.status(status).json({ erro: message });
  }
}

async function listarImagens(req, res) {
  try {
    const organizacaoId = req.user?.organizacao_id || null;
    const imagens = await galeriaService.obterTodasImagens(organizacaoId);
    res.status(200).json(imagens);
  } catch (error) {
    logger.error("Erro ao listar imagens:", error);
    res.status(500).json({ erro: "Erro ao listar imagens." });
  }
}

async function atualizarOrdem(req, res) {
  try {
    const { ordem } = req.body;
    const organizacaoId = req.user?.organizacao_id || null;
    const resultado = await galeriaService.atualizarOrdemGaleria(ordem, organizacaoId);
    res.status(200).json(resultado);
  } catch (error) {
    logger.error("Erro ao atualizar ordem da galeria:", error.message);
    res.status(400).json({ erro: error.message });
  }
}

async function deletarImagem(req, res) {
  try {
    const { id } = req.params;
    const organizacaoId = req.user?.organizacao_id || null;
    await galeriaService.removerImagemPorId(id, organizacaoId);
    res.status(200).json({ mensagem: "Imagem excluída com sucesso." });
  } catch (error) {
    logger.error("Erro ao excluir imagem:", error.message);
    res.status(500).json({ erro: "Erro ao excluir imagem." });
  }
}

async function atualizarNoticia(req, res) {
  const { id } = req.params;
  const { titulo, legenda } = req.body;
  const organizacaoId = req.user?.organizacao_id || null;

  try {
    await galeriaService.atualizarNoticia(id, { titulo, legenda }, organizacaoId);
    res.status(200).json({ mensagem: "Notícia atualizada com sucesso." });
  } catch (error) {
    logger.error("Erro ao atualizar notícia:", error);
    res.status(400).json({ erro: error.message || "Erro ao atualizar notícia." });
  }
}

module.exports = {
  uploadImagem,
  atualizarNoticia,
  listarImagens,
  atualizarOrdem,
  deletarImagem,
};
