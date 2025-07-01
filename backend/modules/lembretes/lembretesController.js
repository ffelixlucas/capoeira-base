const lembretesService = require('./lembretesService');

// GET /api/lembretes
async function listar(req, res) {
  try {
    const status = req.query.status;
    const resultado = await lembretesService.listar(status);
    res.json(resultado);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar lembretes.' });
  }
}

// POST /api/lembretes
async function criar(req, res) {
  try {
    const dados = {
      ...req.body,
      criado_por: req.userId // vindo do middleware de autenticação
    };
    const id = await lembretesService.criar(dados);
    res.status(201).json({ mensagem: 'Lembrete criado.', id });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
}

// PUT /api/lembretes/:id
async function atualizar(req, res) {
  try {
    await lembretesService.atualizar(req.params.id, req.body);
    res.json({ mensagem: 'Lembrete atualizado.' });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
}

// DELETE /api/lembretes/:id
async function excluir(req, res) {
  try {
    await lembretesService.remover(req.params.id);
    res.json({ mensagem: 'Lembrete excluído.' });
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir lembrete.' });
  }
}

module.exports = {
  listar,
  criar,
  atualizar,
  excluir
};
