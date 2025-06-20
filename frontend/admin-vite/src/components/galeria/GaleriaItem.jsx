import React, { useState, useEffect } from "react";
import GaleriaMenu from "./GaleriaMenu";

function GaleriaItem({
  imagem,
  index,
  onRemover,
  onMoverParaFrente,
  onMoverParaTras,
  onEditarLegenda,
  onMoverParaPosicao,
  setCurrentIndex,
  setAutoplay,
}) {
  const [editandoPosicao, setEditandoPosicao] = useState(false);
  const [valorPosicao, setValorPosicao] = useState(index + 1);

  useEffect(() => {
    setValorPosicao(index + 1);
  }, [index]);

  const handleSubmitPosicao = () => {
    const novaPos = parseInt(valorPosicao, 10);
    if (isNaN(novaPos) || novaPos < 1) {
      alert("Posição inválida.");
      setValorPosicao(index + 1);
    } else {
      onMoverParaPosicao(novaPos - 1);
    }
    setEditandoPosicao(false);
  };

  return (
    <div
      className="relative border rounded-2xl bg-white/90 shadow-md p-2 sm:p-3 group hover:scale-[1.02] transition cursor-pointer max-w-full"
      onClick={() => {
        setCurrentIndex(index);
        setAutoplay(false);
      }}
    >
      <div className="w-full h-[150px] sm:h-[200px] bg-white rounded-xl flex items-center justify-center">
        <img
          src={imagem.imagem_url}
          alt={imagem.titulo || "imagem"}
          className="object-contain max-w-full max-h-full"
        />
      </div>

      {imagem.legenda && (
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center p-2">
          <p className="text-xs sm:text-sm text-center text-cor-clara whitespace-pre-line">
            {imagem.legenda}
          </p>
        </div>
      )}

      {/* Bolinha da posição */}
      <div className="absolute top-2 left-2">
        {editandoPosicao ? (
          <input
            type="number"
            value={valorPosicao}
            onChange={(e) => setValorPosicao(e.target.value)}
            onBlur={handleSubmitPosicao}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmitPosicao();
            }}
            className="w-8 h-6 sm:w-10 sm:h-8 text-center text-xs font-bold border rounded-full shadow bg-white text-black"
            autoFocus
          />
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setEditandoPosicao(true);
            }}
            className="bg-white text-black text-xs font-semibold px-1 py-0.5 sm:px-2 sm:py-1 rounded-full shadow"
          >
            {(index + 1).toString().padStart(2, "0")}
          </button>
        )}
      </div>

      {/* Menu */}
      <GaleriaMenu
        onVer={() => window.open(imagem.imagem_url, "_blank")}
        onMoverParaFrente={() => onMoverParaFrente(index)}
        onMoverParaTras={() => onMoverParaTras(index)}
        onEditarLegenda={onEditarLegenda}
        onExcluir={() => onRemover(imagem.id)}
      />

      {/* Selo Foto Principal */}
      {index === 0 && (
        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
          Foto principal
        </div>
      )}
    </div>
  );
}

export default GaleriaItem;