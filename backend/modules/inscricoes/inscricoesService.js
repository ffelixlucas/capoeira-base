// backend/modules/inscricoes/inscricoesService.js
const inscricoesRepository = require("./inscricoesRepository");
const { registrarLogTransacao } = require("./logsRepository");
const { enviarEmailExtorno } = require("../../services/emailService");
const axios = require("axios");
const logger = require("../../utils/logger");

async function extornarPagamentoService(id) {
  logger.log("🔎 Iniciando extorno para inscrição:", id);

  const inscricao = await inscricoesRepository.buscarInscricaoComEvento(id);
  if (!inscricao || !inscricao.pagamento_id) {
    logger.error("❌ Inscrição não encontrada ou sem pagamento vinculado:", inscricao);
    throw new Error("Inscrição não encontrada ou sem pagamento vinculado");
  }
  logger.log("📌 Inscrição encontrada:", {
    id: inscricao.id,
    status: inscricao.status,
    pagamento_id: inscricao.pagamento_id,
  });

  try {
    logger.log("➡️ Chamando Mercado Pago refund API...");
    const { data: result } = await axios.post(
      `https://api.mercadopago.com/v1/payments/${inscricao.pagamento_id}/refunds`,
      {}, // body vazio = estorno total
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          "X-Idempotency-Key": `refund-${inscricao.id}`, // 👈 chave única por inscrição
        },
      }
    );

    logger.log("✅ Resposta do Mercado Pago:", result);

    const refundId = result.id;
    const refundAmount = result.amount;

    if (!refundId) {
      throw new Error("Extorno não confirmado pelo Mercado Pago");
    }

    const refundInfo = {
      refund_id: refundId,
      refund_valor: refundAmount,
      status: "extornado",
    };

    logger.log("💾 Atualizando inscrição no banco com:", refundInfo);
    await inscricoesRepository.atualizarInscricaoParaExtornado(id, refundInfo);
    await registrarLogTransacao(id, "extorno_realizado", "sucesso", refundInfo);

    // E-mail de extorno
    await enviarEmailExtorno({
      ...inscricao,
      refund_valor: refundAmount,
      codigo_inscricao: inscricao.codigo_inscricao,
      evento: {
        titulo: inscricao.titulo,
        local: inscricao.local,
        endereco: inscricao.endereco,
        data_inicio: inscricao.data_inicio,
        data_fim: inscricao.data_fim,
      },
    });

    logger.log("🎉 Extorno concluído com sucesso!");
    return { id, ...refundInfo };
  } catch (err) {
    logger.error("❌ Erro ao extornar no Mercado Pago:", err?.response?.data || err);
  
    // 🔎 Fallback: verificar se o pagamento já foi estornado
    try {
      const { data: pagamento } = await axios.get(
        `https://api.mercadopago.com/v1/payments/${inscricao.pagamento_id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
          },
        }
      );
  
      if (pagamento.status === "refunded") {
        const refundInfo = {
          refund_id: pagamento.id,
          refund_valor: pagamento.transaction_amount,
          status: "extornado",
        };
  
        await inscricoesRepository.atualizarInscricaoParaExtornado(id, refundInfo);
        await registrarLogTransacao(id, "extorno_realizado", "sucesso_fallback", refundInfo);
  
        await enviarEmailExtorno({
          ...inscricao,
          refund_valor: refundInfo.refund_valor,
          codigo_inscricao: inscricao.codigo_inscricao,
          evento: {
            titulo: inscricao.titulo,
            local: inscricao.local,
            endereco: inscricao.endereco,
            data_inicio: inscricao.data_inicio,
            data_fim: inscricao.data_fim,
          },
        });
  
        logger.log("🎉 Extorno confirmado via fallback!");
        return { id, ...refundInfo };
      }
    } catch (checkErr) {
      logger.error("❌ Falha ao verificar status do pagamento no fallback:", checkErr);
    }
  
    // Se chegou aqui, realmente não deu certo
    await registrarLogTransacao(id, "erro_extorno", "erro", {
      message: err.message,
      detalhes: err.response?.data || null,
    });
    throw err;
  }
  
}


// Lista inscritos de um evento
async function listarPorEvento(eventoId, busca) {
  return await inscricoesRepository.listarPorEvento(eventoId, busca);
}

// Busca inscrição pelo ID
async function buscarPorId(id) {
  return await inscricoesRepository.buscarPorId(id);
}

// Cria inscrição manual (painel)
async function criarInscricao(dados) {
  return await inscricoesRepository.criarInscricao(dados);
}

// Atualiza inscrição
async function atualizarInscricao(id, dados) {
  return await inscricoesRepository.atualizarInscricao(id, dados);
}

// Deleta inscrição
async function deletarInscricao(id) {
  return await inscricoesRepository.deletarInscricao(id);
}

// Extorna pagamento

module.exports = {
  listarPorEvento,
  buscarPorId,
  criarInscricao,
  atualizarInscricao,
  deletarInscricao,
  extornarPagamentoService,
};
