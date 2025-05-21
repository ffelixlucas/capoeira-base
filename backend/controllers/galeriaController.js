const galeriaService = require('../services/galeriaService');

async function uploadImagem(req, res) {
  try {
    const imagem = req.file;
    if (!imagem) {
      return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
    }

    const url = await galeriaService.processarUpload(imagem);
    return res.status(200).json({ url });
  } catch (error) {
    console.error('Erro no controller de upload:', error);
    return res.status(500).json({ erro: 'Erro interno no servidor.' });
  }
}

async function listarImagens(req, res) {
  try {
    const imagens = await galeriaService.obterTodasImagens();
    res.status(200).json(imagens);
  } catch (error) {
    console.error('Erro ao listar imagens:', error);
    res.status(500).json({ erro: 'Erro ao listar imagens.' });
  }
}

async function atualizarOrdem(req, res) {
  try {
    const { ordem } = req.body;
    const resultado = await galeriaService.atualizarOrdemGaleria(ordem);
    res.status(200).json(resultado);
  } catch (error) {
    console.error('Erro ao atualizar ordem da galeria:', error.message);
    res.status(400).json({ erro: error.message });
  }
}

module.exports = {
  uploadImagem,
  listarImagens,
  atualizarOrdem
};
