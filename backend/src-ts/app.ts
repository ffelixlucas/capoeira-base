import express from "express";
import cors from "cors";
import "dotenv/config";

const app = express();

// 🧩 Middlewares globais
app.use(cors());

// 📦 Body parsers com limite aumentado (para fotos em Base64)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// -----------------------------------------------------------
// 📦 Importar rotas (JS atual) — via require() para manter compatibilidade
// -----------------------------------------------------------
const authRoutes = require("../modules/auth/auth.Routes");
const agendaRoutes = require("../modules/agenda/agendaRoutes");
const alunosRoutes = require("../modules/alunos/alunosRoutes");
const categoriasRoutes = require("../modules/categorias/categoriasRoutes");
const equipeRoutes = require("../modules/equipe/equipeRoutes");
const equipeRolesRoutes = require("../modules/equipe/equipeRoles/equipeRolesRoutes");
const galeriaRoutes = require("../modules/galeria/galeriaRoutes");
const graduacoesRoutes = require("../modules/graduacoes/graduacoesRoutes");
const horariosRoutes = require("../modules/horarios/horariosRoutes");
const inscricoesRoutes = require("../modules/inscricoes/inscricoesRoutes");
const lembretesRoutes = require("../modules/lembretes/lembretesRoutes");
const matriculaRoutes = require("../modules/matricula/matriculaRoutes");
const notificacaoDestinosRoutes = require("../modules/notificacaoDestinos/notificacaoDestinosRoutes");
const uploadRoutes = require("../modules/uploads/uploadRoutes");

// PÚBLICAS
const preMatriculasRoutes = require("../modules/public/preMatriculas/preMatriculasRoutes");
const publicAgendaRoutes = require("../modules/public/agenda/publicAgendaRoutes");
const publicInscricoesRoutes = require("../modules/public/inscricoes/inscricoesRoutes");
const organizacaoPublicRoutes = require("../modules/shared/organizacoes/organizacaoPublicRoutes");

// Mistas
const notasAlunoRoutes = require("../modules/notasAluno/notasAlunoRoutes");
const presencasRoutes = require("../modules/presencas/presencasRoutes");
const turmasRoutes = require("../modules/turmas/turmasRoutes");
const whatsappRoutes = require("../modules/whatsappdestinos/whatsappDestinosRoutes");

// 🔍 Health-check Railway
app.get("/status", (req, res) => {
  res.json({
    ok: true,
    env: process.env.NODE_ENV || "dev",
    timestamp: new Date().toISOString(),
    loggerTS: true,
  });
});

// -----------------------------------------------------------
// 🌐 ROTAS PÚBLICAS
// -----------------------------------------------------------
app.use("/api/teste", (_, res) => res.json({ mensagem: "API no ar!" }));

app.use("/api/public/agenda", publicAgendaRoutes);
app.use("/api/public/inscricoes", publicInscricoesRoutes);

// -----------------------------------------------------------
// 🔒 AUTENTICAÇÃO
// -----------------------------------------------------------
app.use("/api/auth", authRoutes);

// -----------------------------------------------------------
// 🧠 ADMIN
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
app.use("/api/notas-aluno", notasAlunoRoutes);
app.use("/api/notificacoes", notificacaoDestinosRoutes);
app.use("/api/presencas", presencasRoutes);
app.use("/api/roles", require("../modules/roles/rolesRoutes"));
app.use("/api/turmas", turmasRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/graduacoes", graduacoesRoutes);
app.use("/api/whatsapp-destinos", whatsappRoutes);

// -----------------------------------------------------------
// 🔄 MISTAS
// -----------------------------------------------------------
app.use("/api/public", preMatriculasRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/public/organizacoes", organizacaoPublicRoutes);

export default app;
