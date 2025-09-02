const agendaService = require("./agendaService");
const logger = require("../../utils/logger");

const formatarDataHora = (data) => {
  if (!data) return { data: null, horario: null };
  const d = new Date(data);
  return {
    data: d.toLocaleDateString("pt-BR"),
    horario: d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

const listarEventos = async (req, res) => {
  try {
    const { status, situacao } = req.query;
    const eventos = await agendaService.listarEventos(status, situacao);

    const eventosFormatados = eventos.map((evento) => {
      const raw =
        typeof evento.data_inicio === "string"
          ? evento.data_inicio.replace(" ", "T")
          : evento.data_inicio?.toISOString?.() ?? null;

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
    logger.error("❌ Erro ao listar eventos:", error);
    return res
      .status(500)
      .json({ sucesso: false, erro: "Erro ao listar eventos." });
  }
};

const criarEvento = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id || null; // via verifyToken
    const idCriado = await agendaService.criarEvento(req.body, usuarioId);
    res
      .status(201)
      .json({ mensagem: "Evento criado com sucesso.", id: idCriado });
  } catch (error) {
    logger.error("❌ Erro ao criar evento:", error);
    res.status(400).json({ erro: error.message });
  }
};

const criarEventoComImagem = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id || null;
    const imagem = req.file;
    const dados = {
      ...req.body,
      possui_camiseta: parseInt(req.body.possui_camiseta) === 1 ? 1 : 0,
    };

    logger.log("📦 Imagem recebida:", imagem?.originalname);
    logger.log("📝 Dados recebidos:", dados);

    const resultado = await agendaService.processarUploadEvento(
      imagem,
      dados,
      usuarioId
    );

    return res.status(201).json({
      mensagem: "Evento criado com imagem com sucesso.",
      id: resultado.id,
      imagem_url: resultado.imagem_url,
    });
  } catch (error) {
    logger.error("❌ Erro ao criar evento com imagem:", error);
    return res.status(500).json({ erro: "Erro ao criar evento com imagem." });
  }
};

const excluirEvento = async (req, res) => {
  try {
    const sucesso = await agendaService.excluirEvento(req.params.id);
    if (sucesso) {
      res.json({ mensagem: "Evento excluído com sucesso." });
    } else {
      res.status(404).json({ erro: "Evento não encontrado." });
    }
  } catch (error) {
    logger.error("❌ Erro ao excluir evento:", error);
    res.status(500).json({ erro: "Erro ao excluir evento." });
  }
};

async function atualizarEvento(req, res) {
  const { id } = req.params;
  const dados = {
    ...req.body,
    possui_camiseta: parseInt(req.body.possui_camiseta) === 1 ? 1 : 0,
  };

  try {
    await agendaService.atualizarEvento(id, dados);
    res.status(200).json({ message: "Evento atualizado com sucesso" });
  } catch (error) {
    logger.error("❌ Erro ao atualizar evento:", error);
    res.status(500).json({ message: "Erro ao atualizar evento" });
  }
}

const atualizarStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["ativo", "concluido", "cancelado"].includes(status)) {
    return res.status(400).json({ sucesso: false, erro: "Status inválido" });
  }

  try {
    const ok = await agendaService.atualizarStatus(id, status);
    if (!ok) {
      return res
        .status(404)
        .json({ sucesso: false, erro: "Evento não encontrado" });
    }
    return res
      .status(200)
      .json({ sucesso: true, mensagem: `Evento marcado como ${status}` });
  } catch (error) {
    logger.error("❌ Erro ao atualizar status do evento:", error);
    return res.status(500).json({ sucesso: false, erro: error.message });
  }
};

const arquivarEvento = async (req, res) => {
  try {
    const { id } = req.params;
    const ok = await agendaService.arquivarEvento(id);
    if (!ok) {
      return res
        .status(404)
        .json({ sucesso: false, erro: "Evento não encontrado" });
    }
    return res
      .status(200)
      .json({ sucesso: true, mensagem: "Evento arquivado com sucesso" });
  } catch (error) {
    logger.error("❌ Erro ao arquivar evento:", error);
    return res
      .status(500)
      .json({ sucesso: false, erro: "Erro ao arquivar evento" });
  }
};

module.exports = {
  listarEventos,
  criarEvento,
  criarEventoComImagem,
  excluirEvento,
  atualizarEvento,
  atualizarStatus,
  arquivarEvento,
};
