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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <div className="h-1.5 w-20 rounded-full bg-[#f4cf4e] mb-3" />
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-[#f4cf4e] mb-1">
          Próximos eventos
        </p>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-[#f8f2dc]">
          AGENDA CULTURAL
        </h1>
        <p className="mt-3 text-[#d6e4dc] text-base md:text-lg">
          Eventos, rodas e encontros especiais para fortalecer a comunidade.
        </p>
      </div>

      {/* Botões principais */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={abrirNovoEvento}
          className="rounded-full bg-[#f4cf4e] px-5 py-2.5 font-black text-[#142018] hover:bg-[#f7d96f] transition-colors"
        >
          + Novo Evento
        </button>

        <button
          onClick={() => navigate("/inscricoes")}
          className="rounded-full border border-[#f4cf4e]/45 bg-[#f4cf4e]/10 px-5 py-2.5 font-bold text-[#f4cf4e] hover:bg-[#f4cf4e]/20 transition-colors"
        >
          Gerenciar Inscrições
        </button>
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
