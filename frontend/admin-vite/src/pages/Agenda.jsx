import { useEffect, useState } from "react";
import { listarEventos } from "../services/agendaService";
import BotaoVoltarDashboard from "../components/ui/BotaoVoltarDashboard";
import ModalEvento from "../components/agenda/ModalEvento";
import CarrosselEventos from "../components/agenda/CarrosselEventos";

function Agenda() {
  const [eventos, setEventos] = useState([]);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);

  const carregarEventos = async () => {
    const dados = await listarEventos();
    setEventos(dados);
  };

  useEffect(() => {
    carregarEventos();
  }, []);

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

      {/* Botão para abrir modal */}
      <button
        onClick={abrirNovoEvento}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        + Novo Evento
      </button>

      {/* Carrossel com snapping via Embla */}
      <CarrosselEventos
        eventos={eventos}
        onEditar={abrirEdicaoEvento}
        onExcluir={carregarEventos}
      />

      {/* Modal de evento (criar/editar) */}
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
