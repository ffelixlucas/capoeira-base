import InscritoLinha from "./InscritoLinha.jsx";

export default function InscritoList({ inscritos, carregando, onVerMais }) {
  if (carregando) {
    return <p className="text-gray-500 text-center">Carregando...</p>;
  }

  if (inscritos.length === 0) {
    return (
      <p className="text-gray-500 text-center">
        Nenhum inscrito encontrado para este evento.
      </p>
    );
  }

  return (
    <div className="rounded-xl border bg-white divide-y">
      {inscritos.map((inscrito) => (
        <InscritoLinha
          key={inscrito.id}
          inscrito={inscrito}
          onVerMais={onVerMais}
        />
      ))}
    </div>
  );
}
