import { useEffect, useState } from "react";
import { listarEventos } from "../services/agendaService";
import AgendaItem from "../components/agenda/AgendaItem";
import BotaoVoltarDashboard from "../components/ui/BotaoVoltarDashboard";
import ModalEvento from "../components/agenda/ModalEvento";

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

      {/* Lista de eventos */}
      <div className="flex flex-wrap gap-4 justify-center">
        {eventos.map((evento) => (
          <AgendaItem
            key={evento.id}
            evento={evento}
            onExcluir={carregarEventos}
            onEditar={() => abrirEdicaoEvento(evento)}
          />
        ))}
      </div>

      {/* Modal para criar ou editar evento */}
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
