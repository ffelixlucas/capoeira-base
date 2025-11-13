const logger = require("../../utils/logger");
const equipeService = require("./equipeService");

/* -------------------------------------------------------------------------- */
/* 📋 Listar equipe (multi-organização)                                       */
/* -------------------------------------------------------------------------- */
async function getEquipe(req, res) {
  try {
    const organizacaoId = req.usuario?.organizacao_id;
    const equipe = await equipeService.listarEquipe(organizacaoId);

    logger.debug("[equipeController] Equipe listada", {
      userId: req.usuario.id,
      organizacaoId,
      total: equipe.length,
    });

    res.json(equipe);
  } catch (error) {
    logger.error("[equipeController] Erro ao listar equipe", {
      erro: error.message,
    });
    res.status(500).json({ message: "Erro ao buscar equipe" });
  }
}

/* -------------------------------------------------------------------------- */
/* 🧱 Criar membro da equipe (multi-organização)                              */
/* -------------------------------------------------------------------------- */
async function criarEquipe(req, res) {
  try {
    const organizacaoId = req.usuario?.organizacao_id;
    const criado = await equipeService.criarEquipe(req.body, organizacaoId);

    logger.debug("[equipeController] Membro criado", {
      userId: req.usuario.id,
      organizacaoId,
      id: criado.id,
    });

    res.status(201).json({ id: criado.id, message: "Membro criado com sucesso" });
  } catch (error) {
    logger.error("[equipeController] Erro ao criar membro", {
      erro: error.message,
    });
    res.status(400).json({ message: error.message });
  }
}

/* -------------------------------------------------------------------------- */
/* ✏️ Atualizar membro da equipe (multi-organização)                          */
/* -------------------------------------------------------------------------- */
async function atualizarEquipe(req, res) {
  try {
    const organizacaoId = req.usuario?.organizacao_id;
    const atualizado = await equipeService.atualizarEquipe(
      req.params.id,
      req.body,
      organizacaoId
    );

    if (atualizado) {
      logger.debug("[equipeController] Membro atualizado", {
        id: req.params.id,
        organizacaoId,
      });
      res.json({ message: "Membro atualizado com sucesso" });
    } else {
      res.status(404).json({ message: "Membro não encontrado" });
    }
  } catch (error) {
    logger.error("[equipeController] Erro ao atualizar membro", {
      erro: error.message,
    });
    res.status(500).json({ message: "Erro ao atualizar membro" });
  }
}

/* -------------------------------------------------------------------------- */
/* ❌ Remover membro da equipe (multi-organização)                            */
/* -------------------------------------------------------------------------- */
async function removerEquipe(req, res) {
  try {
    const organizacaoId = req.usuario?.organizacao_id;
    const removido = await equipeService.removerEquipe(req.params.id, organizacaoId);

    if (removido) {
      logger.debug("[equipeController] Membro removido", {
        id: req.params.id,
        organizacaoId,
      });
      res.json({ message: "Membro removido com sucesso" });
    } else {
      res.status(404).json({ message: "Membro não encontrado" });
    }
  } catch (error) {
    logger.error("[equipeController] Erro ao remover membro", {
      erro: error.message,
    });
    res.status(500).json({ message: "Erro ao remover membro" });
  }
}

/* -------------------------------------------------------------------------- */
/* 👤 Atualizar perfil do próprio usuário                                     */
/* -------------------------------------------------------------------------- */
async function atualizarPerfil(req, res) {
  try {
    const organizacaoId = req.usuario?.organizacao_id;
    const atualizado = await equipeService.atualizarEquipe(
      req.usuario.id,
      req.body,
      organizacaoId
    );

    if (atualizado) {
      logger.debug("[equipeController] Perfil atualizado", {
        userId: req.usuario.id,
        organizacaoId,
      });
      res.json({ message: "Perfil atualizado com sucesso" });
    } else {
      res.status(404).json({ message: "Usuário não encontrado" });
    }
  } catch (error) {
    logger.error("[equipeController] Erro ao atualizar perfil", {
      erro: error.message,
    });
    res.status(500).json({ message: "Erro ao atualizar perfil" });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔑 Alterar senha do próprio usuário                                        */
/* -------------------------------------------------------------------------- */
async function alterarSenha(req, res) {
  try {
    const { senhaAtual, novaSenha } = req.body;
    const organizacaoId = req.usuario?.organizacao_id;

    if (!senhaAtual || !novaSenha) {
      return res.status(400).json({ message: "Informe senha atual e nova senha" });
    }

    const resultado = await equipeService.alterarSenha(
      req.usuario.id,
      senhaAtual,
      novaSenha,
      organizacaoId
    );

    if (!resultado.sucesso) {
      return res.status(400).json({ message: resultado.message });
    }

    logger.debug("[equipeController] Senha alterada com sucesso", {
      userId: req.usuario.id,
      organizacaoId,
    });

    res.json({ message: "Senha alterada com sucesso" });
  } catch (error) {
    logger.error("[equipeController] Erro ao alterar senha", {
      erro: error.message,
    });
    res.status(500).json({ message: "Erro interno ao alterar senha" });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔍 Buscar perfil do usuário logado                                         */
/* -------------------------------------------------------------------------- */
async function getPerfil(req, res) {
  try {
    const organizacaoId = req.usuario?.organizacao_id;
    const usuario = await equipeService.buscarPorId(req.usuario.id, organizacaoId);

    if (!usuario) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    delete usuario.senha_hash;

    if (usuario.roles && Array.isArray(usuario.roles)) {
      usuario.roles = usuario.roles.map((r) => r.nome);
    } else {
      usuario.roles = [];
    }

    usuario.organizacao_id = usuario.organizacao_id || null;
    usuario.grupo_id = usuario.grupo_id || null;

    logger.debug("[equipeController] Perfil retornado", {
      userId: req.usuario.id,
      organizacaoId,
    });

    res.json(usuario);
  } catch (error) {
    logger.error("[equipeController] Erro ao buscar perfil", {
      erro: error.message,
    });
    res.status(500).json({ message: "Erro interno ao buscar perfil" });
  }
}

/* -------------------------------------------------------------------------- */
module.exports = {
  getEquipe,
  criarEquipe,
  atualizarEquipe,
  removerEquipe,
  atualizarPerfil,
  alterarSenha,
  getPerfil,
};
