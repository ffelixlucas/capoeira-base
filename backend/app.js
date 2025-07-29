const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

// Middlewares
app.use(cors());
app.use(express.json());

// Importar rotas
const galeriaRoutes = require('./modules/galeria/galeriaRoutes');
const authRoutes = require('./modules/auth/auth.Routes');
const agendaRoutes = require('./modules/agenda/agendaRoutes');
const horariosRoutes = require('./modules/horarios/horariosRoutes'); 
const equipeRoutes = require('./modules/equipe/equipeRoutes'); 
const rolesRoutes = require('./modules/roles/rolesRoutes'); 
const equipeRolesRoutes = require('./modules/equipe/equipeRoles/equipeRolesRoutes');
const lembretesRoutes = require('./modules/lembretes/lembretesRoutes');
const alunosRoutes = require('./modules/alunos/alunosRoutes');
const inscricoesRoutes = require('./modules/inscricoes/inscricoesRoutes');
// Configurações do servidor

// Rotas públicas
app.use('/api/teste', (_, res) => res.json({ mensagem: 'API no ar!' }));

// Autenticação
app.use('/api/auth', authRoutes);

// Módulos administrativos
app.use('/api/equipe', equipeRoutes);
app.use('/api/equipe', equipeRolesRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/galeria', galeriaRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/lembretes', lembretesRoutes);
app.use('/api/whatsapp-destinos', require('./modules/whatsappdestinos/whatsappDestinosRoutes'));
app.use('/api/alunos', alunosRoutes);
app.use("/api/notas-aluno", require("./modules/notasAluno/notasAlunoRoutes"));
app.use("/api/turmas", require("./modules/turmas/turmasRoutes.js"));
app.use('/api/inscricoes', inscricoesRoutes);






module.exports = app;
