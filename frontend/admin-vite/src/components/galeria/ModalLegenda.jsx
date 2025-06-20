import React, { useEffect, useRef } from "react";

function ModalLegenda({
  isOpen,
  onClose,
  legenda,
  setLegenda,
  onSalvar,
  loading, // 🔥 recebe estado de loading
}) {
  const modalRef = useRef();
  const textareaRef = useRef();

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
    }

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleClickFora = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleClickFora}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-legenda-title"
    >
      <div
        ref={modalRef}
        className="bg-cor-fundo rounded-2xl w-[90%] max-w-md p-6"
      >
        <h2
          id="modal-legenda-title"
          className="text-xl font-semibold mb-4 text-cor-clara"
        >
          Editar Legenda
        </h2>

        <textarea
          ref={textareaRef}
          value={legenda}
          onChange={(e) => setLegenda(e.target.value)}
          placeholder="Digite a legenda"
          rows={3}
          disabled={loading}
          className={`w-full border rounded-lg p-2 mb-4 bg-cor-clara text-cor-escura resize-y ${
            loading ? "opacity-60 cursor-not-allowed" : ""
          }`}
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={loading}
            className={`px-4 py-2 rounded bg-cor-secundaria hover:bg-cor-destaque text-cor-clara ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={onSalvar}
            disabled={loading}
            className={`px-4 py-2 rounded bg-cor-titulo hover:bg-cor-primaria text-cor-escura ${
              loading ? "opacity-60 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalLegenda;
