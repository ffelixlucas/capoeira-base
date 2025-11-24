// 📁 src/hooks/useEquipe.js
import { useEffect, useState, useCallback } from "react";
import { listarEquipe } from "../services/equipeService";
import { logger } from "../utils/logger";

/**
 * 🧠 Hook: useEquipe
 * Gerencia estado da equipe (listagem, loading, erro, busca)
 * com padrão Capoeira Base v2
 */
export function useEquipe() {
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState("");
  const [debouncedBusca, setDebouncedBusca] = useState("");

  /* -------------------------------------------------------------------------- */
  /* ⏳ Debounce da busca (300ms)                                               */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedBusca(busca), 300);
    return () => clearTimeout(handler);
  }, [busca]);

  /* -------------------------------------------------------------------------- */
  /* 🔄 Carregar equipe                                                         */
  /* -------------------------------------------------------------------------- */
  const carregarEquipe = useCallback(async () => {
    setLoading(true);
    try {
      logger.debug("[useEquipe] Carregando equipe...");
      const dados = await listarEquipe();

      // 🔍 Aplicar filtro de busca local (nome, email, telefone)
      const resultado = Array.isArray(dados)
        ? dados.filter((membro) => {
            if (!debouncedBusca) return true;
            const termo = debouncedBusca.toLowerCase();
            return (
              membro.nome?.toLowerCase().includes(termo) ||
              membro.email?.toLowerCase().includes(termo) ||
              membro.telefone?.toLowerCase().includes(termo)
            );
          })
        : [];

      setMembros(resultado);
      setErro(null);

      logger.debug("[useEquipe] Equipe carregada com sucesso", {
        total: resultado.length,
      });
    } catch (err) {
      logger.error("[useEquipe] Erro ao carregar equipe", { erro: err.message });
      setErro("Erro ao carregar equipe");
      setMembros([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedBusca]);

  /* -------------------------------------------------------------------------- */
  /* 🚀 Auto-carregamento na montagem e quando a busca muda                     */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    carregarEquipe();
  }, [carregarEquipe]);

  /* -------------------------------------------------------------------------- */
  /* 🔁 Retorno padronizado                                                     */
  /* -------------------------------------------------------------------------- */
  return {
    membros,
    loading,
    erro,
    busca,
    setBusca,
    carregarEquipe,
  };
}
