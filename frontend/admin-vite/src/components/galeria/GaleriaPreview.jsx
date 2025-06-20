import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

function GaleriaPreview({ imagens, currentIndex, setCurrentIndex }) {


  if (!imagens || imagens.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === imagens.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? imagens.length - 1 : prevIndex - 1
    );
  };

  // Slider automático a cada 5 segundos (com cleanup ✔️)
  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [imagens.length]); // ⬅️ roda sempre que muda a quantidade de imagens

  const imagemAtual = imagens[currentIndex];

  return (
    <div className="relative mb-6 rounded-lg overflow-hidden shadow-lg bg-white">
      {/* Imagem principal */}
      <img
        src={imagemAtual.imagem_url}
        alt={imagemAtual.legenda || "Imagem"}
        className="w-full max-h-[400px] object-contain rounded-t-lg bg-gray-100"
      />

      {/* Legenda */}
      {imagemAtual.legenda && (
        <div className="p-3 border-t bg-black text-white text-center text-sm whitespace-pre-line">
          {imagemAtual.legenda}
        </div>
      )}

      {/* Botões de navegação */}
      <div className="absolute inset-0 flex items-center justify-between px-4">
        <button
          onClick={handlePrev}
          className="bg-white/80 hover:bg-white p-3 rounded-full shadow"
        >
          <FaArrowLeft className="text-gray-700" />
        </button>
        <button
          onClick={handleNext}
          className="bg-white/80 hover:bg-white p-3 rounded-full shadow"
        >
          <FaArrowRight className="text-gray-700" />
        </button>
      </div>

      {/* Indicador de posição */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
        {imagens.map((_, index) => (
          <span
            key={index}
            className={`h-3 w-3 rounded-full ${
              index === currentIndex ? "bg-white" : "bg-white/50"
            }`}
          ></span>
        ))}
      </div>
    </div>
  );
}

export default GaleriaPreview;
