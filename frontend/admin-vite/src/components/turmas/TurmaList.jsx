export default function TurmaList({ turmas = [], onEditar }) {
    if (turmas.length === 0) {
      return (
        <p className="text-center text-gray-500 mt-4">
          Nenhuma turma cadastrada ainda.
        </p>
      );
    }
  
    return (
      <div className="mt-4 space-y-3">
        {turmas.map((turma) => (
          <div
            key={turma.id}
            className="bg-white rounded-lg shadow p-4 border border-gray-200 relative"
          >
            <h2 className="text-lg font-semibold text-cor-primaria">
              {turma.nome}
            </h2>
            <p className="text-sm text-gray-700">
              Faixa etária: {turma.faixa_etaria || "Não informada"}
            </p>
            <p className="text-sm text-gray-500">
              Instrutor: <span className="font-medium">{turma.nome_instrutor}</span>
            </p>
  
            {/* Botão Editar */}
            {onEditar && (
              <button
                onClick={() => onEditar(turma)}
                className="absolute top-2 right-2 text-xs text-cor-primaria underline hover:text-cor-primaria/80 transition"
              >
                Editar
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }
  