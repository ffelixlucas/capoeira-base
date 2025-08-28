// backend/modules/inscricoes/inscricoesService.js
const inscricoesRepository = require("./inscricoesRepository");
const { registrarLogTransacao } = require("./logsRepository");
const { enviarEmailExtorno } = require("../../services/emailService");
const axios = require("axios");

async function extornarPagamentoService(id) {
  console.log("🔎 Iniciando extorno para inscrição:", id);

  const inscricao = await inscricoesRepository.buscarInscricaoComEvento(id);
  if (!inscricao || !inscricao.pagamento_id) {
    console.error("❌ Inscrição não encontrada ou sem pagamento vinculado:", inscricao);
    throw new Error("Inscrição não encontrada ou sem pagamento vinculado");
  }
  console.log("📌 Inscrição encontrada:", {
    id: inscricao.id,
    status: inscricao.status,
    pagamento_id: inscricao.pagamento_id,
  });

  try {
    console.log("➡️ Chamando Mercado Pago refund API...");
    const { data: result } = await axios.post(
      `https://api.mercadopago.com/v1/payments/${inscricao.pagamento_id}/refunds`,
      {}, // body vazio = estorno total. Para parcial: { amount: 50.0 }
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    );

    console.log("✅ Resposta do Mercado Pago:", result);

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

    console.log("💾 Atualizando inscrição no banco com:", refundInfo);
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

    console.log("🎉 Extorno concluído com sucesso!");
    return { id, ...refundInfo };
  } catch (err) {
    console.error("❌ Erro ao extornar no Mercado Pago:", err?.response?.data || err);

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
