const logger = require("../../../utils/logger");
const equipeRolesService = require("./equipeRolesService");

// GET /api/equipe/:id/roles
async function listarRoles(req, res) {
  try {
    const { id } = req.params;
    const roles = await equipeRolesService.listarRoles(id);
    res.json(roles);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao listar papéis." });
  }
}
// POST /api/equipe/:id/roles
async function adicionarRole(req, res) {
  try {
    const { id } = req.params;
    const { roleId } = req.body;

    logger.log("📥 Requisição recebida para atribuir papel:");
    logger.log("ID do membro:", id);
    logger.log("Payload recebido:", req.body);

    if (!roleId) {
      return res.status(400).json({ erro: "roleId é obrigatório." });
    }

    await equipeRolesService.adicionarRole(id, roleId);
    res.status(201).json({ mensagem: "Papel atribuído com sucesso." });
  } catch (error) {
    logger.error("❌ Erro no adicionarRole:", error.message);
    res.status(400).json({ erro: error.message || "Erro ao atribuir papel." });
  }
}

// DELETE /api/equipe/:id/roles/:roleId
async function removerRole(req, res) {
  try {
    const { id, roleId } = req.params;
    await equipeRolesService.removerRole(id, roleId);
    res.json({ mensagem: "Papel removido com sucesso." });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao remover papel." });
  }
}

async function removerTodosOsRoles(req, res) {
  try {
    const equipeId = req.params.id;
    await equipeRolesService.removerTodosOsRoles(equipeId);
    res.status(204).send(); // No content
  } catch (err) {
    logger.error(err);
    res.status(500).json({ erro: "Erro ao remover papéis do membro" });
  }
}

module.exports = {
  listarRoles,
  adicionarRole,
  removerRole,
  removerTodosOsRoles,
};
