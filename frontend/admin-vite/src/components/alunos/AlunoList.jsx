// src/components/alunos/AlunoList.jsx
import AlunoLinha from "./AlunoLinha";
import ModalAluno from "./ModalAluno";

export default function AlunoList({
  alunos,
  carregando,
  onVerMais,
  onEditar,
  alunoSelecionado,
  fecharModal,
  onExcluido,
}) {
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4 text-gray-900">Alunos</h1>

      {carregando ? (
        <p className="text-gray-500">Carregando...</p>
      ) : alunos.length === 0 ? (
        <p className="text-gray-500">Nenhum aluno encontrado.</p>
      ) : (
        <div className="rounded-xl border bg-white divide-y">
          {alunos.map((aluno) => (
            <AlunoLinha key={aluno.id} aluno={aluno} onVerMais={onVerMais} />
          ))}
        </div>
      )}

      <ModalAluno
        aberto={!!alunoSelecionado}
        aluno={alunoSelecionado}
        onClose={fecharModal}
        onEditar={onEditar}
        onExcluido={onExcluido}
      />
    </div>
  );
}
