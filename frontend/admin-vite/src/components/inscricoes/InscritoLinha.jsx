export default function InscritoLinha({ inscrito, onVerMais }) {
    return (
      <div
        className="flex items-center justify-between p-4 hover:bg-gray-50 cursor-pointer"
        onClick={() => onVerMais(inscrito)}
      >
        <div className="flex flex-col text-left w-full">
          <span className="font-bold text-base text-gray-800">
            {inscrito.nome}
          </span>
          <span className="text-sm text-gray-500">{inscrito.telefone}</span>
        </div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded ${
            inscrito.status === "pago"
              ? "bg-green-100 text-green-600"
              : "bg-yellow-100 text-yellow-600"
          }`}
        >
          {inscrito.status}
        </span>
      </div>
    );
  }
  