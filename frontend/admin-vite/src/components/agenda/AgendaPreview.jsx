import AgendaItem from './AgendaItem';

function AgendaPreview({ evento }) {
  if (!evento || !evento.titulo) return null;

  return (
    <div className="mt-6">
      <AgendaItem evento={evento} mostrarBotoes={false} />
    </div>
  );
}

export default AgendaPreview;
