const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

console.log("JWT usado:", process.env.JWT_SECRET);


async function login(email, senha) {
  const usuario = await userRepository.buscarUsuarioPorEmail(email);

  if (!usuario) {
    throw new Error('Usuário não encontrado');
  }

  const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
  if (!senhaValida) {
    throw new Error('Senha incorreta');
  }

  const token = jwt.sign(
    {
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return { token, usuario: { id: usuario.id, nome: usuario.nome, role: usuario.role } };
}

module.exports = {
  login,
};
