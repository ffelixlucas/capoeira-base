import React, { useState } from "react";
import {
  GaleriaUploader,
  GaleriaPreview,
  GaleriaGrade,
} from "../components/galeria";

import { useGaleria } from "../hooks/useGaleria";

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
          <GaleriaPreview
            imagens={imagens}
            currentIndex={currentIndex}
            setCurrentIndex={setCurrentIndex}
          />
          <GaleriaGrade
            imagens={imagens}
            setImagens={setImagens}
            onRemover={handleRemoverImagem}
            setCurrentIndex={setCurrentIndex}
          />
        </>
      )}
    </div>
  );
}

export default Galeria;
