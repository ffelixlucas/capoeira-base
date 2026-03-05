import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAgenda } from "../hooks/useAgenda";
import {
  ModalEvento as ModalEvento,
  Carrossel as CarrosselEventos,
} from "../components/agenda";

function Agenda() {
  const navigate = useNavigate();
  const { eventos, carregarEventos, carregando } = useAgenda();
  const [eventoEditando, setEventoEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const abrirNovoEvento = () => {
    setEventoEditando(null);
    setMostrarModal(true);
  };

  const abrirEdicaoEvento = (evento) => {
    setEventoEditando(evento);
    setMostrarModal(true);
  };

  const fecharModal = () => {
    setEventoEditando(null);
    setMostrarModal(false);
  };

  return (
    <div className="w-full max-w-full p-4 sm:p-6 md:max-w-6xl md:mx-auto overflow-x-hidden">
      <div className="mb-5">
        <div className="h-1.5 w-20 rounded-full bg-[#f4cf4e] mb-3" />
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#f4cf4e] mb-1">
          Próximos eventos
        </p>
        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-[#f8f2dc]">
          AGENDA CULTURAL
        </h1>
        <p className="mt-3 text-[#d6e4dc] text-sm sm:text-base md:text-lg">
          Eventos, rodas e encontros especiais para fortalecer a comunidade.
        </p>
      </div>

      {/* Ações admin no estilo CN10 (responsivo sem overflow) */}
      <div className="flex flex-col md:flex-row md:flex-wrap gap-3 mb-5 w-full">
        <a
          href="#novo-evento"
          onClick={(event) => {
            event.preventDefault();
            abrirNovoEvento();
          }}
          className="inline-flex w-full md:w-auto max-w-full items-center justify-center rounded-full bg-[#f4cf4e] px-5 py-3 text-[#142018] font-extrabold text-sm tracking-[0.08em] uppercase shadow-[0_10px_22px_rgba(244,207,78,0.25)] hover:bg-[#f7d96f] transition-colors"
        >
          + Novo evento
        </a>

        <a
          href="#gerenciar-inscricoes"
          onClick={(event) => {
            event.preventDefault();
            navigate("/inscricoes");
          }}
          className="inline-flex w-full md:w-auto max-w-full items-center justify-center rounded-full border border-[#f4cf4e]/45 bg-[#f4cf4e]/10 px-5 py-3 text-[#f4cf4e] font-bold text-sm tracking-[0.08em] uppercase hover:bg-[#f4cf4e]/18 transition-colors"
        >
          Gerenciar inscrições
        </a>
      </div>

      {/* Loading */}
      {carregando && (
        <p className="text-center text-gray-500 my-6">Carregando eventos...</p>
      )}

      {/* Carrossel */}
      {!carregando && (
        <CarrosselEventos
          eventos={eventos}
          onEditar={abrirEdicaoEvento}
          onExcluir={carregarEventos}
        />
      )}

      {mostrarModal && (
        <ModalEvento
          eventoEditando={eventoEditando}
          onFechar={fecharModal}
          onCriado={() => {
            carregarEventos();
            fecharModal();
          }}
        />
      )}
    </div>
  );
}

export default Agenda;
