// src/components/inscricoes/InscritoList.jsx
import ListagemItem from "../listagem/ListagemItem";

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
        <ListagemItem
          key={inscrito.id}
          titulo={
            <>
              <span className="font-bold text-base text-gray-800">
                {inscrito.apelido || inscrito.nome}
              </span>
              <span className="text-sm text-gray-500">
                {inscrito.apelido ? `- ${inscrito.nome}` : ""}
              </span>
            </>
          }
          subtitulo={
            <>
              {inscrito.telefone}{" "}
              <span
                className={`ml-2 text-xs font-semibold px-2 py-1 rounded ${
                  inscrito.status === "pago"
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}
              >
                {inscrito.status}
              </span>
            </>
          }
          onVerMais={() => onVerMais(inscrito)}
        />
      ))}
    </div>
  );
}
