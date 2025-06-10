const repo = require('../repositories/configuracoesRepository');

async function obterValor(chave) {
  const item = await repo.buscarPorChave(chave);
  return item?.valor || null;
}

async function listar() {
  return await repo.listarConfiguracoes();
}

async function atualizar(chave, valor) {
  await repo.atualizarConfiguracao(chave, valor);
}

module.exports = {
  obterValor,
  listar,
  atualizar
};
