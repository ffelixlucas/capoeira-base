const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

// Middleware básico
app.use(express.json());

// Importar rotas
const testeRoutes = require('./routes/teste.routes');
const galeriaRoutes = require('./routes/galeriaRoutes');

// Usar rotas
app.use('/api', testeRoutes);
app.use('/api/galeria', galeriaRoutes);

module.exports = app;
