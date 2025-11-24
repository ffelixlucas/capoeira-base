import { useEffect, useState } from "react";
import {
  buscarCategorias,
  criarCategoria,
  atualizarCategoria,
  removerCategoria,
} from "../services/categoriasService";

import {
  buscarGraduacoesPorCategoria,
  criarGraduacao,
  atualizarGraduacao,
  removerGraduacao,
} from "../services/graduacoesService";

import { logger } from "../utils/logger";

export function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // -------------------------------------------------------------
  // 🔄 CARREGAR CATEGORIAS + GRADUAÇÕES
  // -------------------------------------------------------------
  async function carregarTudo() {
    try {
      setCarregando(true);
      const lista = await buscarCategorias();

      // Carregar graduações por categoria
      const listaComGraduacoes = await Promise.all(
        lista.map(async (cat) => {
          const graduacoes = await buscarGraduacoesPorCategoria(cat.id);
          return { ...cat, graduacoes };
        })
      );

      setCategorias(listaComGraduacoes);
    } catch (err) {
      logger.error("[useCategorias] Erro ao carregarTudo", err);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarTudo();
  }, []);

  // -------------------------------------------------------------
  // ➕ Criar categoria
  // -------------------------------------------------------------
  async function adicionarCategoria(nome) {
    await criarCategoria(nome);
    await carregarTudo();
  }

  // -------------------------------------------------------------
  // ✏️ Editar categoria
  // -------------------------------------------------------------
  async function editarCategoria(id, nome) {
    await atualizarCategoria(id, nome);
    await carregarTudo();
  }

  // -------------------------------------------------------------
  // ❌ Remover categoria
  // -------------------------------------------------------------
  async function excluirCategoria(id) {
    await removerCategoria(id);
    await carregarTudo();
  }

  // -------------------------------------------------------------
  // ➕ Criar graduação
  // -------------------------------------------------------------
  async function adicionarGraduacao(categoriaId, nome, ordem) {
    await criarGraduacao({ categoriaId, nome, ordem });
    await carregarTudo();
  }

  // -------------------------------------------------------------
  // ✏️ Editar graduação
  // -------------------------------------------------------------
  async function editarGraduacaoItem(id, payload) {
    await atualizarGraduacao(id, payload);
    await carregarTudo();
  }

  // -------------------------------------------------------------
  // ❌ Remover graduação
  // -------------------------------------------------------------
  async function excluirGraduacao(id) {
    await removerGraduacao(id);
    await carregarTudo();
  }

  return {
    categorias,
    carregando,

    adicionarCategoria,
    editarCategoria,
    excluirCategoria,

    adicionarGraduacao,
    editarGraduacao: editarGraduacaoItem,
    excluirGraduacao,
  };
}
