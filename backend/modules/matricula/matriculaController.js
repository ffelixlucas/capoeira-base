// 🎯 Controller - Matrículas (Admin)
// Responsável por receber requisições HTTP autenticadas e repassar ao service.

const matriculaService = require("./matriculaService");
const logger = require("../../utils/logger");

/* -------------------------------------------------------------------------- */
/* 🔹 Criação de matrícula (manual ou automática)                             */
/* -------------------------------------------------------------------------- */
async function criarMatricula(req, res) {
  try {
    const usuario = req.usuario || req.user;
    const dados = { ...req.body, usuario }; // injeta usuário autenticado no payload

    logger.info("[matriculaController] Criando matrícula", {
      nome: dados.nome,
      organizacao_id: usuario?.organizacao_id || dados.organizacao_id || "não informado",
    });

    const resultado = await matriculaService.criarMatricula(dados);
    return res.status(201).json(resultado);
  } catch (err) {
    logger.error("[matriculaController] Erro ao criar matrícula:", err.message);
    return res.status(400).json({
      error: err.message || "Erro ao criar matrícula.",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Endpoint de teste rápido (opcional – listar matrícula por CPF)          */
/* -------------------------------------------------------------------------- */
async function buscarPorCpf(req, res) {
  try {
    const { cpf } = req.params;
    const resultado = await matriculaService.buscarPorCpf(cpf);
    return res.json(resultado);
  } catch (err) {
    logger.error("[matriculaController] Erro ao buscar matrícula:", err.message);
    return res.status(400).json({
      error: "Erro ao buscar matrícula por CPF.",
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Retorna turmas disponíveis (por idade ou todas)                         */
/* -------------------------------------------------------------------------- */
async function listarTurmas(req, res) {
  try {
    const { idade } = req.query;
    const resultado = idade
      ? await matriculaService.buscarTurmaPorIdade(Number(idade))
      : await matriculaService.listarTurmas();

    return res.json(resultado);
  } catch (err) {
    logger.error("[matriculaController] Erro ao listar turmas:", err.message);
    return res.status(400).json({
      error: "Erro ao listar turmas disponíveis.",
    });
  }
}

module.exports = {
  criarMatricula,
  buscarPorCpf,
  listarTurmas,
};
