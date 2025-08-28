// backend/modules/inscricoes/inscricoesService.js
const inscricoesRepository = require("./inscricoesRepository");
const { registrarLogTransacao } = require("./logsRepository");
const { enviarEmailExtorno } = require("../../services/emailService");
const { MercadoPagoConfig, Payment } = require("mercadopago");

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});
const payment = new Payment(client);




// Extorna pagamento


async function extornarPagamentoService(id) {
  console.log("🔎 Iniciando extorno para inscrição:", id);

  // Buscar inscrição com evento (precisamos do evento para o e-mail)
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
    // Criar estorno no Mercado Pago
    console.log("➡️ Chamando Mercado Pago refund...");
    const result = await payment.refund({ id: inscricao.pagamento_id });
    console.log("✅ Resposta do Mercado Pago:", result);

    // Blindagem para diferentes formatos de retorno
    const statusMP = result?.status ?? result?.body?.status;
    const refundId = result?.id ?? result?.body?.id;
    const refundAmount = result?.amount ?? result?.body?.amount;

    if (statusMP !== "approved") {
      console.error("⚠️ Extorno não confirmado pelo Mercado Pago:", result);
      throw new Error("Extorno não confirmado pelo Mercado Pago");
    }

    // Atualizar banco
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
      codigo_inscricao: inscricao.codigo_inscricao, // se já existe no objeto
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
