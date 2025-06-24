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
//const configuracoesRoutes = require('./modules/configuracoesRoutes');

// Configurações do servidor

app.use('/api/auth', authRoutes);
app.use('/api/galeria', galeriaRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/horarios', horariosRoutes); 
//app.use('/api/configuracoes', configuracoesRoutes);
module.exports = app;
