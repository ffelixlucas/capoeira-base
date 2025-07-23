// src/components/alunos/AlunoCard.jsx
export default function AlunoCard({ aluno, onVerMais }) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4 border hover:shadow-lg transition">
        <p className="font-semibold text-lg text-gray-800">{aluno.nome}</p>
  
        {aluno.apelido && (
          <p className="text-sm text-gray-600">Apelido: {aluno.apelido}</p>
        )}
  
        <p className="text-sm text-gray-700 mt-1">
          Turma: <span className="font-medium text-gray-800">{aluno.turma}</span>
        </p>
  
        <button
          onClick={() => onVerMais(aluno)}
          className="mt-3 text-sm bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
        >
          Ver mais
        </button>
      </div>
    );
  }
  