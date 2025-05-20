const express = require('express');
const app = express();

const cors = require('cors');
app.use(cors());

// Middleware básico
app.use(express.json());

// Importar rotas
const galeriaRoutes = require('./routes/galeriaRoutes');
const authRoutes = require('./routes/auth.Routes');

require('dotenv').config();

// Usar rotas
app.use('/api', authRoutes);
app.use('/api/galeria', galeriaRoutes);

module.exports = app;
