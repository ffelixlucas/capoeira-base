const authService = require('./authService');
const emailService = require('../../services/emailService'); 
const logger = require('../../utils/logger');

async function login(req, res) {
  let { email, senha } = req.body;

  try {
    // 🔥 normaliza antes de passar adiante
    email = email.trim().toLowerCase();

    const resultado = await authService.login(email, senha);
    return res.status(200).json(resultado);
  } catch (erro) {
    return res.status(401).json({ erro: erro.message });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body || {};
  if (!email) {
    return res.status(400).json({ message: 'Informe o email' });
  }

  const baseResetUrl = process.env.RESET_PASSWORD_URL;
  if (!baseResetUrl) {
    logger.error("⚠️ Variável RESET_PASSWORD_URL não definida no .env");
  }
  try {
    const resetLink = await authService.requestPasswordReset(email, baseResetUrl);

    if (resetLink) {
      // dispara e-mail de reset
      await emailService.enviarEmailReset({ email, link: resetLink });
    }

    // resposta sempre neutra
    return res.status(200).json({
      message: 'Se o email existir, enviaremos um link para redefinição de senha.',
    });
  } catch (e) {
    logger.error('forgotPassword error:', e);
    return res.status(200).json({
      message: 'Se o email existir, enviaremos um link para redefinição de senha.',
    });
  }
}

async function resetPassword(req, res) {
  const { token, novaSenha } = req.body || {};
  if (!token || !novaSenha) {
    return res.status(400).json({ message: 'Token e nova senha são obrigatórios' });
  }

  try {
    await authService.resetPassword(token, novaSenha);
    return res.status(200).json({ message: 'Senha redefinida com sucesso' });
  } catch (e) {
    logger.error('resetPassword error:', e);
    return res.status(400).json({ message: e.message || 'Erro ao redefinir senha' });
  }
}

module.exports = {
  login,
  forgotPassword,
  resetPassword,
};
