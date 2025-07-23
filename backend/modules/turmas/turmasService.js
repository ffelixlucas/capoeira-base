// backend/modules/turmas/turmasService.js
const repo = require("./turmasRepository.js");

async function listarAtivas() {
  return await repo.listarAtivas();
}

module.exports = { listarAtivas };
