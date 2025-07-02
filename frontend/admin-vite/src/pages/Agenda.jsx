import { useEffect, useState } from "react";
import { listarEventos } from "../services/agendaService";
import AgendaItem from "../components/agenda/AgendaItem";
import AgendaForm from "../components/agenda/AgendaForm";
import BotaoVoltarDashboard from "../components/ui/BotaoVoltarDashboard";

function Agenda() {
  const [eventos, setEventos] = useState([]);
  const [eventoEditando, setEventoEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const carregarEventos = async () => {
    const dados = await listarEventos();
    setEventos(dados);
  };

  useEffect(() => {
    carregarEventos();
  }, []);

  const esconderFormulario = () => {
    setEventoEditando(null);
    setMostrarFormulario(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <BotaoVoltarDashboard className="mb-4" />
      <h1 className="text-2xl font-bold mb-4">Gerenciar Agenda</h1>

      {/* Botão para abrir formulário */}
      {!eventoEditando && !mostrarFormulario && (
        <button
          onClick={() => setMostrarFormulario(true)}
          className="mb-4 bg-green-600 text-white px-4 py-2 rounded"
        >
          + Novo Evento
        </button>
      )}

      {/* Formulário */}
      {(eventoEditando || mostrarFormulario) && (
        <div className="mb-6 relative">
          <AgendaForm
            onCriado={carregarEventos}
            eventoEditando={eventoEditando}
            onLimparEdicao={esconderFormulario}
          />
          {/* Botão de fechar flutuante */}
          {!eventoEditando && (
            <button
              onClick={esconderFormulario}
              className="absolute top-2 right-2 text-gray-500 hover:text-red-600 bg-white hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center shadow focus:outline-none"
              aria-label="Fechar formulário"
              title="Fechar"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Lista de eventos */}
      <div className="flex flex-wrap gap-4 justify-center">
        {eventos.map((evento) =>
          eventoEditando && eventoEditando.id === evento.id ? null : (
            <AgendaItem
              key={evento.id}
              evento={evento}
              onExcluir={carregarEventos}
              onEditar={() => {
                setEventoEditando(evento);
                setMostrarFormulario(true);
              }}
            />
          )
        )}
      </div>
    </div>
  );
}

export default Agenda;
