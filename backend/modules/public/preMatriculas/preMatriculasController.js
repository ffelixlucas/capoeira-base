// 🎯 Controller - Pré-Matrículas Públicas
// Responsável por receber as requisições HTTP e chamar o service correspondente.

const preMatriculasService = require("./preMatriculasService");
const matriculaService = require("../../matricula/matriculaService"); // 👈 integração direta
const logger = require("../../../utils/logger");

/**
 * Cria uma nova pré-matrícula (rota pública)
 */
async function criarPreMatricula(req, res) {
  try {
    const dados = req.body;
    logger.info(
      "[preMatriculasController] Nova solicitação de pré-matrícula recebida"
    );

    const resultado = await preMatriculasService.criarPreMatricula(dados);
    return res.status(201).json(resultado);
  } catch (err) {
    logger.error(
      "[preMatriculasController] Erro ao criar pré-matrícula:",
      err.message
    );
    return res.status(400).json({
      error: err.message || "Erro ao criar pré-matrícula.",
    });
  }
}

/**
 * Lista todas as pré-matrículas pendentes (rota interna/admin)
 */
async function listarPendentes(req, res) {
  try {
    const { organizacaoId } = req.params;
    const lista = await preMatriculasService.listarPendentes(organizacaoId);
    return res.json(lista);
  } catch (err) {
    logger.error(
      "[preMatriculasController] Erro ao listar pendentes:",
      err.message
    );
    return res
      .status(400)
      .json({ error: "Erro ao listar pré-matrículas pendentes." });
  }
}

/**
 * Atualiza o status de uma pré-matrícula (aprovar/rejeitar)
 */
async function atualizarStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    logger.info(
      `[preMatriculasController] Atualizando status da pré-matrícula #${id} → ${status}`
    );

    const resultado = await preMatriculasService.atualizarStatus(id, status);

    // 🚀 Se aprovado, cria automaticamente aluno e matrícula real
    if (status === "aprovado") {
      try {
        // Busca os dados completos da pré-matrícula no banco
        const pre = await preMatriculasService.buscarPorId(id);

        if (!pre)
          throw new Error("Pré-matrícula não encontrada para criar matrícula.");

        await matriculaService.criarMatricula(pre);
        logger.info(
          `[preMatriculasController] Matrícula criada automaticamente para ID ${id}`
        );
      } catch (err) {
        logger.error(
          "[preMatriculasController] Erro ao criar matrícula após aprovação:",
          err.message
        );
      }
    }

    return res.json(resultado);
  } catch (err) {
    logger.error(
      "[preMatriculasController] Erro ao atualizar status:",
      err.message
    );
    return res
      .status(400)
      .json({ error: "Erro ao atualizar status da pré-matrícula." });
  }
}

/**
 * Retorna o nome do grupo (usado no formulário público)
 */
async function getGrupo(req, res) {
  try {
    const { organizacaoId } = req.params;
    const grupo =
      await preMatriculasService.buscarGrupoPorOrganizacaoId(organizacaoId);
    return res.json({ grupo });
  } catch (err) {
    logger.error(
      "[preMatriculasController] Erro ao buscar grupo:",
      err.message
    );
    return res.status(400).json({ error: "Erro ao buscar grupo." });
  }
}

module.exports = {
  criarPreMatricula,
  listarPendentes,
  atualizarStatus,
  getGrupo,
};
