// modules/notificacaoDestinos/notificacaoDestinosController.js
const service = require("./notificacaoDestinosService");

async function getPorTipo(req, res) {
  try {
    const { grupoId, tipo } = req.params;
    const lista = await service.listar(grupoId, tipo);
    res.json(lista);
  } catch (err) {
    res.status(500).json({ error: "Erro ao listar notificações" });
  }
}

async function post(req, res) {
  try {
    const { grupoId, tipo, email } = req.body;
    const novo = await service.adicionar(grupoId, tipo, email);
    res.status(201).json(novo);
  } catch (err) {
    res.status(400).json({ error: "Erro ao criar notificação" });
  }
}

async function del(req, res) {
  try {
    const { id } = req.params;
    await service.deletar(id);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: "Erro ao remover notificação" });
  }
}

module.exports = { getPorTipo, post, del };
