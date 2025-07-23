const turmasService = require("./turmasService");

async function listarTurmasAtivas(req, res) {
  try {
    const turmas = await turmasService.listarTurmasAtivas();
    res.json(turmas);
  } catch (error) {
    res.status(500).json({ erro: "Erro ao buscar turmas" });
  }
}

async function criarTurma(req, res) {
  try {
    const { nome, faixa_etaria, equipe_id } = req.body;

    if (!nome || !equipe_id) {
      return res.status(400).json({ erro: "Campos obrigatórios ausentes" });
    }

    await turmasService.criarTurma({ nome, faixa_etaria, equipe_id });
    res.status(201).json({ sucesso: true });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao criar turma" });
  }
}

async function atualizarTurma(req, res) {
  try {
    const id = req.params.id;
    const { nome, faixa_etaria, equipe_id } = req.body;

    if (!nome || !equipe_id) {
      return res.status(400).json({ erro: "Campos obrigatórios ausentes" });
    }

    await turmasService.atualizarTurma(id, { nome, faixa_etaria, equipe_id });
    res.json({ sucesso: true });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao atualizar turma" });
  }
}

async function excluirTurma(req, res) {
  try {
    const id = req.params.id;
    await turmasService.excluirTurma(id);
    res.json({ sucesso: true });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao excluir turma" });
  }
}

module.exports = {
  listarTurmasAtivas,
  criarTurma,
  atualizarTurma,
  excluirTurma,
};
