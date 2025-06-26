const equipeRepository = require("./equipeRepository");
const bcrypt = require("bcrypt");

async function listarEquipe() {
  return await equipeRepository.getAllEquipe();
}

async function criarEquipe(dados) {
  if (!dados.nome || !dados.email || !dados.senha) {
    throw new Error("Nome, email e senha são obrigatórios");
  }

  dados.senha_hash = await bcrypt.hash(dados.senha, 10);
  return await equipeRepository.createEquipe(dados);
}
async function atualizarEquipe(id, dados) {
  return await equipeRepository.updateEquipe(id, dados);
}

async function removerEquipe(id) {
  return await equipeRepository.deleteEquipe(id);
}

module.exports = {
  listarEquipe,
  criarEquipe,
  atualizarEquipe,
  removerEquipe,
};
