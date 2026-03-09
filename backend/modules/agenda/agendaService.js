// backend/modules/agenda/agendaService.js
const bucket = require("../../config/firebase");
const { v4: uuidv4 } = require("uuid");
const agendaRepository = require("./agendaRepository");
const logger = require("../../utils/logger.js");

/* -------------------------------------------------------------------------- */
/* 🧩 Utilitário - Normalização de JSON                                       */
/* -------------------------------------------------------------------------- */
function normalizarConfig(conf) {
  if (!conf) return {};
  if (typeof conf === "object") return conf;
  try {
    return JSON.parse(conf);
  } catch {
    return {};
  }
}

function normalizarTelefoneContato(value) {
  if (value == null) return "";
  return String(value).trim().slice(0, 30);
}

function normalizarWhatsappUrl(value) {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;

  if (/^https?:\/\//i.test(raw)) return raw.slice(0, 255);
  if (/^(chat\.whatsapp\.com|wa\.me)\//i.test(raw)) return `https://${raw}`.slice(0, 255);
  return raw.slice(0, 255);
}

function parseBooleanFlag(value) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function extrairCaminhoStorage(url) {
  if (!url) return null;
  return decodeURIComponent(new URL(url).pathname.replace(/^\/[^/]+\//, ""));
}

async function excluirImagemStorage(url) {
  const caminho = extrairCaminhoStorage(url);
  if (!caminho) return;
  await bucket.file(caminho).delete({ ignoreNotFound: true });
}

async function salvarImagemEvento(imagem) {
  const nomeArquivo = `eventos/${uuidv4()}-${imagem.originalname}`;
  const file = bucket.file(nomeArquivo);

  await file.save(imagem.buffer, {
    metadata: { contentType: imagem.mimetype },
  });

  return `https://storage.googleapis.com/${bucket.name}/${nomeArquivo}`;
}

/* -------------------------------------------------------------------------- */
/* 🔍 Listar eventos (multi-org)                                              */
/* -------------------------------------------------------------------------- */
async function listarEventos(organizacaoId, status, situacao) {
  logger.debug("[agendaService] Listando eventos", {
    organizacaoId,
    status,
    situacao,
  });
  const eventos = await agendaRepository.listarEventos(
    organizacaoId,
    status,
    situacao
  );

  return eventos.map((e) => ({
    ...e,
    configuracoes: normalizarConfig(e.configuracoes),
  }));
}

/* -------------------------------------------------------------------------- */
/* 🧱 Criar evento                                                            */
/* -------------------------------------------------------------------------- */
async function criarEvento(dados, usuarioId, organizacaoId) {
  if (!dados.titulo || !dados.data_inicio) {
    throw new Error("Título e data de início são obrigatórios.");
  }

  const evento = {
    organizacao_id: organizacaoId,
    titulo: dados.titulo,
    descricao_curta: dados.descricao_curta || "",
    descricao_completa: dados.descricao_completa || "",
    local: dados.local || "",
    endereco: dados.endereco || "",
    telefone_contato: normalizarTelefoneContato(dados.telefone_contato),
    whatsapp_url: normalizarWhatsappUrl(dados.whatsapp_url),
    data_inicio: dados.data_inicio,
    data_fim: dados.data_fim || null,
    inscricoes_ate: dados.inscricoes_ate || null,
    imagem_url: dados.imagem_url || null,
    com_inscricao: dados.com_inscricao || false,
    valor: dados.valor || 0,
    responsavel_id: dados.responsavel_id || null,
    configuracoes: normalizarConfig(dados.configuracoes),
    criado_por: usuarioId || null,
    possui_camiseta: parseInt(dados.possui_camiseta) === 1 ? 1 : 0,
  };

  const id = await agendaRepository.criarEvento(evento);
  logger.debug("[agendaService] Evento criado", { id, organizacaoId });
  return { id };
}

/* -------------------------------------------------------------------------- */
/* 🖼️ Criar evento com upload de imagem (Firebase)                           */
/* -------------------------------------------------------------------------- */
async function processarUploadEvento(imagem, dados, usuarioId, organizacaoId) {
  let imagem_url = null;

  try {
    if (imagem) {
      imagem_url = await salvarImagemEvento(imagem);
      logger.debug("[agendaService] Imagem salva no Firebase", { imagem_url });
    }

    const evento = {
      organizacao_id: organizacaoId,
      titulo: dados.titulo || "",
      descricao_curta: dados.descricao_curta || "",
      descricao_completa: dados.descricao_completa || "",
      local: dados.local || "",
      endereco: dados.endereco || "",
      telefone_contato: normalizarTelefoneContato(dados.telefone_contato),
      whatsapp_url: normalizarWhatsappUrl(dados.whatsapp_url),
      data_inicio: dados.data_inicio || null,
      data_fim: dados.data_fim || null,
      inscricoes_ate: dados.inscricoes_ate || null,
      imagem_url,
      com_inscricao: dados.com_inscricao || false,
      valor: dados.valor || 0,
      responsavel_id: dados.responsavel_id || null,
      configuracoes: normalizarConfig(dados.configuracoes),
      criado_por: usuarioId || null,
      possui_camiseta: parseInt(dados.possui_camiseta) === 1 ? 1 : 0,
    };

    const id = await agendaRepository.criarEvento(evento);
    return { id, imagem_url };
  } catch (error) {
    logger.error("[agendaService] Erro ao salvar imagem", error);
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/* ❌ Excluir evento                                                          */
/* -------------------------------------------------------------------------- */
async function excluirEvento(id, organizacaoId) {
  const evento = await agendaRepository.buscarPorId(id, organizacaoId);
  if (!evento) throw new Error("Evento não encontrado ou já removido.");

  if (evento.imagem_url) {
    try {
      const caminho = decodeURIComponent(
        new URL(evento.imagem_url).pathname.replace(/^\/[^/]+\//, "")
      );
      await bucket.file(caminho).delete();
      logger.debug("[agendaService] Imagem excluída do Firebase", { caminho });
    } catch (error) {
      logger.warn("[agendaService] Erro ao excluir imagem", {
        erro: error.message,
      });
    }
  }

  return agendaRepository.excluirEvento(id, organizacaoId);
}

/* -------------------------------------------------------------------------- */
/* ✏️ Atualizar evento                                                       */
/* -------------------------------------------------------------------------- */
async function atualizarEvento(id, organizacaoId, dados, imagem = null) {
  const atual = await agendaRepository.buscarPorId(id, organizacaoId);
  if (!atual) {
    throw new Error("Evento não encontrado.");
  }

  const removerImagemAtual = parseBooleanFlag(dados.imagem_removida);
  let novaImagemUrl = atual.imagem_url ?? null;
  let uploadedImageUrl = null;

  try {
    if (imagem) {
      uploadedImageUrl = await salvarImagemEvento(imagem);
      novaImagemUrl = uploadedImageUrl;
    } else if (removerImagemAtual) {
      novaImagemUrl = null;
    }

    const evento = {
      titulo: dados.titulo ?? "",
      descricao_curta: dados.descricao_curta ?? "",
      descricao_completa: dados.descricao_completa ?? "",
      local: dados.local ?? "",
      endereco: dados.endereco ?? "",
      telefone_contato: normalizarTelefoneContato(dados.telefone_contato),
      whatsapp_url: normalizarWhatsappUrl(dados.whatsapp_url),
      data_inicio: dados.data_inicio ?? null,
      data_fim: dados.data_fim ?? null,
      inscricoes_ate: dados.inscricoes_ate ?? null,
      imagem_url: novaImagemUrl,
      com_inscricao: dados.com_inscricao ?? false,
      valor: dados.valor ?? 0,
      responsavel_id: dados.responsavel_id ?? null,
      configuracoes: normalizarConfig(dados.configuracoes),
      possui_camiseta: parseInt(dados.possui_camiseta) === 1 ? 1 : 0,
      status: dados.status || "ativo",
    };

    const atualizado = await agendaRepository.atualizar(id, organizacaoId, evento);

    if (atualizado && atual.imagem_url && (imagem || removerImagemAtual)) {
      await excluirImagemStorage(atual.imagem_url).catch((error) => {
        logger.warn("[agendaService] Erro ao excluir imagem antiga", {
          erro: error.message,
          id,
        });
      });
    }

    return atualizado;
  } catch (error) {
    if (uploadedImageUrl) {
      await excluirImagemStorage(uploadedImageUrl).catch(() => undefined);
    }
    throw error;
  }
}

/* -------------------------------------------------------------------------- */
/* 🔄 Atualizar status                                                       */
/* -------------------------------------------------------------------------- */
async function atualizarStatus(id, organizacaoId, status) {
  return agendaRepository.atualizarStatus(id, organizacaoId, status);
}

/* -------------------------------------------------------------------------- */
/* 🗂️ Arquivar evento                                                        */
/* -------------------------------------------------------------------------- */
async function arquivarEvento(id, organizacaoId) {
  const evento = await agendaRepository.buscarPorId(id, organizacaoId);
  if (!evento) return false;

  if (evento.imagem_url) {
    try {
      const caminho = decodeURIComponent(
        new URL(evento.imagem_url).pathname.replace(/^\/[^/]+\//, "")
      );
      await bucket.file(caminho).delete();
      logger.debug("[agendaService] Imagem do evento arquivada/excluída", {
        caminho,
      });
    } catch (error) {
      logger.warn("[agendaService] Erro ao excluir imagem no arquivamento", {
        erro: error.message,
      });
    }
  }

  const dataFim = evento.data_fim || new Date();
  return agendaRepository.atualizar(id, organizacaoId, {
    ...evento,
    status: "concluido",
    data_fim: dataFim,
    imagem_url: null,
  });
}

/* -------------------------------------------------------------------------- */
module.exports = {
  listarEventos,
  criarEvento,
  processarUploadEvento,
  excluirEvento,
  atualizarEvento,
  atualizarStatus,
  arquivarEvento,
};
