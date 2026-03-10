// components/public/pagamento/CartaoPagamento.jsx
import React, { useState, useEffect } from "react";
import { CardPayment } from "@mercadopago/sdk-react";
import { initMP } from "../../../utils/mercadoPago";
import { logger } from "../../../utils/logger";
import { usePagamentoCartao } from "../../../hooks/public/usePagamentoCartao";
import ModalErroPagamento from "../ModalErroPagamento";
import ModalPagamentoPendente from "../pagamento/ModalPagamentoPendente";
import { useParams } from "react-router-dom";
import { buscarMercadoPagoPublico } from "../../../services/organizacaoConfigService";

// Inicializa SDK
initMP();

export default function CartaoPagamento({
  evento,
  form,
  valores, 
  setDadosPagamento,
  onSucesso,
}) {
  const { slug } = useParams();
  const { pagar, loading, erro, resposta } = usePagamentoCartao();
  const [modalErro, setModalErro] = useState(false);
  const [modalPendente, setModalPendente] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarPublicKey() {
      if (!slug) return;

      try {
        const data = await buscarMercadoPagoPublico(slug);
        if (!ativo) return;

        if (data?.public_key) {
          initMP(data.public_key);
        }
      } catch (error) {
        logger.warn("[CartaoPagamento] Nao foi possivel carregar public key da organizacao", error);
      }
    }

    carregarPublicKey();

    return () => {
      ativo = false;
    };
  }, [slug]);

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
        transaction_amount: valores?.cartao || evento?.valor, // ✅ valor do backend
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
        categoria_id: form.categoria_id || null, // ✅ ID, não string
        graduacao_id: form.graduacao_id || null, // ✅ ID, não string
        payer: {
          email: form.email,
          first_name: firstName,
          last_name: lastName,
          identification: { type: "CPF", number: form.cpf.replace(/\D/g, "") },
          phone: { area_code: areaCode, number: number },
        },
        metadata: {
          nome: form.nome,
          cpf: form.cpf,
          evento_id: evento.id,
          categoria_id: form.categoria_id,
          graduacao_id: form.graduacao_id,
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
      setDadosPagamento(resposta);
      onSucesso?.(resposta);
    }
  }, [resposta]);

  return (
    <div className="p-4">
      <CardPayment
        initialization={{ amount: valores?.cartao || evento?.valor }} // ✅ valor do backend
        locale="pt-BR"
        onSubmit={handleSubmit}
        onError={(err) => logger.error("[CartaoPagamento] erro no Brick:", err)}
      />

      {loading && (
        <p className="mt-4 text-blue-600">🔄 Processando pagamento...</p>
      )}

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
