const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authRepository = require('./authRepository');

async function login(email, senha) {
  const membro = await authRepository.buscarMembroPorEmail(email);

  if (!membro) {
    throw new Error('Usuário não encontrado');
  }

  if (!membro.senha_hash) {
    throw new Error('Este usuário não possui acesso ao sistema');
  }

  const senhaValida = await bcrypt.compare(senha, membro.senha_hash);
  if (!senhaValida) {
    throw new Error('Senha incorreta');
  }

  const token = jwt.sign(
    {
      id: membro.id,
      nome: membro.nome,
      email: membro.email,
      roles: membro.roles,
    },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );

  return {
    token,
    usuario: {
      id: membro.id,
      nome: membro.nome,
      email: membro.email,
      roles: membro.roles,
    },
  };
}

module.exports = {
  login,
};
