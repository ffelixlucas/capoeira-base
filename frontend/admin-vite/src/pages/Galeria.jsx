import React, { useState, useEffect } from "react";
import {
  uploadImagem,
  listarImagens,
  deletarImagem
} from "../services/galeriaService.js";

import {
  GaleriaUploader,
  GaleriaPreview,
  GaleriaGrade
} from  "../components/galeria/index.jsx";

function Galeria() {
  const [arquivo, setArquivo] = useState(null);
  const [legenda, setLegenda] = useState("");
  const [imagens, setImagens] = useState([]);

  const carregarImagens = async () => {
    try {
      const data = await listarImagens();
      const ordenadas = data.sort((a, b) => a.ordem - b.ordem);
      setImagens(ordenadas);
    } catch (err) {
      console.error("Erro ao carregar imagens:", err);
    }
  };

  useEffect(() => {
    carregarImagens();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!arquivo) return;

    const formData = new FormData();
    formData.append("imagem", arquivo);
    formData.append("legenda", legenda); // 🔥 Enviando legenda corretamente!

    try {
      await uploadImagem(formData);
      setArquivo(null);
      setLegenda("");
      carregarImagens();
    } catch (err) {
      console.error("Erro ao enviar imagem:", err);
    }
  };

  const handleRemoverImagem = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta imagem?')) return;
  
    try {
      await deletarImagem(id);
      setImagens((prev) => prev.filter((img) => img.id !== id));
    } catch (err) {
      console.error('Erro ao remover imagem:', err);
      alert('Erro ao excluir a imagem. Tente novamente.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 flex flex-col gap-6">
      <h2 className="text-2xl font-bold">Galeria</h2>

      <GaleriaUploader
        arquivo={arquivo}
        setArquivo={setArquivo}
        legenda={legenda}
        setLegenda={setLegenda}
        onUpload={handleUpload}
      />

      {imagens.length > 0 && (
        <>
          <GaleriaPreview imagens={imagens} />
          <GaleriaGrade
            imagens={imagens}
            setImagens={setImagens}
            onRemover={handleRemoverImagem}
          />
        </>
      )}
    </div>
  );
}

export default Galeria;
