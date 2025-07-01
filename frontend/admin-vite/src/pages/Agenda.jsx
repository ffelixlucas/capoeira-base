import { useEffect, useState } from "react";
import { listarEventos } from "../services/agendaService";
import AgendaItem from "../components/agenda/AgendaItem";
import AgendaForm from "../components/agenda/AgendaForm";
import BotaoVoltarDashboard from "../components/ui/BotaoVoltarDashboard";


function Agenda() {
  const [eventos, setEventos] = useState([]);
  const [eventoEditando, setEventoEditando] = useState(null);

  const carregarEventos = async () => {
    const dados = await listarEventos();
    setEventos(dados);
  };

  useEffect(() => {
    carregarEventos();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <BotaoVoltarDashboard className="mb-4" />
      <h1 className="text-2xl font-bold mb-4">Gerenciar Agenda</h1>

      <AgendaForm
        onCriado={carregarEventos}
        eventoEditando={eventoEditando}
        onLimparEdicao={() => setEventoEditando(null)}
      />

      <div className="flex flex-wrap gap-4 justify-center">
        {eventos.map((evento) =>
          eventoEditando && eventoEditando.id === evento.id ? null : (
            <AgendaItem
              key={evento.id}
              evento={evento}
              onExcluir={carregarEventos}
              onEditar={() => setEventoEditando(evento)}
            />
          )
        )}
      </div>
    </div>
  );
}

export default Agenda;
