import React, { useState, useEffect } from "react";
import {
  uploadImagem,
  listarImagens,
  deletarImagem
} from "../services/galeriaService";
import GaleriaUploader from "../components/galeria/GaleriaUploader";
import GaleriaPreview from "../components/galeria/GaleriaPreview";
import GaleriaGrade from "../components/galeria/GaleriaGrade";

function Galeria() {
  const [imagem, setImagem] = useState(null);
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
    if (!imagem) return;

    const formData = new FormData();
    formData.append("imagem", imagem);

    try {
      await uploadImagem(formData);
      setImagem(null);
      carregarImagens();
    } catch (err) {
      console.error("Erro ao enviar imagem:", err);
    }
  };

  const handleRemoverImagem = async (id) => {
    try {
      await deletarImagem(id);
      carregarImagens();
    } catch (err) {
      console.error("Erro ao remover imagem:", err);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 flex flex-col gap-6">
      <h2 className="text-2xl font-bold">Galeria</h2>

      <GaleriaUploader
        imagem={imagem}
        setImagem={setImagem}
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
