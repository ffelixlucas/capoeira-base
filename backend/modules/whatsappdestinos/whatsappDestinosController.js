const service = require("./whatsappDestinosService");

async function listar(req, res) {
  try {
    const dados = await service.getDestinosFormatados();
    res.json(dados);
  } catch (err) {
    console.error("Erro ao listar destinos:", err);
    res.status(500).json({ erro: "Erro interno" });
  }
}

async function atualizar(req, res) {
  const horarioId = Number(req.params.horarioId);
  const { membro_id, membro_backup_id } = req.body;

  if (isNaN(horarioId) || (!membro_id && !membro_backup_id)) {
    return res.status(400).json({ erro: "Dados inválidos para atualização" });
  }

  try {
    console.log("🔄 Atualizando destino:", {
      horarioId,
      membro_id,
      membro_backup_id,
    });

    await service.atualizarDestino(horarioId, membro_id, membro_backup_id);
    res.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao atualizar destino:", err);
    res.status(500).json({ erro: "Erro interno" });
  }
}

module.exports = { listar, atualizar };
