const express = require('express');
const router = express.Router();
const authController = require('./authController');

// 🔐 Rota de login
router.post('/login', authController.login);

module.exports = router;
