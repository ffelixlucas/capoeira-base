// backend/modules/agenda/agendaController.js
const agendaService = require("./agendaService");
const organizacaoService = require("../shared/organizacoes/organizacaoService");
const logger = require("../../utils/logger.js");
const { registrarAuditoria } = require("../../utils/auditoriaAtividades");

/* -------------------------------------------------------------------------- */
/* 🕒 Utilitário: formatação de data e hora                                   */
/* -------------------------------------------------------------------------- */
function formatarDataHora(data) {
  if (!data) return { data: null, horario: null };
  const d = new Date(data);
  return {
    data: d.toLocaleDateString("pt-BR"),
    horario: d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
}

/* -------------------------------------------------------------------------- */
/* 🔍 Listar eventos (suporte a público e painel)                             */
/* -------------------------------------------------------------------------- */
async function listarEventos(req, res) {
  try {
    // 🔹 tenta identificar a organização pelo token
    let organizacaoId = req.usuario?.organizacao_id || null;

    // 🔹 se for rota pública com slug (ex: ?slug=cn10)
    if (!organizacaoId && req.query?.slug) {
      logger.debug("[agendaController] Detectando slug público", {
        querySlug: req.query.slug,
      });

      const org = await organizacaoService.buscarPorSlug(req.query.slug);
      organizacaoId = org?.id || null;
    }

    if (!organizacaoId) {
      return res
        .status(400)
        .json({ sucesso: false, erro: "Organização não identificada." });
    }
    logger.debug("[agendaController] Organização identificada", {
      organizacaoId,
    });

    const { status, situacao } = req.query;
    logger.debug("[agendaController] Listando eventos", {
      organizacaoId,
      status,
      situacao,
    });

    const eventos = await agendaService.listarEventos(
      organizacaoId,
      status,
      situacao
    );
    const eventosFormatados = eventos.map((evento) => {
      const raw =
        typeof evento.data_inicio === "string"
          ? evento.data_inicio.replace(" ", "T")
          : (evento.data_inicio?.toISOString?.() ?? null);

      const { data, horario } = formatarDataHora(raw);
      return {
        ...evento,
        data_inicio: raw,
        data_formatada: data,
        horario_formatado: horario,
      };
    });

    return res.status(200).json({ sucesso: true, data: eventosFormatados });
  } catch (error) {
    logger.error("[agendaController] Erro ao listar eventos", error);
    return res
      .status(500)
      .json({ sucesso: false, erro: "Erro ao listar eventos." });
  }
}

/* -------------------------------------------------------------------------- */
/* 🧱 Criar evento                                                            */
/* -------------------------------------------------------------------------- */
async function criarEvento(req, res) {
  try {
    const usuarioId = req.usuario?.id || null;
    const organizacaoId = req.usuario?.organizacao_id;
    const idCriado = await agendaService.criarEvento(
      req.body,
      usuarioId,
      organizacaoId
    );

    res
      .status(201)
      .json({ mensagem: "Evento criado com sucesso.", id: idCriado });
    await registrarAuditoria({
      organizacaoId,
      usuarioId,
      usuarioNome: req.usuario?.nome || null,
      acao: "evento_criado",
      entidade: "agenda",
      entidadeId: idCriado,
      descricao: `Criou evento: ${req.body?.titulo || "Sem título"}`,
    });
  } catch (error) {
    logger.error("[agendaController] Erro ao criar evento", error);
    res.status(400).json({ erro: error.message });
  }
}

/* -------------------------------------------------------------------------- */
/* 🖼️ Criar evento com imagem (Firebase)                                     */
/* -------------------------------------------------------------------------- */
async function criarEventoComImagem(req, res) {
  try {
    const usuarioId = req.usuario?.id || null;
    const organizacaoId = req.usuario?.organizacao_id;
    const imagem = req.file;

    const dados = {
      ...req.body,
      possui_camiseta: parseInt(req.body.possui_camiseta) === 1 ? 1 : 0,
    };

    logger.debug("[agendaController] Upload recebido", {
      userId: usuarioId,
      orgId: organizacaoId,
      imagem: imagem?.originalname,
    });

    const resultado = await agendaService.processarUploadEvento(
      imagem,
      dados,
      usuarioId,
      organizacaoId
    );

    await registrarAuditoria({
      organizacaoId,
      usuarioId,
      usuarioNome: req.usuario?.nome || null,
      acao: "evento_criado",
      entidade: "agenda",
      entidadeId: resultado.id,
      descricao: `Criou evento com imagem: ${dados?.titulo || "Sem título"}`,
    });
    return res.status(201).json({
      mensagem: "Evento criado com imagem com sucesso.",
      id: resultado.id,
      imagem_url: resultado.imagem_url,
    });
  } catch (error) {
    logger.error("[agendaController] Erro ao criar evento com imagem", error);
    return res.status(500).json({ erro: "Erro ao criar evento com imagem." });
  }
}

/* -------------------------------------------------------------------------- */
/* ❌ Excluir evento                                                          */
/* -------------------------------------------------------------------------- */
async function excluirEvento(req, res) {
  try {
    const { id } = req.params;
    const organizacaoId = req.usuario?.organizacao_id;

    const sucesso = await agendaService.excluirEvento(id, organizacaoId);
    if (!sucesso)
      return res.status(404).json({ erro: "Evento não encontrado." });

    res.json({ mensagem: "Evento excluído com sucesso." });
    await registrarAuditoria({
      organizacaoId,
      usuarioId: req.usuario?.id || null,
      usuarioNome: req.usuario?.nome || null,
      acao: "evento_excluido",
      entidade: "agenda",
      entidadeId: id,
      descricao: `Excluiu evento #${id}`,
    });
  } catch (error) {
    logger.error("[agendaController] Erro ao excluir evento", error);
    res.status(500).json({ erro: "Erro ao excluir evento." });
  }
}

/* -------------------------------------------------------------------------- */
/* ✏️ Atualizar evento                                                       */
/* -------------------------------------------------------------------------- */
async function atualizarEvento(req, res) {
  try {
    const { id } = req.params;
    const organizacaoId = req.usuario?.organizacao_id;
    const imagem = req.file;
    const dados = {
      ...req.body,
      possui_camiseta: parseInt(req.body.possui_camiseta) === 1 ? 1 : 0,
    };

    await agendaService.atualizarEvento(id, organizacaoId, dados, imagem);
    res.status(200).json({ message: "Evento atualizado com sucesso" });
    await registrarAuditoria({
      organizacaoId,
      usuarioId: req.usuario?.id || null,
      usuarioNome: req.usuario?.nome || null,
      acao: "evento_atualizado",
      entidade: "agenda",
      entidadeId: id,
      descricao: `Atualizou evento: ${dados?.titulo || `#${id}`}`,
    });
  } catch (error) {
    logger.error("[agendaController] Erro ao atualizar evento", error);
    res.status(500).json({ message: "Erro ao atualizar evento" });
  }
}

/* -------------------------------------------------------------------------- */
/* 🔄 Atualizar status                                                       */
/* -------------------------------------------------------------------------- */
async function atualizarStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;
  const organizacaoId = req.usuario?.organizacao_id;

  if (!["ativo", "concluido", "cancelado"].includes(status)) {
    return res.status(400).json({ sucesso: false, erro: "Status inválido" });
  }

  try {
    const ok = await agendaService.atualizarStatus(id, organizacaoId, status);
    if (!ok)
      return res
        .status(404)
        .json({ sucesso: false, erro: "Evento não encontrado" });

    await registrarAuditoria({
      organizacaoId,
      usuarioId: req.usuario?.id || null,
      usuarioNome: req.usuario?.nome || null,
      acao: "evento_status",
      entidade: "agenda",
      entidadeId: id,
      descricao: `Alterou status do evento #${id} para ${status}`,
    });
    return res
      .status(200)
      .json({ sucesso: true, mensagem: `Evento marcado como ${status}` });
  } catch (error) {
    logger.error(
      "[agendaController] Erro ao atualizar status do evento",
      error
    );
    return res.status(500).json({ sucesso: false, erro: error.message });
  }
}

