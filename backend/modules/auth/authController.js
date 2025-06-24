const authService = require('./authService');

async function login(req, res) {
  const { email, senha } = req.body;

  try {
    const resultado = await authService.login(email, senha);
    return res.status(200).json(resultado);
  } catch (erro) {
    return res.status(401).json({ erro: erro.message });
  }
}

module.exports = {
  login,
};
