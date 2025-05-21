import React from 'react';

function GaleriaUploader({ imagem, setImagem, onUpload }) {
  return (
    <form onSubmit={onUpload} className="mb-4 flex flex-col gap-2">
      <input
        type="file"
        onChange={(e) => setImagem(e.target.files[0])}
        accept="image/*"
        className="border border-gray-300 p-2 rounded"
      />
      <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
        Enviar imagem
      </button>
    </form>
  );
}

export default GaleriaUploader;
