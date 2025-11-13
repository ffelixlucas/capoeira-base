// 📁 src/hooks/useTurmas.js
import { useState, useEffect, useCallback } from "react";
import { listarTurmas } from "../services/turmaService";
import { toast } from "react-toastify";
import { logger } from "../utils/logger";

/**
 * 🎯 Hook: useTurmas
 * Gerencia listagem de turmas, estado de carregamento, erro e busca local.
 */
export function useTurmas() {
  const [turmas, setTurmas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [busca, setBusca] = useState("");
  const [buscaDebounced, setBuscaDebounced] = useState("");

  /* -------------------------------------------------------------------------- */
  /* ⏳ Debounce da busca (300ms)                                               */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const handler = setTimeout(() => setBuscaDebounced(busca), 300);
    return () => clearTimeout(handler);
  }, [busca]);

  /* -------------------------------------------------------------------------- */
  /* 🔄 Carregar turmas                                                        */
  /* -------------------------------------------------------------------------- */
  const carregarTurmas = useCallback(async () => {
    setCarregando(true);
    try {
      logger.debug("[useTurmas] Carregando turmas...");
      const lista = await listarTurmas();

      // 🔍 Filtro local (nome, faixa etária, categoria)
      const filtradas = Array.isArray(lista)
        ? lista.filter((t) => {
            if (!buscaDebounced) return true;
            const termo = buscaDebounced.toLowerCase();
            return (
              t.nome?.toLowerCase().includes(termo) ||
              t.faixa_etaria?.toLowerCase().includes(termo) ||
              t.nome_instrutor?.toLowerCase().includes(termo) ||
              t.nome_categoria?.toLowerCase().includes(termo)
            );
          })
        : [];

      setTurmas(filtradas);
      setErro(null);
      logger.debug("[useTurmas] Turmas carregadas", { total: filtradas.length });
    } catch (err) {
      logger.error("[useTurmas] Erro ao carregar turmas", { erro: err.message });
      setErro("Erro ao carregar turmas");
      toast.error("Erro ao carregar turmas");
    } finally {
      setCarregando(false);
    }
  }, [buscaDebounced]);

  /* -------------------------------------------------------------------------- */
  /* 🚀 Auto carregar na montagem e quando a busca muda                         */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    carregarTurmas();
  }, [carregarTurmas]);

  /* -------------------------------------------------------------------------- */
  /* 🔁 Retorno padronizado                                                    */
  /* -------------------------------------------------------------------------- */
  return {
    turmas,
    carregando,
    erro,
    busca,
    setBusca,
    carregarTurmas,
  };
}
