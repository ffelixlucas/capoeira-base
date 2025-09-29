const repo = require("./notificacaoDestinosRepository");

async function listar(grupoId, tipo) {
  return await repo.listarPorTipo(grupoId, tipo);
}

async function adicionar(grupoId, tipo, email) {
  return await repo.criar(grupoId, tipo, email);
}

async function deletar(id) {
  return await repo.remover(id);
}

// usado especificamente no fluxo da matrícula
async function getEmails(grupoId, tipo) {
  const rows = await repo.listarPorTipo(grupoId, tipo);
  return rows.map(r => r.email);
}

module.exports = { listar, adicionar, deletar, getEmails };
