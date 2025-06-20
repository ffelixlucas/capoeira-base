import React, { useRef } from "react";

function GaleriaUploader({
  arquivo,
  setArquivo,
  legenda,
  setLegenda,
  onUpload,
  loading, // 🔥 Recebe o estado de loading
}) {
  const fileInputRef = useRef();

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    setArquivo(e.target.files[0]);
  };

  return (
    <form
      onSubmit={onUpload}
      className="w-full sm:max-w-md min-w-[280px] mx-auto flex flex-col gap-4 bg-cor-secundaria/30 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-cor-secundaria"
    >
      {/* 🔥 Preview da imagem */}
      {arquivo && (
        <div className="w-full aspect-video bg-white border rounded-xl flex items-center justify-center overflow-hidden">
          <img
            src={URL.createObjectURL(arquivo)}
            alt="Preview"
            className="object-contain max-h-full max-w-full"
          />
        </div>
      )}

      {/* Botão estilizado para selecionar arquivo */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={loading}
          className={`${
            loading ? "opacity-60 cursor-not-allowed" : ""
          } bg-cor-primaria hover:bg-cor-titulo transition text-cor-escura font-semibold py-2 px-4 rounded-lg w-full text-sm sm:text-base`}
        >
          {arquivo ? "Arquivo selecionado: " + arquivo.name : "Selecionar imagem"}
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Input da legenda */}
      <input
        type="text"
        value={legenda}
        onChange={(e) => setLegenda(e.target.value)}
        placeholder="Digite a legenda"
        disabled={loading}
        className={`w-full border border-cor-secundaria rounded-lg p-2 sm:p-3 bg-white/90 text-black focus:outline-none focus:ring-2 focus:ring-cor-primaria text-sm sm:text-base ${
          loading ? "opacity-60 cursor-not-allowed" : ""
        }`}
      />

      {/* Botão de enviar */}
      <button
        type="submit"
        disabled={loading}
        className={`${
          loading ? "opacity-60 cursor-not-allowed" : ""
        } bg-cor-primaria hover:bg-cor-titulo transition text-cor-escura font-semibold py-2 px-4 rounded-lg text-sm sm:text-base`}
      >
        {loading ? "Enviando..." : "Enviar imagem"}
      </button>
    </form>
  );
}

export default GaleriaUploader;
