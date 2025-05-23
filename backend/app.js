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
const agendaRoutes = require('./routes/agendaRoutes'); // ✅ Importação ok

// Usar rotas
app.use('/api', authRoutes);
app.use('/api/galeria', galeriaRoutes);
app.use('/api/agenda', agendaRoutes); // ✅ Faltava essa linha!

module.exports = app;
