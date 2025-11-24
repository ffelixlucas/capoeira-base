// 🎯 Controller - Pré-Matrículas Públicas e Administrativas
// Responsável por receber requisições HTTP e chamar o service correspondente.

const preMatriculasService = require("./preMatriculasService");
const matriculaService = require("../../matricula/matriculaService");
const logger = require("../../../utils/logger.js");

/* -------------------------------------------------------------------------- */
/* 🔹 Criação de pré-matrícula (rota pública ou autenticada)                  */
/* -------------------------------------------------------------------------- */
async function criarPreMatricula(req, res) {
  try {
    // 🧭 Se vier slug na rota (ex: /pre-matriculas/:slug), injeta no body
    if (req.params.slug) {
      req.body.slug = req.params.slug;
      logger.debug(
        `[preMatriculasController] Slug detectado na rota: ${req.params.slug}`
      );
    }

    const dados = req.body; // 👈 importante vir depois do bloco acima

    // 🔐 Fluxo seguro para multi-organização:
    const usuario = req.usuario || req.user;
    if (usuario?.organizacao_id) {
      dados.organizacao_id = usuario.organizacao_id;
    } else {
      dados.organizacao_id = req.body.organizacao_id;
    }

    // ✅ Validação final (permite organizacao_id ou slug)
    if (!dados.organizacao_id && !dados.slug) {
      return res
        .status(400)
        .json({ error: "Organização não informada ou inválida." });
    }

    logger.info(
      `[preMatriculasController] Nova pré-matrícula recebida (${dados.organizacao_id ? "org " + dados.organizacao_id : "via slug"})`
    );

    const resultado = await preMatriculasService.criarPreMatricula(dados);
    return res.status(201).json(resultado);
  } catch (err) {
    logger.error(
      "[preMatriculasController] Erro ao criar pré-matrícula:",
      err.message
    );
    return res
      .status(400)
      .json({ error: err.message || "Erro ao criar pré-matrícula." });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Listagem de pré-matrículas pendentes (admin autenticado)                */
/* -------------------------------------------------------------------------- */
async function listarPendentes(req, res) {
  try {
    const usuario = req.usuario || req.user;
    const organizacaoId = usuario?.organizacao_id;

    if (!organizacaoId) {
      return res.status(403).json({
        error: "Acesso negado: organização não identificada no token.",
      });
    }

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

/* -------------------------------------------------------------------------- */
/* 🔹 Atualização de status (aprovar / rejeitar)                              */
/* -------------------------------------------------------------------------- */
async function atualizarStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const organizacao_id = req.usuario?.organizacao_id;

  try {
    logger.info(
      `[preMatriculasController] org ${organizacao_id} - requisição recebida para atualizar status da pré ${id} → ${status}`
    );

    // 🎯 Encaminha tudo pro service (ele já trata aprovado/rejeitado internamente)
    const resultado = await preMatriculasService.atualizarStatus(
      id,
      status,
      organizacao_id
    );

    logger.info(
      `[preMatriculasController] org ${organizacao_id} - status ${status} processado com sucesso`
    );

    return res.json({
      sucesso: resultado?.sucesso ?? true,
      mensagem:
        resultado?.mensagem || `Status atualizado para ${status} com sucesso.`,
    });
  } catch (err) {
    logger.error(
      `[preMatriculasController] org ${organizacao_id} - erro ao atualizar status da pré ${id}:`,
      err.message
    );
    return res.status(500).json({
      sucesso: false,
      mensagem: "Erro ao atualizar status da pré-matrícula.",
      erro: err.message,
    });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔹 Retorna nome do grupo da organização (usado no formulário público)      */
/* -------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------- */
/* 🔍 Detectar turma por idade + slug (público)                               */
/* -------------------------------------------------------------------------- */
async function detectarTurmaPorIdade(req, res) {
  try {
    const { slug, idade } = req.params;

    logger.debug(
      `[preMatriculasController] Detectando turma para slug=${slug} idade=${idade}`
    );

    const turma = await preMatriculasService.detectarTurmaPorIdade({
      slug,
      idade: Number(idade),
    });

    return res.json({ data: turma });
  } catch (err) {
    logger.error(
      "[preMatriculasController] Erro ao detectar turma:",
      err.message
    );
    return res.status(400).json({
      error: "Erro ao detectar turma para a idade informada.",
    });
  }
}
/* -------------------------------------------------------------------------- */
/* 🔍 Listar graduações por categoria (público + slug)                         */
/* -------------------------------------------------------------------------- */
async function listarGraduacoesPorCategoriaPublic(req, res) {
  try {
    const { slug, categoriaId } = req.params;

    logger.debug(
      `[preMatriculasController] Buscando graduações (slug=${slug}, categoria=${categoriaId})`
    );

    const graduacoes =
      await preMatriculasService.listarGraduacoesPorCategoriaPublic({
        slug,
        categoriaId,
      });

    return res.json({ data: graduacoes });
  } catch (err) {
    logger.error(
      "[preMatriculasController] Erro ao listar graduações públicas:",
      err.message
    );

    return res
      .status(400)
      .json({ error: "Erro ao listar graduações para essa categoria." });
  }
}

module.exports = {
  criarPreMatricula,
  listarPendentes,
  atualizarStatus,
  getGrupo,
  detectarTurmaPorIdade,
  listarGraduacoesPorCategoriaPublic,
};
