import React, { useState } from "react";
import {
  GaleriaUploader,
  GaleriaPreview,
  GaleriaGrade,
} from "../components/galeria";

import { useGaleria } from "../hooks/useGaleria";
import BotaoVoltarDashboard from "../components/ui/BotaoVoltarDashboard";


function Galeria() {
  const {
    arquivo,
    setArquivo,
    legenda,
    setLegenda,
    imagens,
    setImagens,
    handleUpload,
    handleRemoverImagem,
  } = useGaleria();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
            <BotaoVoltarDashboard />


      <GaleriaUploader
        arquivo={arquivo}
        setArquivo={setArquivo}
        legenda={legenda}
        setLegenda={setLegenda}
        onUpload={handleUpload}
      />

      {imagens.length > 0 && (
        <>
          <GaleriaPreview
            imagens={imagens}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            autoplay={autoplay}
            setAutoplay={setAutoplay}
          />

          <GaleriaGrade
            imagens={imagens}
            setImagens={setImagens}
            onRemover={handleRemoverImagem}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
            setAutoplay={setAutoplay}
          />
        </>
      )}
    </div>
  );
}

export default Galeria;
