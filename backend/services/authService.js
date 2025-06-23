const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const equipeRepository = require('../repositories/equipeRepository');

async function login(email, senha) {
  const usuario = await equipeRepository.buscarUsuarioPorEmail(email);

  if (!usuario) {
    throw new Error('Usuário não encontrado');
  }

  if (!usuario.senha_hash) {
    throw new Error('Usuário não possui acesso ao sistema');
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
      roles: usuario.roles,
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return { 
    token, 
    usuario: { 
      id: usuario.id, 
      nome: usuario.nome, 
      email: usuario.email,
      roles: usuario.roles
    } 
  };
}

module.exports = {
  login,
};
