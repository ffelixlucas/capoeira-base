import React, { useState, useEffect } from 'react';
import { listarImagens } from '../../services/galeriaService';
import GaleriaPreview from './GaleriaPreview';
import GaleriaGrade from './GaleriaGrade';
import GaleriaUploader from './GaleriaUploader';

function GaleriaAdmin() {
  const [imagens, setImagens] = useState([]);
  const [imagemAtual, setImagemAtual] = useState(null);

  // Carregar imagens do backend
  useEffect(() => {
    async function carregarImagens() {
      try {
        const data = await listarImagens();
        setImagens(data);
        setImagemAtual(data[0] || null);
      } catch (error) {
        console.error('Erro ao carregar imagens:', error);
      }
    }

    carregarImagens();
  }, []);

  // Selecionar imagem principal
  const handleSelecionarImagem = (img) => {
    setImagemAtual(img);
  };

  // Remover imagem
  const handleRemoverImagem = (id) => {
    const novas = imagens.filter((img) => img.id !== id);
    setImagens(novas);
    if (imagemAtual?.id === id) {
      setImagemAtual(novas[0] || null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-cor-titulo">Gerenciar Galeria</h2>

      {/* Upload */}
      <GaleriaUploader
        imagens={imagens}
        setImagens={setImagens}
        setImagemAtual={setImagemAtual}
      />

      {/* Preview da imagem principal */}
      {imagemAtual && (
        <GaleriaPreview imagem={imagemAtual} />
      )}

      {/* Miniaturas */}
      <GaleriaGrade
        imagens={imagens}
        setImagens={setImagens}
        onSelecionar={handleSelecionarImagem}
        onRemover={handleRemoverImagem}
      />
    </div>
  );
}

export default GaleriaAdmin;
