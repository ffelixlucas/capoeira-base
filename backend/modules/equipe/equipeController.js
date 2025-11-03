const logger = require("../../utils/logger");
const equipeService = require("./equipeService");

async function getEquipe(req, res) {
  try {
    const equipe = await equipeService.listarEquipe();
    res.json(equipe);
  } catch (error) {
    logger.error("Erro ao listar equipe:", error);
    res.status(500).json({ message: "Erro ao buscar equipe" });
  }
}

async function criarEquipe(req, res) {
  try {
    const id = await equipeService.criarEquipe(req.body);
    res.status(201).json({ id, message: "Membro criado com sucesso" });
  } catch (error) {
    logger.error("Erro ao criar membro:", error.message);
    res.status(400).json({ message: error.message });
  }
}

async function atualizarEquipe(req, res) {
  try {
    const atualizado = await equipeService.atualizarEquipe(
      req.params.id,
      req.body
    );
    if (atualizado) {
      res.json({ message: "Membro atualizado com sucesso" });
    } else {
      res.status(404).json({ message: "Membro não encontrado" });
    }
  } catch (error) {
    logger.error("Erro ao atualizar membro:", error);
    res.status(500).json({ message: "Erro ao atualizar membro" });
  }
}

async function removerEquipe(req, res) {
  try {
    const removido = await equipeService.removerEquipe(req.params.id);
    if (removido) {
      res.json({ message: "Membro removido com sucesso" });
    } else {
      res.status(404).json({ message: "Membro não encontrado" });
    }
  } catch (error) {
    logger.error("Erro ao remover membro:", error);
    res.status(500).json({ message: "Erro ao remover membro" });
  }
}

async function atualizarPerfil(req, res) {
  try {
    const atualizado = await equipeService.atualizarEquipe(
      req.usuario.id,
      req.body
    );
    if (atualizado) {
      res.json({ message: "Perfil atualizado com sucesso" });
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }
  } catch (error) {
    logger.error("Erro ao atualizar perfil:", error);
    res.status(500).json({ message: "Erro ao atualizar perfil" });
  }
}
async function alterarSenha(req, res) {
  try {
    const { senhaAtual, novaSenha } = req.body;

    if (!senhaAtual || !novaSenha) {
      return res
        .status(400)
        .json({ message: "Informe senha atual e nova senha" });
    }

    const resultado = await equipeService.alterarSenha(
      req.usuario.id,
      senhaAtual,
      novaSenha
    );

    if (!resultado.sucesso) {
      return res.status(400).json({ message: resultado.message });
    }

    res.json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    logger.error("Erro ao alterar senha:", error);
    res.status(500).json({ message: "Erro interno ao alterar senha" });
  }
}

async function getPerfil(req, res) {
  try {
    const usuario = await equipeService.buscarPorId(req.usuario.id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    // remover hash
    delete usuario.senha_hash;

    // garantir que roles seja array de strings
    if (usuario.roles && Array.isArray(usuario.roles)) {
      usuario.roles = usuario.roles.map((r) => r.nome);
    } else {
      usuario.roles = [];
    }

    // 🔥 agora retorna organizacao_id e grupo_id para multi-organização
    usuario.organizacao_id = usuario.organizacao_id || null;
    usuario.grupo_id = usuario.grupo_id || null;

    logger.log("📌 Perfil atualizado:", usuario);

    res.json(usuario);
  } catch (error) {
    logger.error("Erro ao buscar perfil:", error);
    res.status(500).json({ message: "Erro interno ao buscar perfil" });
  }
}

module.exports = {
  getEquipe,
  criarEquipe,
  atualizarEquipe,
  removerEquipe,
  atualizarPerfil,
  alterarSenha,
  getPerfil,
};
