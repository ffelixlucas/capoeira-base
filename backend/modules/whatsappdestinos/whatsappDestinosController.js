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

module.exports = { listar };
