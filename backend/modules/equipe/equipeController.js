const equipeService = require("./equipeService");

async function getEquipe(req, res) {
  try {
    const equipe = await equipeService.listarEquipe();
    res.json(equipe);
  } catch (error) {
    console.error("Erro ao listar equipe:", error);
    res.status(500).json({ message: "Erro ao buscar equipe" });
  }
}

async function criarEquipe(req, res) {
    try {
      const id = await equipeService.criarEquipe(req.body);
      res.status(201).json({ id, message: "Membro criado com sucesso" });
    } catch (error) {
      console.error("Erro ao criar membro:", error.message);
      res.status(400).json({ message: error.message });
    }
  }
  

async function atualizarEquipe(req, res) {
  try {
    const atualizado = await equipeService.atualizarEquipe(req.params.id, req.body);
    if (atualizado) {
      res.json({ message: "Membro atualizado com sucesso" });
    } else {
      res.status(404).json({ message: "Membro não encontrado" });
    }
  } catch (error) {
    console.error("Erro ao atualizar membro:", error);
    res.status(500).json({ message: "Erro ao atualizar membro" });
  }
}

async function removerEquipe(req, res) {
  try {
    const removido = await equipeService.removerEquipe(req.params.id);
    if (removido) {
      res.json({ message: "Membro removido com sucesso" });
    } else {
      res.status(404).json({ message: "Membro não encontrado" });
    }
  } catch (error) {
    console.error("Erro ao remover membro:", error);
    res.status(500).json({ message: "Erro ao remover membro" });
  }
}

module.exports = {
  getEquipe,
  criarEquipe,
  atualizarEquipe,
  removerEquipe,
};
