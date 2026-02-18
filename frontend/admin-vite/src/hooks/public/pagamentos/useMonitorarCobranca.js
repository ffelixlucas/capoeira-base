import { useEffect } from "react";
import api from "../../../services/api";

export function useMonitorarCobranca(
  slug,
  cobrancaId,
  onSucesso,
  onErro
) {
  useEffect(() => {
    if (!slug || !cobrancaId) return;

    const interval = setInterval(async () => {
      try {
        const { data } = await api.get(
          `/pagamentos/${slug}/${cobrancaId}`
        );

        const cobranca = data.data;
        console.log("STATUS ATUAL COBRANÇA:", cobranca.status);
        console.log("COBRANÇA COMPLETA:", cobranca);


        if (cobranca.status === "pago") {
          clearInterval(interval);
        
          // 🔎 Buscar pedido completo
          const { data: pedidoResponse } = await api.get(
            `/pedidos/${cobranca.entidade_id}`
          );
        
          const pedidoCompleto = pedidoResponse.data;
        
          onSucesso && onSucesso({
            cobranca,
            pedido: pedidoCompleto,
          });
        
          return; // importante para não continuar executando
        }
        

        if (["rejeitado", "cancelado"].includes(cobranca.status)) {
          clearInterval(interval);
          onErro && onErro(cobranca);
        }
      } catch (err) {
        console.error("Erro ao monitorar cobrança:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [slug, cobrancaId]);
}
