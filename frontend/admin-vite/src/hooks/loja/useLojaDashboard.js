import { useEffect, useState } from "react";
import { buscarEstatisticasLoja } from "../../services/lojaService";

export default function useLojaDashboard() {
  const [estatisticas, setEstatisticas] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      try {
        const dados = await buscarEstatisticasLoja();
        if (!ativo) return;
        setEstatisticas(dados);
      } catch (err) {
        console.error("Erro ao buscar estatísticas da loja:", err);
      } finally {
        if (ativo) setLoading(false);
      }
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  return { estatisticas, loading };
}
