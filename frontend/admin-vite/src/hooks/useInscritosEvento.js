// hooks/useInscritosEvento.js
import { useState, useEffect } from "react";
import { buscarInscritosPorEvento, buscarInscritoPorId } from "../services/inscricaoService";
import { logger } from "../utils/logger";

export function useInscritosEvento(eventoId, busca) {
  const [evento, setEvento] = useState(null);
  const [inscritos, setInscritos] = useState([]);
  const [resumoCamisetas, setResumoCamisetas] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);
  const [inscritoSelecionado, setInscritoSelecionado] = useState(null);

  useEffect(() => {
    carregarInscritos();
  }, [eventoId, busca]);

  async function carregarInscritos() {
    setCarregando(true);
    try {
      const dados = await buscarInscritosPorEvento(eventoId, busca);
      setEvento(dados.evento);
      setInscritos(dados.inscritos);
      setResumoCamisetas(dados.resumo_camisetas || []);
    } catch (err) {
      if (import.meta.env.DEV) logger.error("Erro ao carregar inscritos:", err);
    } finally {
      setCarregando(false);
    }
  }

  async function verFichaCompleta(inscrito) {
    try {
      const dadosCompletos = await buscarInscritoPorId(inscrito.id);
      setInscritoSelecionado(dadosCompletos);
      setModalAberto(true);
    } catch (err) {
      if (import.meta.env.DEV) logger.error("Erro ao buscar inscrito:", err);
    }
  }

  async function atualizarInscritoNaLista(inscritoAtualizado) {
    if (inscritoAtualizado.status === "extornado") {
      await carregarInscritos();
    } else {
      setInscritos((lista) =>
        lista.map((i) => i.id === inscritoAtualizado.id ? { ...i, ...inscritoAtualizado } : i)
      );
      setInscritoSelecionado((atual) =>
        atual && atual.id === inscritoAtualizado.id ? { ...atual, ...inscritoAtualizado } : atual
      );
    }
  }

  return {
    evento,
    inscritos,
    resumoCamisetas,
    carregando,
    modalAberto,
    inscritoSelecionado,
    setModalAberto,
    verFichaCompleta,
    atualizarInscritoNaLista,
  };
}
