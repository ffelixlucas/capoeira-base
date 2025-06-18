import React from "react";
import GaleriaMenu from "./GaleriaMenu";

function GaleriaItem({ 
  imagem, 
  index, 
  onRemover, 
  onMoverParaFrente, 
  onMoverParaTras, 
  onEditarLegenda 
}) {
  return (
    <div className="relative border rounded-lg overflow-visible bg-white shadow-md">
      <img
        src={imagem.imagem_url}
        alt={imagem.titulo || "imagem"}
        className="w-full h-32 object-contain rounded-t-lg"
      />

      <span className="absolute top-2 left-2 bg-white text-black text-xs font-semibold px-2 py-1 rounded-full shadow">
        {(index + 1).toString().padStart(2, "0")}
      </span>

      <GaleriaMenu
        onVer={() => window.open(imagem.imagem_url, "_blank")}
        onMoverParaFrente={() => onMoverParaFrente(index)}
        onMoverParaTras={() => onMoverParaTras(index)}
        onEditarLegenda={() => onEditarLegenda(imagem)} // 🔥 Aqui funcionando
        onExcluir={() => onRemover(imagem.id)}
      />

      {index === 0 && (
        <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
          Foto principal
        </div>
      )}
    </div>
  );
}

export default GaleriaItem;
