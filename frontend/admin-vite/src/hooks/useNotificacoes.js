import { useState, useEffect, useCallback } from "react";
import {
  listarNotificacoes,
  adicionarNotificacao,
  removerNotificacao,
} from "../services/notificacaoService";
import { logger } from "../utils/logger";

export function useNotificacoes(grupoId, tipoInicial = "matricula") {
  const [tipo, setTipo] = useState(tipoInicial);
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    if (!grupoId) return;
    setLoading(true);
    setErro(null);
    try {
      const data = await listarNotificacoes(grupoId, tipo);
      setLista(data);
    } catch (err) {
      setErro("Erro ao carregar notificações");
      logger.error("[useNotificacoes] Erro ao listar:", err);
    } finally {
      setLoading(false);
    }
  }, [grupoId, tipo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const adicionar = async (email) => {
    try {
      await adicionarNotificacao({ grupoId, tipo, email });
      await carregar();
    } catch (err) {
      logger.error("[useNotificacoes] Erro ao adicionar:", err);
      throw err;
    }
  };

  const remover = async (id) => {
    try {
      await removerNotificacao(id);
      await carregar();
    } catch (err) {
      logger.error("[useNotificacoes] Erro ao remover:", err);
      throw err;
    }
  };

  return {
    lista,
    tipo,
    setTipo,
    loading,
    erro,
    adicionar,
    remover,
    recarregar: carregar,
  };
}
