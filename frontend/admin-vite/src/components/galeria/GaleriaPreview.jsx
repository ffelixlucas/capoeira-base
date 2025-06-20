import React, { useState, useEffect } from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

function GaleriaPreview({
  imagens,
  currentIndex,
  setCurrentIndex,
  autoplay,
  setAutoplay,
}) {
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

  useEffect(() => {
    if (!autoplay) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [imagens.length, currentIndex, autoplay]);

  const imagemAtual = imagens[currentIndex];

  return (
    <div className="relative mb-6 rounded-lg overflow-hidden shadow-lg bg-white max-w-full">
      {/* Container fixo para imagem */}
      <div className="w-full h-[250px] sm:h-[400px] bg-gray-100 flex items-center justify-center">
        <img
          src={imagemAtual.imagem_url}
          alt={imagemAtual.legenda || "Imagem"}
          className="object-contain max-h-full max-w-full transition-all duration-500 ease-in-out"
        />
      </div>

      {/* Legenda */}
      {imagemAtual.legenda && (
        <div className="p-2 sm:p-3 border-t bg-black text-white text-center text-xs sm:text-sm whitespace-pre-line">
          {imagemAtual.legenda}
        </div>
      )}

      {/* Botões de navegação */}
      <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-4">
        <button
          onClick={handlePrev}
          className="bg-white/80 hover:bg-white p-2 sm:p-3 rounded-full shadow"
        >
          <FaArrowLeft className="text-gray-700 w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          onClick={handleNext}
          className="bg-white/80 hover:bg-white p-2 sm:p-3 rounded-full shadow"
        >
          <FaArrowRight className="text-gray-700 w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* 🔥 Dots indicador (agora clicáveis) */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1 sm:gap-2">
        {imagens.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setCurrentIndex(index);
              setAutoplay(false); // 🔥 Desativa autoplay quando usuário interage
            }}
            className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full ${
              index === currentIndex ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Ver imagem ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default GaleriaPreview;
