import { useState, useEffect, useCallback } from "react";
import {
  listarNotificacoes,
  adicionarNotificacao,
  removerNotificacao,
} from "../services/notificacaoService";
import { logger } from "../utils/logger";
import { useAuth } from "../contexts/AuthContext";

/**
 * Hook para gerenciar notificações de e-mail (multi-organização)
 */
export function useNotificacoes(grupoId, tipoInicial = "matricula") {
  const { usuario } = useAuth();
  const organizacaoId = usuario?.organizacao_id;

  const [tipo, setTipo] = useState(tipoInicial);
  const [lista, setLista] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const carregar = useCallback(async () => {
    if (!grupoId || !organizacaoId) return;
    setLoading(true);
    setErro(null);

    try {
      const res = await listarNotificacoes(grupoId, tipo);
      const data = res?.data ?? res; // compatibilidade
      setLista(data);
      logger.debug(
        `[useNotificacoes] org ${organizacaoId} - ${data.length} registros (${tipo})`
      );
    } catch (err) {
      setErro("Erro ao carregar notificações");
      logger.error("[useNotificacoes] Erro ao listar:", err);
    } finally {
      setLoading(false);
    }
  }, [grupoId, organizacaoId, tipo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const adicionar = async (email) => {
    try {
      await adicionarNotificacao({ organizacaoId, grupoId, tipo, email });
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
