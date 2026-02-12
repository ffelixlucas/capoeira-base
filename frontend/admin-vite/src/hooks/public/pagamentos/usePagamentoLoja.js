import { useState } from "react";
import {
  criarPedido,
  criarCobranca,
  gerarPix,
} from "../../../services/public/pagamentos/pagamentosLojaService";

export function usePagamentoLoja() {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  async function pagarComPix({ slug, cliente, itens }) {
    try {
      setLoading(true);
      setErro(null);

      // 1️⃣ Criar pedido
      const pedidoResponse = await criarPedido(slug, {
        ...cliente,
        itens,
      });

      if (!pedidoResponse?.success) {
        throw new Error("Erro ao criar pedido");
      }

      const { pedido_id, valor_total } = pedidoResponse;

      // 2️⃣ Criar cobrança
      const cobrancaResponse = await criarCobranca(slug, {
        origem: "loja",
        entidade_id: pedido_id,
        nome_pagador: cliente.nome,
        cpf: cliente.cpf,
        telefone: cliente.telefone,
        email: cliente.email,
        valor_total,
      });

      if (!cobrancaResponse?.success) {
        throw new Error("Erro ao criar cobrança");
      }

      const cobrancaId = cobrancaResponse.data.cobranca_id;

      // 3️⃣ Gerar PIX
      const pixResponse = await gerarPix(slug, cobrancaId);

      if (!pixResponse?.success) {
        throw new Error("Erro ao gerar PIX");
      }

      return pixResponse.data;

    } catch (error) {
      const mensagem =
        error?.response?.data?.message || error.message || "Erro no pagamento";

      setErro(mensagem);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  return {
    pagarComPix,
    loading,
    erro,
  };
}
