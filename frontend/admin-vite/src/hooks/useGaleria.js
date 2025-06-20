import { useState, useEffect } from "react";
import { 
  listarImagens, 
  uploadImagem, 
  deletarImagem 
} from "../services/galeriaService";

export function useGaleria() {
  // 🔧 Estados
  const [arquivo, setArquivo] = useState(null);
  const [legenda, setLegenda] = useState("");
  const [imagens, setImagens] = useState([]);

  // 🔃 Função para carregar imagens
  const carregarImagens = async () => {
    try {
      const data = await listarImagens();
      const ordenadas = data.sort((a, b) => a.ordem - b.ordem);
      setImagens(ordenadas);
    } catch (error) {
      console.error("Erro ao carregar imagens:", error);
    }
  };

  // 🚀 Carregar na montagem
  useEffect(() => {
    carregarImagens();
  }, []);

  // ⬆️ Upload de imagem
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

  // ❌ Remover imagem
  const handleRemoverImagem = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta imagem?")) return;

    try {
      await deletarImagem(id);
      setImagens((prev) => prev.filter((img) => img.id !== id));
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
      alert("Erro ao excluir a imagem. Tente novamente.");
    }
  };

  // 📝 Editar legenda (apenas local, opcional salvar no backend depois)
  const handleEditarLegenda = (imagem) => {
    const novaLegenda = prompt("Editar legenda:", imagem.legenda || "");
    if (novaLegenda !== null) {
      const atualizadas = imagens.map((img) =>
        img.id === imagem.id ? { ...img, legenda: novaLegenda } : img
      );
      setImagens(atualizadas);
      // 🔥 Se quiser, aqui pode chamar API de atualização no backend
    }
  };

  // 🚚 Retornar tudo que o componente precisa
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
  };
}
