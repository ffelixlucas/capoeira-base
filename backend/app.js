const express = require('express');
const app = express();

// Middleware básico
app.use(express.json());

// Importar rotas
const testeRoutes = require('./routes/teste.routes');

// Usar rotas
app.use('/api', testeRoutes);

module.exports = app;
