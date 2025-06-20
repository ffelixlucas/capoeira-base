import { useState, useEffect } from "react";
import {
  listarImagens,
  uploadImagem,
  deletarImagem,
  atualizarLegenda,
  atualizarOrdem,
} from "../services/galeriaService";

export function useGaleria() {
  const [arquivo, setArquivo] = useState(null);
  const [legenda, setLegenda] = useState("");
  const [imagens, setImagens] = useState([]);

  // 🔥 Carrega as imagens do backend ordenadas
  const carregarImagens = async () => {
    try {
      const data = await listarImagens();
      const ordenadas = data.sort((a, b) => a.ordem - b.ordem);
      setImagens(ordenadas);
    } catch (error) {
      console.error("Erro ao carregar imagens:", error);
    }
  };

  useEffect(() => {
    carregarImagens();
  }, []);

  // 🔼 Upload de imagem
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!arquivo) return;

    const formData = new FormData();
    formData.append("imagem", arquivo);
    formData.append("legenda", legenda);

    try {
      await uploadImagem(formData);
      setArquivo(null);
      setLegenda("");
      carregarImagens();
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
    }
  };

  // ❌ Deletar imagem
  const handleRemoverImagem = async (id) => {
    if (!window.confirm("Deseja realmente excluir essa imagem?")) return;
    try {
      await deletarImagem(id);
      setImagens((prev) => prev.filter((img) => img.id !== id));
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
    }
  };

  // ✍️ Editar legenda
  const handleEditarLegenda = async (id, novaLegenda) => {
    try {
      await atualizarLegenda(id, novaLegenda);
      setImagens((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, legenda: novaLegenda } : img
        )
      );
    } catch (error) {
      console.error("Erro ao atualizar legenda:", error);
    }
  };

  // 🔃 Atualizar ordem
  const handleSalvarOrdem = async (novaOrdem) => {
    try {
      await atualizarOrdem(novaOrdem);
      carregarImagens();
    } catch (error) {
      console.error("Erro ao atualizar ordem:", error);
    }
  };

  return {
    arquivo,
    setArquivo,
    legenda,
    setLegenda,
    imagens,
    setImagens,
    carregarImagens,
    handleUpload,
    handleRemoverImagem,
    handleEditarLegenda,
    handleSalvarOrdem,
  };
}
