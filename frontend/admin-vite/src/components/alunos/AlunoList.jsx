import { useEffect, useState } from "react";
import { useAlunos } from "../../hooks/useAlunos";
import { buscarAluno } from "../../services/alunoService";
import AlunoLinha from "./AlunoLinha";
import ModalAluno from "./ModalAluno";

export default function AlunoList() {
  const { alunos, carregarAlunos, carregando } = useAlunos();
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  useEffect(() => {
    carregarAlunos();
  }, []);
  async function abrirFichaCompleta(aluno) {
    try {
      const alunoCompleto = await buscarAluno(aluno.id);
      setAlunoSelecionado(alunoCompleto);
    } catch (err) {
      toast.error("Erro ao carregar ficha do aluno");
    }
  }

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
            <AlunoLinha
              key={aluno.id}
              aluno={aluno}
              onVerMais={abrirFichaCompleta}
            />
          ))}
        </div>
      )}

      <ModalAluno
        aberto={!!alunoSelecionado}
        aluno={alunoSelecionado}
        onClose={() => setAlunoSelecionado(null)}
      />
    </div>
  );
}
