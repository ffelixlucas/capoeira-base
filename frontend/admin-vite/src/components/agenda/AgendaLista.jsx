import AgendaItem from './AgendaItem';

function AgendaLista({ eventos, onExcluir }) {
  if (eventos.length === 0) {
    return <p className="text-center text-gray-500">Nenhum evento cadastrado ainda.</p>;
  }

  return (
    <div className="grid gap-4">
      {eventos.map((evento) => (
        <AgendaItem key={evento.id} evento={evento} onExcluir={onExcluir} />
      ))}
    </div>
  );
}

export default AgendaLista;
