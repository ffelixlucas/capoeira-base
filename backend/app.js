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
// Configurações do servidor

app.use('/api/auth', authRoutes);
app.use('/api/galeria', galeriaRoutes);
app.use('/api/agenda', agendaRoutes);
app.use('/api/horarios', horariosRoutes); 
app.use('/api/equipe', equipeRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/equipe', equipeRolesRoutes);

module.exports = app;
