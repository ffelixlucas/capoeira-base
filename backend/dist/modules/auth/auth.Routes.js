const express = require('express');
const router = express.Router();
const authController = require('./authController');
const verifyToken = require('../../middlewares/verifyToken');
// 🔐 Rota de login
router.post('/login', authController.login);
// 🔑 Esqueci minha senha (público)
router.post('/forgot-password', authController.forgotPassword);
// 🔑 Redefinir senha (público)
router.post('/reset-password', authController.resetPassword);
// 🔍 Rota para obter dados do usuário logado
router.get('/me', verifyToken, (req, res) => {
    const { id, nome, email, roles } = req.usuario;
    res.json({ id, nome, email, roles });
});
module.exports = router;
