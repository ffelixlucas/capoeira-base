// 🎯 Routes - Pré-Matrículas
// Define as rotas públicas e internas (admin) relacionadas às pré-matrículas.

const express = require("express");
const router = express.Router();
const preMatriculasController = require("./preMatriculasController");
const checkRole = require("../../../middlewares/checkRole");
const verifyToken = require("../../../middlewares/verifyToken");  
// 🌐 ROTAS PÚBLICAS
// -------------------------------------------------

// 🧾 Formulário de pré-matrícula
// Ex: POST /api/public/pre-matriculas
router.post("/pre-matriculas", preMatriculasController.criarPreMatricula);

// 🧾 Formulário de pré-matrícula com slug público
// Ex: POST /api/public/pre-matriculas/:slug
router.post(
  "/pre-matriculas/:slug",
  (req, res, next) => {
    // injeta o slug no body para o service resolver automaticamente
    req.body.slug = req.params.slug;
    next();
  },
  preMatriculasController.criarPreMatricula
);


// 🔍 Buscar grupo (exibir nome no formulário público)
// Ex: GET /api/public/matricula/grupo/:organizacaoId
router.get(
  "/matricula/grupo/:organizacaoId",
  preMatriculasController.getGrupo // 👈 nova função (simples)
);

// 🔍 Detectar turma pela idade + slug
// Ex: GET /api/public/pre-matriculas/:slug/turma-por-idade/:idade
router.get(
  "/pre-matriculas/:slug/turma-por-idade/:idade",
  preMatriculasController.detectarTurmaPorIdade
);


// 🧠 ROTAS ADMINISTRATIVAS
// -------------------------------------------------

// Listar pré-matrículas pendentes por organização
// Ex: GET /api/public/admin/pre-matriculas/pendentes/:organizacaoId
router.get(
  "/admin/pre-matriculas/pendentes/:organizacaoId",
  verifyToken,
  checkRole(["admin"]),
  preMatriculasController.listarPendentes
);

// Atualizar status (aprovar/rejeitar)
// Ex: PATCH /api/public/admin/pre-matriculas/:id/status
router.patch(
  "/admin/pre-matriculas/:id/status",
  verifyToken,
  checkRole(["admin"]),
  preMatriculasController.atualizarStatus
);

module.exports = router;
