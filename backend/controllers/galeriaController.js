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

module.exports = {
  uploadImagem,
  listarImagens
};
