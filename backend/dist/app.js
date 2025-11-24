// 🚀 CAPOEIRA BASE - APP.JS
// -----------------------------------------------------------
// Configuração principal do servidor Express
// Estrutura padronizada: públicas / administrativas / mistas
// -----------------------------------------------------------
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
// -----------------------------------------------------------
// 🧩 Middlewares globais
// -----------------------------------------------------------
app.use(cors());
// 📦 Body parsers com limite aumentado (para fotos em Base64)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
// -----------------------------------------------------------
// 📦 Importar rotas de módulos
// -----------------------------------------------------------
const authRoutes = require("./modules/auth/auth.Routes");
const agendaRoutes = require("./modules/agenda/agendaRoutes");
const alunosRoutes = require("./modules/alunos/alunosRoutes");
const categoriasRoutes = require("./modules/categorias/categoriasRoutes");
const equipeRoutes = require("./modules/equipe/equipeRoutes");
const equipeRolesRoutes = require("./modules/equipe/equipeRoles/equipeRolesRoutes");
const galeriaRoutes = require("./modules/galeria/galeriaRoutes");
const graduacoesRoutes = require("./modules/graduacoes/graduacoesRoutes");
const horariosRoutes = require("./modules/horarios/horariosRoutes");
const inscricoesRoutes = require("./modules/inscricoes/inscricoesRoutes");
const lembretesRoutes = require("./modules/lembretes/lembretesRoutes");
const matriculaRoutes = require("./modules/matricula/matriculaRoutes");
const notificacaoDestinosRoutes = require("./modules/notificacaoDestinos/notificacaoDestinosRoutes");
const preMatriculasRoutes = require("./modules/public/preMatriculas/preMatriculasRoutes");
const rolesRoutes = require("./modules/roles/rolesRoutes");
// Uploads (fotos de perfil, eventos, loja, etc.)
const uploadRoutes = require("./modules/uploads/uploadRoutes");
// -----------------------------------------------------------
// 🌐 ROTAS PÚBLICAS
// -----------------------------------------------------------
// Status da API
app.use("/api/teste", (_, res) => res.json({ mensagem: "API no ar!" }));
// Páginas e dados públicos
app.use("/api/public/agenda", require("./modules/public/agenda/publicAgendaRoutes"));
app.use("/api/public/inscricoes", require("./modules/public/inscricoes/inscricoesRoutes"));
// -----------------------------------------------------------
// 🔒 AUTENTICAÇÃO
// -----------------------------------------------------------
app.use("/api/auth", authRoutes);
// -----------------------------------------------------------
// 🧠 MÓDULOS ADMINISTRATIVOS
// -----------------------------------------------------------
app.use("/api/admin", matriculaRoutes);
app.use("/api/agenda", agendaRoutes);
app.use("/api/alunos", alunosRoutes);
app.use("/api/equipe", equipeRoutes);
app.use("/api/equipe", equipeRolesRoutes);
app.use("/api/galeria", galeriaRoutes);
app.use("/api/horarios", horariosRoutes);
app.use("/api/inscricoes", inscricoesRoutes);
app.use("/api/lembretes", lembretesRoutes);
app.use("/api/notas-aluno", require("./modules/notasAluno/notasAlunoRoutes"));
app.use("/api/notificacoes", notificacaoDestinosRoutes);
app.use("/api/presencas", require("./modules/presencas/presencasRoutes"));
app.use("/api/roles", rolesRoutes);
app.use("/api/turmas", require("./modules/turmas/turmasRoutes"));
app.use("/api/categorias", categoriasRoutes);
app.use("/api/graduacoes", graduacoesRoutes);
app.use("/api/whatsapp-destinos", require("./modules/whatsappdestinos/whatsappDestinosRoutes"));
// -----------------------------------------------------------
// 🔄 ROTAS MISTAS (Públicas + Administrativas)
// -----------------------------------------------------------
app.use("/api/public", preMatriculasRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/public/organizacoes", require("./modules/shared/organizacoes/organizacaoPublicRoutes"));
module.exports = app;
