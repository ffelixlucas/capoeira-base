import { useEffect } from "react";
import { createPortal } from "react-dom";

function ImageModal({ imagemUrl, onClose }) {
  useEffect(() => {
    const fecharComEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fecharComEsc);
    return () => window.removeEventListener("keydown", fecharComEsc);
  }, [onClose]);

  const modalContent = (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full h-full flex items-center justify-center"
      >
        <img
          src={imagemUrl}
          alt="Imagem expandida"
          className="max-w-[95%] max-h-[90%] object-contain"
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black bg-opacity-60 hover:bg-opacity-100 px-3 py-1 rounded text-lg"
        >
          ✕
        </button>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default ImageModal;
