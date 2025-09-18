// src/components/notificacoes/SinoNotificacoes.jsx
import { useEffect, useState } from "react";
import { getPendentesCount } from "../../services/notificacoesService";
import ModalPendentes from "./ModalPendentes";

export default function SinoNotificacoes() {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let intervalId;

    const fetchCount = async () => {
      try {
        const result = await getPendentesCount();
        setCount(result);
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      }
    };

    // busca inicial
    fetchCount();

    // polling a cada 60 segundos
    intervalId = setInterval(fetchCount, 60000);

    // limpar ao desmontar
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
        aria-label="Notificações de matrículas pendentes"
      >
        {/* Ícone de sino */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967
               8.967 0 0118 9.75V9a6 6 0 10-12 0v.75a8.967
               8.967 0 01-2.311 6.022c1.733.64 3.56
               1.085 5.454 1.31m5.714 0a24.255 24.255 0
               01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {/* Badge com a contagem */}
        {count > 0 && (
          <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {count}
          </span>
        )}
      </button>

      {/* Modal de pendentes */}
      {open && <ModalPendentes onClose={() => setOpen(false)} />}
    </>
  );
}
