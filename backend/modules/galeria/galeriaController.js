const logger = require('../../utils/logger');
const galeriaService = require('./galeriaService');

async function uploadImagem(req, res) {
  try {
    const imagem = req.file;
    const { titulo = null, legenda = null } = req.body;
    const criadoPor = req.user?.id || null;

    if (!imagem) {
      return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    }

    const novaImagem = await galeriaService.processarUpload(imagem, titulo, criadoPor, legenda);
    return res.status(200).json(novaImagem);
  } catch (error) {
    logger.error('Erro no controller de upload:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}


async function listarImagens(req, res) {
  try {
    const imagens = await galeriaService.obterTodasImagens();
    res.status(200).json(imagens);
  } catch (error) {
    logger.error('Erro ao listar imagens:', error);
    res.status(500).json({ erro: 'Erro ao listar imagens.' });
  }
}

async function atualizarOrdem(req, res) {
  try {
    const { ordem } = req.body;
    const resultado = await galeriaService.atualizarOrdemGaleria(ordem);
    res.status(200).json(resultado);
  } catch (error) {
    logger.error('Erro ao atualizar ordem da galeria:', error.message);
    res.status(400).json({ erro: error.message });
  }
}

async function deletarImagem(req, res) {
  try {
    const { id } = req.params;
    await galeriaService.removerImagemPorId(id);
    res.status(200).json({ mensagem: 'Imagem excluída com sucesso.' });
  } catch (error) {
    logger.error('Erro ao excluir imagem:', error.message);
    res.status(500).json({ erro: 'Erro ao excluir imagem.' });
  }
}
async function atualizarLegenda(req, res) {
  const { id } = req.params;
  const { legenda } = req.body;

  if (!legenda) {
    return res.status(400).json({ erro: "Legenda não pode ser vazia." });
  }

  try {
    await galeriaService.atualizarLegenda(id, legenda);
    res.status(200).json({ mensagem: "Legenda atualizada com sucesso." });
  } catch (error) {
    logger.error('Erro ao atualizar legenda:', error);
    res.status(500).json({ erro: "Erro ao atualizar legenda." });
  }
}


module.exports = {
  uploadImagem,
  atualizarLegenda,
  listarImagens,
  atualizarOrdem,
  deletarImagem
};
