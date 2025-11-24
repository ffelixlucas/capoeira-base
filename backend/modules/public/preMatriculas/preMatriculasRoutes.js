// 🎯 Routes - Pré-Matrículas
// Define rotas públicas e internas relacionadas às pré-matrículas.

const express = require("express");
const router = express.Router();
const preMatriculasController = require("./preMatriculasController");
const checkRole = require("../../../middlewares/checkRole");
const verifyToken = require("../../../middlewares/verifyToken");

// 🌐 ROTAS PÚBLICAS
// -------------------------------------------------

// Criar pré-matrícula
router.post("/pre-matriculas", preMatriculasController.criarPreMatricula);

// Criar pré-matrícula via slug público
router.post(
  "/pre-matriculas/:slug",
  (req, res, next) => {
    req.body.slug = req.params.slug;
    next();
  },
  preMatriculasController.criarPreMatricula
);

// Buscar GRADUAÇÕES por categoria (público + multi-org)
router.get(
  "/pre-matriculas/:slug/graduacoes/:categoriaId",
  preMatriculasController.listarGraduacoesPorCategoriaPublic
);

// Buscar grupo da organização
router.get(
  "/matricula/grupo/:organizacaoId",
  preMatriculasController.getGrupo
);

// Detectar turma pela idade
router.get(
  "/pre-matriculas/:slug/turma-por-idade/:idade",
  preMatriculasController.detectarTurmaPorIdade
);

// 🧠 ROTAS ADMINISTRATIVAS
// -------------------------------------------------

// Listar pré-matrículas pendentes
router.get(
  "/admin/pre-matriculas/pendentes/:organizacaoId",
  verifyToken,
  checkRole(["admin"]),
  preMatriculasController.listarPendentes
);

// Atualizar status
router.patch(
  "/admin/pre-matriculas/:id/status",
  verifyToken,
  checkRole(["admin"]),
  preMatriculasController.atualizarStatus
);

module.exports = router;
