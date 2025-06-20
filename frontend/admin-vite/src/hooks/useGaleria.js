import { useState, useEffect } from "react";
import {
  listarImagens,
  uploadImagem,
  deletarImagem,
  atualizarLegenda,
  atualizarOrdem,
} from "../services/galeriaService";
import { toast } from "react-toastify";

export function useGaleria() {
  const [arquivo, setArquivo] = useState(null);
  const [legenda, setLegenda] = useState("");
  const [imagens, setImagens] = useState([]);
  const [loading, setLoading] = useState(false);

  // 🔥 Carrega as imagens do backend ordenadas
  const carregarImagens = async () => {
    try {
      const data = await listarImagens();
      const ordenadas = data.sort((a, b) => a.ordem - b.ordem);
      setImagens(ordenadas);
    } catch (error) {
      console.error("Erro ao carregar imagens:", error);
      toast.error("Erro ao carregar imagens.");
    }
  };

  useEffect(() => {
    carregarImagens();
  }, []);

  // 🔼 Upload de imagem com validação
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!arquivo) {
      toast.error("Selecione uma imagem para enviar.");
      return;
    }

    const tiposPermitidos = ["image/jpeg", "image/jpg", "image/png"];
    const tamanhoMaximo = 5 * 1024 * 1024; // 5MB

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
    formData.append("legenda", legenda);

    setLoading(true);
    try {
      await uploadImagem(formData);
      toast.success("Imagem enviada com sucesso!");
      setArquivo(null);
      setLegenda("");
      carregarImagens();
    } catch (error) {
      console.error("Erro ao enviar imagem:", error);
      toast.error("Erro ao enviar imagem.");
    } finally {
      setLoading(false);
    }
  };

  // ❌ Deletar imagem
  const handleRemoverImagem = async (id) => {
    const confirmar = window.confirm("Deseja realmente excluir essa imagem?");
    if (!confirmar) return;

    setLoading(true);
    try {
      await deletarImagem(id);
      setImagens((prev) => prev.filter((img) => img.id !== id));
      toast.success("Imagem removida com sucesso.");
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
      toast.error("Erro ao remover imagem.");
    } finally {
      setLoading(false);
    }
  };

  // ✍️ Editar legenda
  const handleEditarLegenda = async (id, novaLegenda) => {
    setLoading(true);
    try {
      await atualizarLegenda(id, novaLegenda);
      setImagens((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, legenda: novaLegenda } : img
        )
      );
      toast.success("Legenda atualizada com sucesso.");
    } catch (error) {
      console.error("Erro ao atualizar legenda:", error);
      toast.error("Erro ao atualizar legenda.");
    } finally {
      setLoading(false);
    }
  };

  // 🔃 Atualizar ordem
  const handleSalvarOrdem = async (novaOrdem) => {
    setLoading(true);
    try {
      await atualizarOrdem(novaOrdem);
      toast.success("Ordem salva com sucesso.");
      carregarImagens();
    } catch (error) {
      console.error("Erro ao atualizar ordem:", error);
      toast.error("Erro ao atualizar ordem.");
    } finally {
      setLoading(false);
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
    loading, // 🔥 expose loading para os botões
  };
}
