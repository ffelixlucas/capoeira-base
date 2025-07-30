// src/components/alunos/AlunoList.jsx
import ListagemItem from "../ui/ListagemItem";
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
      <h2 className="text-lg font-semibold mb-4">Lista de Alunos</h2>

      {carregando ? (
        <p className="text-gray-500">Carregando...</p>
      ) : alunos.length === 0 ? (
        <p className="text-gray-500">Nenhum aluno encontrado.</p>
      ) : (
        <div className="rounded-xl border bg-white divide-y">
          {alunos.map((aluno) => (
            <ListagemItem
              key={aluno.id}
              titulo={
                <>
                  <span className="font-bold text-base text-gray-800">
                    {aluno.apelido}</span>
                  <span className="text-sm text-gray-500">- {aluno.nome}</span>
                </>
              }
              subtitulo={aluno.telefone}
              onVerMais={() => onVerMais(aluno)}
            />
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
