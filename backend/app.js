const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config();

// Middlewares
app.use(cors());
app.use(express.json());

// Importar rotas
const galeriaRoutes = require('./routes/galeriaRoutes');
const authRoutes = require('./routes/auth.Routes');
const agendaRoutes = require('./routes/agendaRoutes');
const horariosRoutes = require('./routes/horariosRoutes'); 
const configuracoesRoutes = require('./routes/configuracoesRoutes');

// Configurações do servidor

app.use('/api/auth', authRoutes);
app.use('/api/galeria', galeriaRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/horarios', horariosRoutes); 
app.use('/api/configuracoes', configuracoesRoutes);
module.exports = app;
