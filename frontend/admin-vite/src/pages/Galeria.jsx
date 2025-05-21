import React, { useState, useEffect } from "react";
import { uploadImagem, listarImagens } from "../services/galeriaService";
import GaleriaUploader from "../components/galeria/GaleriaUploader";
import GaleriaPreview from "../components/galeria/GaleriaPreview";
import GaleriaGrade from "../components/galeria/GaleriaGrade";

import { FaArrowUp, FaArrowDown, FaTrash } from "../icons";

function Galeria() {
  const [imagem, setImagem] = useState(null);
  const [imagens, setImagens] = useState([]);

  const carregarImagens = async () => {
    const data = await listarImagens();
    const ordenadas = data.sort((a, b) => a.ordem - b.ordem);
    setImagens(ordenadas);
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
      carregarImagens(); // recarrega a lista
    } catch (err) {
      console.error("Erro ao enviar imagem:", err);
    }
  };

  const moverParaCima = (index) => {
    if (index === 0) return;
    const novaOrdem = [...imagens];
    [novaOrdem[index - 1], novaOrdem[index]] = [
      novaOrdem[index],
      novaOrdem[index - 1],
    ];
    setImagens(novaOrdem);
  };

  const moverParaBaixo = (index) => {
    if (index === imagens.length - 1) return;
    const novaOrdem = [...imagens];
    [novaOrdem[index], novaOrdem[index + 1]] = [
      novaOrdem[index + 1],
      novaOrdem[index],
    ];
    setImagens(novaOrdem);
  };
  const handleRemoverImagem = (id) => {
    console.log("Remover imagem com ID:", id);
  };
  return (
    <div className="max-w-5xl mx-auto p-4 flex flex-col gap-6">
      <h2>Galeria</h2>

      <GaleriaUploader
        imagem={imagem}
        setImagem={setImagem}
        onUpload={handleUpload}
      />

      <GaleriaPreview
        imagem={imagens[0]}
        onSubir={() => moverParaCima(0)}
        onDescer={() => moverParaBaixo(0)}
      />
      <GaleriaGrade
        imagens={imagens}
        setImagens={setImagens}
        onRemover={handleRemoverImagem}
      />
    </div>
  );
}

export default Galeria;
