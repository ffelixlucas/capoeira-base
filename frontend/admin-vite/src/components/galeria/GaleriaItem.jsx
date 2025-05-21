import React from 'react';
import GaleriaMenu from './GaleriaMenu';

function GaleriaItem({ imagem, index, onRemover }) {
  return (
<div className="relative border rounded overflow-visible bg-white shadow-sm">      {/* Imagem */}
      <img
        src={imagem.imagem_url}
        alt={imagem.titulo || 'imagem'}
        className="w-full h-28 object-cover"
      />

      {/* Número da imagem */}
      <span className="absolute top-1 left-1 bg-white text-xs font-semibold px-1 py-0.5 rounded shadow">
        {(index + 1).toString().padStart(2, '0')}
      </span>

      {/* Botão de teste no canto superior direito */}
      <GaleriaMenu />

      {/* Indicador de Foto Principal */}
      {index === 0 && (
        <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-[10px] px-1 rounded">
          Foto principal
        </div>
      )}
    </div>
  );
}

export default GaleriaItem;
