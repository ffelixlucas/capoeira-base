import { createPortal } from "react-dom";

export default function ModalTurmaForm({ aberto, onClose, children, titulo }) {
  if (!aberto) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        {titulo && (
          <h2 className="text-xl font-semibold mb-4 text-gray-900">
            {titulo}
          </h2>
        )}

        {children}
      </div>
    </div>,
    document.body
  );
}
