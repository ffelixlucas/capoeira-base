import { useState, useEffect } from "react";
import {
  listarImagens,
  uploadImagem,
  deletarImagem,
  atualizarNoticia,
  atualizarOrdem,
} from "../services/galeriaService";
import { toast } from "react-toastify";
import { logger } from "../utils/logger";

export function useGaleria() {
  const [arquivo, setArquivo] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [legenda, setLegenda] = useState("");
  const [imagens, setImagens] = useState([]);
  const [loading, setLoading] = useState(false);

  const carregarImagens = async () => {
    try {
      const data = await listarImagens();
      const ordenadas = data.sort((a, b) => {
        const ordemA = Number.isFinite(Number(a.ordem)) ? Number(a.ordem) : Number.MAX_SAFE_INTEGER;
        const ordemB = Number.isFinite(Number(b.ordem)) ? Number(b.ordem) : Number.MAX_SAFE_INTEGER;
        if (ordemA !== ordemB) return ordemA - ordemB;

        const dateA = new Date(a.criado_em || 0).getTime();
        const dateB = new Date(b.criado_em || 0).getTime();
        return dateB - dateA;
      });
      setImagens(ordenadas);
    } catch (error) {
      logger.error("Erro ao carregar notícias:", error);
      toast.error("Erro ao carregar notícias.");
    }
  };

  useEffect(() => {
    carregarImagens();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!arquivo) {
      toast.error("Selecione uma imagem de capa para publicar.");
      return;
    }

    const tituloTrim = titulo.trim();
    if (!tituloTrim) {
      toast.error("Título é obrigatório.");
      return;
    }

    if (tituloTrim.length > 160) {
      toast.error("Título deve ter no máximo 160 caracteres.");
      return;
    }

    if (!legenda.trim()) {
      toast.error("Resumo/conteúdo é obrigatório.");
      return;
    }

    const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png"];
    const tamanhoMaximo = 5 * 1024 * 1024;

    if (!tiposPermitidos.includes(arquivo.type)) {
      toast.error("Formato inválido. Envie JPG ou PNG.");
      return;
    }

    if (arquivo.size > tamanhoMaximo) {
      toast.error("Arquivo muito grande. Limite de 5MB.");
      return;
    }

    const formData = new FormData();
    formData.append("imagem", arquivo);
    formData.append("titulo", tituloTrim);
    formData.append("legenda", legenda.trim());

    setLoading(true);
    try {
      await uploadImagem(formData);
      toast.success("Notícia publicada com sucesso!");
      setArquivo(null);
      setTitulo("");
      setLegenda("");
      await carregarImagens();
    } catch (error) {
      logger.error("Erro ao publicar notícia:", error);
      const backendMsg = error?.response?.data?.erro || error?.response?.data?.message;
      toast.error(backendMsg || "Erro ao publicar notícia.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverImagem = async (id) => {
    const confirmar = window.confirm("Deseja realmente excluir esta notícia?");
    if (!confirmar) return;

    setLoading(true);
    try {
      await deletarImagem(id);
      setImagens((prev) => prev.filter((img) => img.id !== id));
      toast.success("Notícia removida com sucesso.");
    } catch (error) {
      logger.error("Erro ao remover notícia:", error);
      toast.error("Erro ao remover notícia.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditarNoticia = async (id, { titulo: novoTitulo, legenda: novaLegenda }) => {
    const tituloTrim = String(novoTitulo || "").trim();
    const legendaTrim = String(novaLegenda || "").trim();

    if (!tituloTrim) {
      toast.error("Título é obrigatório.");
      return false;
    }

    if (tituloTrim.length > 160) {
      toast.error("Título deve ter no máximo 160 caracteres.");
      return false;
    }

    if (!legendaTrim) {
      toast.error("Conteúdo é obrigatório.");
      return false;
    }

    setLoading(true);
    try {
      await atualizarNoticia(id, { titulo: tituloTrim, legenda: legendaTrim });
      setImagens((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, titulo: tituloTrim, legenda: legendaTrim } : img
        )
      );
      toast.success("Notícia atualizada com sucesso.");
      return true;
    } catch (error) {
      logger.error("Erro ao atualizar notícia:", error);
      toast.error("Erro ao atualizar notícia.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleSalvarOrdem = async (novaOrdem) => {
    setLoading(true);
    try {
      await atualizarOrdem(novaOrdem);
      toast.success("Ordem salva com sucesso.");
      await carregarImagens();
    } catch (error) {
      logger.error("Erro ao atualizar ordem:", error);
      toast.error("Erro ao atualizar ordem.");
    } finally {
      setLoading(false);
    }
  };

  return {
    arquivo,
    setArquivo,
    titulo,
    setTitulo,
    legenda,
    setLegenda,
    imagens,
    setImagens,
    carregarImagens,
    handleUpload,
    handleRemoverImagem,
    handleEditarNoticia,
    handleSalvarOrdem,
    loading,
  };
}
