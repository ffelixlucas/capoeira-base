// 🎯 Routes - Pré-Matrículas
// Define as rotas públicas e internas (admin) relacionadas às pré-matrículas.

const express = require("express");
const router = express.Router();
const preMatriculasController = require("./preMatriculasController");

// 🌐 ROTAS PÚBLICAS
// -------------------------------------------------

// 🧾 Formulário de pré-matrícula
// Ex: POST /api/public/pre-matriculas
router.post("/pre-matriculas", preMatriculasController.criarPreMatricula);

// 🔍 Buscar grupo (exibir nome no formulário público)
// Ex: GET /api/public/matricula/grupo/:organizacaoId
router.get(
  "/matricula/grupo/:organizacaoId",
  preMatriculasController.getGrupo // 👈 nova função (simples)
);

// 🧠 ROTAS ADMINISTRATIVAS
// -------------------------------------------------

// Listar pré-matrículas pendentes por organização
// Ex: GET /api/public/admin/pre-matriculas/pendentes/:organizacaoId
router.get(
  "/admin/pre-matriculas/pendentes/:organizacaoId",
  preMatriculasController.listarPendentes
);

// Atualizar status (aprovar/rejeitar)
// Ex: PATCH /api/public/admin/pre-matriculas/:id/status
router.patch(
  "/admin/pre-matriculas/:id/status",
  preMatriculasController.atualizarStatus
);

module.exports = router;
