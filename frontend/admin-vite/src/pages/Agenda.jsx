import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { useAgenda } from "../hooks/useAgenda";
import BotaoVoltarDashboard from "../components/ui/BotaoVoltarDashboard";
import { ModalEvento as ModalEvento, Carrossel as CarrosselEventos } from "../components/agenda";

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
      <BotaoVoltarDashboard className="mb-4" />
      <h1 className="text-2xl font-bold mb-4">Gerenciar Agenda</h1>

      {/* Botões principais */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={abrirNovoEvento}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          + Novo Evento
        </button>
        <button
          onClick={() => navigate("/inscricoes")}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          📋 Gerenciar Inscrições
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
