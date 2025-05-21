import React from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";

function GaleriaPreview({ imagem, onSubir, onDescer }) {
  if (!imagem) return null;

  return (
    <div className="relative mb-6 rounded overflow-hidden">
      <img
        src={imagem.imagem_url}
        alt="Preview"
        className="w-full max-h-[300px] object-cover rounded shadow"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20">
        <button
          onClick={onSubir}
          className="bg-white/60 hover:bg-white p-2 rounded"
        >
          <FaArrowUp />
        </button>
        <button
          onClick={onDescer}
          className="bg-white/60 hover:bg-white p-2 rounded"
        >
          <FaArrowDown />
        </button>
      </div>
    </div>
  );
}

export default GaleriaPreview;
