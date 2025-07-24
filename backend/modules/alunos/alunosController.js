// alunosController.js
const alunoService = require("./alunosService");
async function listar(req, res) {
  try {
    const usuario = req.usuario; // vem do verifyToken
    const turmaId = req.query.turma_id ? Number(req.query.turma_id) : null;

    const alunos = await alunoService.listarTodos(usuario, turmaId);
    res.json(alunos);
  } catch (err) {
    console.error("Erro ao listar alunos:", err);
    res.status(500).json({ erro: "Erro ao buscar alunos." });
  }
}


async function buscar(req, res) {
  try {
    const aluno = await alunoService.buscarPorId(req.params.id);
    res.json(aluno);
  } catch (err) {
    console.error("Erro ao buscar aluno:", err);
    res.status(404).json({ erro: err.message });
  }
}

async function cadastrar(req, res) {
  try {
    const alunoId = await alunoService.cadastrarAluno(req.body);
    res.status(201).json({ id: alunoId });
  } catch (err) {
    console.error("Erro ao cadastrar aluno:", err);
    res.status(400).json({ erro: err.message });
  }
}

async function editar(req, res) {
  try {
    await alunoService.editarAluno(req.params.id, req.body);
    res.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao editar aluno:", err);
    res.status(400).json({ erro: err.message });
  }
}

async function excluir(req, res) {
  try {
    await alunoService.deletarAluno(req.params.id);
    res.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao excluir aluno:", err);
    res.status(400).json({ erro: err.message });
  }
}

async function trocarTurma(req, res) {
  try {
    const { nova_turma_id } = req.body;
    if (!nova_turma_id) throw new Error("Nova turma obrigatória.");
    await alunoService.trocarTurma(req.params.id, nova_turma_id);
    res.json({ sucesso: true });
  } catch (err) {
    console.error("Erro ao trocar turma:", err);
    res.status(400).json({ erro: err.message });
  }
}

module.exports = {
  listar,
  buscar,
  cadastrar,
  editar,
  excluir,
  trocarTurma,
};