/* -------------------------------------------------------------------------- */
/* 🗂️ Arquivar evento                                                        */
/* -------------------------------------------------------------------------- */
async function arquivarEvento(req, res) {
  try {
    const { id } = req.params;
    const organizacaoId = req.usuario?.organizacao_id;

    const ok = await agendaService.arquivarEvento(id, organizacaoId);
    if (!ok)
      return res
        .status(404)
        .json({ sucesso: false, erro: "Evento não encontrado" });

    await registrarAuditoria({
      organizacaoId,
      usuarioId: req.usuario?.id || null,
      usuarioNome: req.usuario?.nome || null,
      acao: "evento_arquivado",
      entidade: "agenda",
      entidadeId: id,
      descricao: `Arquivou evento #${id}`,
    });
    return res
      .status(200)
      .json({ sucesso: true, mensagem: "Evento arquivado com sucesso" });
  } catch (error) {
    logger.error("[agendaController] Erro ao arquivar evento", error);
    return res
      .status(500)
      .json({ sucesso: false, erro: "Erro ao arquivar evento" });
  }
}

/* -------------------------------------------------------------------------- */
module.exports = {
  listarEventos,
  criarEvento,
  criarEventoComImagem,
  excluirEvento,
  atualizarEvento,
  atualizarStatus,
  arquivarEvento,
};
