const equipeRepository = require("./equipeRepository");
const logger = require("../../utils/logger");
const bcrypt = require("bcrypt");

/* -------------------------------------------------------------------------- */
/* 📋 Listar equipe (multi-organização)                                       */
/* -------------------------------------------------------------------------- */
async function listarEquipe(organizacaoId) {
  try {
    if (!organizacaoId) throw new Error("organizacao_id é obrigatório");
    logger.debug("[equipeService] Listando equipe", { organizacaoId });

    const equipe = await equipeRepository.getAllEquipe(organizacaoId);

    logger.debug("[equipeService] Equipe listada com sucesso", {
      organizacaoId,
      total: equipe.length,
    });

    return equipe;
  } catch (error) {
    logger.error("[equipeService] Erro ao listar equipe", {
      organizacaoId,
      erro: error.message,
    });
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/* 🧱 Criar novo membro (multi-organização)                                   */
/* -------------------------------------------------------------------------- */
async function criarEquipe(dados, organizacaoId) {
  try {
    if (!organizacaoId) throw new Error("organizacao_id é obrigatório");
    if (!dados.nome || !dados.email || !dados.senha) {
      throw new Error("Nome, email e senha são obrigatórios");
    }

    dados.organizacao_id = organizacaoId;
    dados.senha_hash = await bcrypt.hash(dados.senha, 10);
    delete dados.senha;

    const criado = await equipeRepository.createEquipe(dados);

    logger.debug("[equipeService] Membro criado com sucesso", {
      organizacaoId,
      id: criado.id,
      nome: dados.nome,
      email: dados.email,
    });

    return criado;
  } catch (error) {
    logger.error("[equipeService] Erro ao criar membro", {
      organizacaoId,
      erro: error.message,
    });
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/* ✏️ Atualizar membro (multi-organização)                                    */
/* -------------------------------------------------------------------------- */
async function atualizarEquipe(id, dados, organizacaoId) {
  try {
    if (!organizacaoId) throw new Error("organizacao_id é obrigatório");

    // ⚙️ Tratamento de senha
    if (dados.senha && dados.senha.trim() !== "") {
      dados.senha_hash = await bcrypt.hash(dados.senha, 10);
      delete dados.senha;
    } else {
      delete dados.senha;
    }

    const atualizado = await equipeRepository.updateEquipe(id, organizacaoId, dados);

    logger.debug("[equipeService] Membro atualizado", {
      id,
      organizacaoId,
      afetados: atualizado,
    });

    return atualizado;
  } catch (error) {
    logger.error("[equipeService] Erro ao atualizar membro", {
      id,
      organizacaoId,
      erro: error.message,
    });
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/* ❌ Remover membro (multi-organização)                                      */
/* -------------------------------------------------------------------------- */
async function removerEquipe(id, organizacaoId) {
  try {
    if (!organizacaoId) throw new Error("organizacao_id é obrigatório");

    const removido = await equipeRepository.deleteEquipe(id, organizacaoId);

    logger.debug("[equipeService] Membro removido", {
      id,
      organizacaoId,
      afetados: removido,
    });

    return removido;
  } catch (error) {
    logger.error("[equipeService] Erro ao remover membro", {
      id,
      organizacaoId,
      erro: error.message,
    });
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/* 🔑 Alterar senha do próprio membro (multi-organização)                     */
/* -------------------------------------------------------------------------- */
async function alterarSenha(id, senhaAtual, novaSenha, organizacaoId) {
  try {
    if (!organizacaoId) throw new Error("organizacao_id é obrigatório");

    const membro = await equipeRepository.buscarPorId(id, organizacaoId);
    if (!membro) {
      return { sucesso: false, message: "Usuário não encontrado" };
    }

    const senhaValida = await bcrypt.compare(senhaAtual, membro.senha_hash);
    if (!senhaValida) {
      return { sucesso: false, message: "Senha atual incorreta" };
    }

    const novaHash = await bcrypt.hash(novaSenha, 10);
    await equipeRepository.updateEquipe(id, organizacaoId, { senha_hash: novaHash });

    logger.debug("[equipeService] Senha alterada com sucesso", {
      id,
      organizacaoId,
    });

    return { sucesso: true };
  } catch (error) {
    logger.error("[equipeService] Erro ao alterar senha", {
      id,
      organizacaoId,
      erro: error.message,
    });
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/* 🔍 Buscar membro por ID (multi-organização)                                */
/* -------------------------------------------------------------------------- */
async function buscarPorId(id, organizacaoId) {
  try {
    if (!organizacaoId) throw new Error("organizacao_id é obrigatório");

    const membro = await equipeRepository.buscarPorId(id, organizacaoId);

    logger.debug("[equipeService] Membro buscado por ID", {
      id,
      organizacaoId,
      encontrado: !!membro,
    });

    return membro;
  } catch (error) {
    logger.error("[equipeService] Erro ao buscar membro por ID", {
      id,
      organizacaoId,
      erro: error.message,
    });
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
module.exports = {
  listarEquipe,
  criarEquipe,
  atualizarEquipe,
  removerEquipe,
  alterarSenha,
  buscarPorId,
};
