const service = require('../services/configuracoesService');

async function listar(req, res) {
  try {
    const config = await service.listar();
    res.json(config);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar configurações' });
  }
}

async function obter(req, res) {
  try {
    const valor = await service.obterValor(req.params.chave);
    if (valor === null) return res.status(404).json({ erro: 'Chave não encontrada' });
    res.json({ chave: req.params.chave, valor });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar configuração' });
  }
}

async function atualizar(req, res) {
  try {
    const { chave } = req.params;
    const { valor } = req.body;
    if (!valor) return res.status(400).json({ erro: 'Valor é obrigatório' });

    await service.atualizar(chave, valor);
    res.json({ sucesso: true, chave, valor });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar configuração' });
  }
}

module.exports = {
  listar,
  obter,
  atualizar
};
