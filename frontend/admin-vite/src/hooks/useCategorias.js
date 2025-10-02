import { useState, useEffect } from "react";
import { buscarCategorias, buscarGraduacoesPorCategoria } from "../services/categoriasService";
import { logger } from "../utils/logger";

export function useCategorias() {
  const [categorias, setCategorias] = useState([]);
  const [graduacoes, setGraduacoes] = useState([]);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);
        const lista = await buscarCategorias();
        setCategorias(lista);
      } catch (err) {
        if (import.meta.env.DEV) logger.error("Erro ao carregar categorias:", err);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  async function carregarGraduacoes(categoriaId) {
    try {
      setCarregando(true);
      const lista = await buscarGraduacoesPorCategoria(categoriaId);
      setGraduacoes(lista);
    } catch (err) {
      if (import.meta.env.DEV) logger.error("Erro ao carregar graduações:", err);
    } finally {
      setCarregando(false);
    }
  }

  return { categorias, graduacoes, carregarGraduacoes, carregando };
}
