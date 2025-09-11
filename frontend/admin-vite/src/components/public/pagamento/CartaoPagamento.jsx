// components/public/pagamento/CartaoPagamento.jsx
import React, { useState, useEffect } from "react";
import { CardPayment } from "@mercadopago/sdk-react";
import { initMP } from "../../../utils/mercadoPago";
import { logger } from "../../../utils/logger";
import { usePagamentoCartao } from "../../../hooks/public/usePagamentoCartao";
import ModalErroPagamento from "../ModalErroPagamento";
import ModalPagamentoPendente from "../pagamento/ModalPagamentoPendente";

// Inicializa SDK
initMP();

export default function CartaoPagamento({
  evento,
  form,
  setDadosPagamento,
  onSucesso,
}) {
  const { pagar, loading, erro, resposta } = usePagamentoCartao();
  const [modalErro, setModalErro] = useState(false);
  const [modalPendente, setModalPendente] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      logger.log("[CartaoPagamento] dados recebidos do Brick:", formData);

      const [firstName, ...rest] = form.nome.trim().split(" ");
      const lastName = rest.join(" ") || "-";

      const tel = form.telefone.replace(/\D/g, "");
      const areaCode = tel.substring(0, 2);
      const number = tel.substring(2);

      const payload = {
        token: formData.token,
        installments: formData.installments,
        payment_method_id: formData.payment_method_id,
        transaction_amount: parseFloat(evento?.valor || 0),
        total_amount: evento?.valor,
        description: `Inscrição no evento ${evento?.titulo}`,
        forma_pagamento: "cartao",
        evento_id: evento?.id,
        valor: evento?.valor,
        nome: form.nome,
        apelido: form.apelido,
        data_nascimento: form.data_nascimento,
        email: form.email,
        telefone: form.telefone,
        cpf: form.cpf,
        aceite_lgpd: form.aceite_lgpd ? 1 : 0,
        autorizacao_imagem: form.autorizacao_imagem ? 1 : 0,
        autorizacao_participacao: 1,
        aceite_responsabilidade: 1,
        responsavel_nome: form.responsavel_nome || null,
        responsavel_documento: form.responsavel_documento || null,
        responsavel_contato: form.responsavel_contato || null,
        responsavel_parentesco: form.responsavel_parentesco || null,
        tamanho_camiseta: form.tamanho_camiseta || null,
        categoria: form.categoria || null,
        graduacao: form.graduacao || null,
        payer: {
          email: form.email,
          first_name: firstName,
          last_name: lastName,
          identification: { type: "CPF", number: form.cpf.replace(/\D/g, "") },
          phone: { area_code: areaCode, number: number },
        },
        metadata: {
          evento_id: evento?.id,
          apelido: form.apelido,
          data_nascimento: form.data_nascimento,
          categoria: form.categoria || null,
          graduacao: form.graduacao || null,
        },
      };

      logger.log("[CartaoPagamento] payload montado:", payload);

      const resultado = await pagar(payload);
      logger.log("[CartaoPagamento] resultado do backend:", resultado);

      if (resultado?.status === "rejected") {
        setModalErro(true);
      } else if (resultado?.status === "pendente") {
        setModalPendente(true); // 👉 abre o novo modal
      }
    } catch (err) {
      logger.error("[CartaoPagamento] erro no handleSubmit:", err);
      setModalErro(true);
    }
  };

  // ✅ abre modal de confirmação assim que aprovado
  useEffect(() => {
    if (resposta?.status === "pago") {
      setDadosPagamento(resposta); // agora já vem completo (com 'evento')
      onSucesso?.(resposta); // isso abre o ModalConfirmacaoPagamento
    }
  }, [resposta]);

  return (
    <div className="p-4">
      <CardPayment
        initialization={{ amount: parseFloat(evento?.valor || 0) }}
        locale="pt-BR"
        onSubmit={handleSubmit}
        onError={(err) => logger.error("[CartaoPagamento] erro no Brick:", err)}
      />

      {loading && (
        <p className="mt-4 text-blue-600">🔄 Processando pagamento...</p>
      )}

      {/* Só erro continua aqui */}
      <ModalErroPagamento
        isOpen={modalErro}
        onClose={() => setModalErro(false)}
        erro={erro || resposta}
      />
      <ModalPagamentoPendente
        isOpen={modalPendente}
        onClose={() => setModalPendente(false)}
        dados={resposta}
      />
    </div>
  );
}
