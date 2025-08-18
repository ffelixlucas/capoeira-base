import { useEffect, useState } from "react";
import ListagemItem from "../ui/ListagemItem";
import ModalAluno from "./ModalAluno";
import ContadorLista from "../ui/ContadorLista";
import api from "../../services/api"; // certifique-se que existe seu axios config

export default function AlunoList({
  alunos,
  carregando,
  onVerMais,
  onEditar,
  alunoSelecionado,
  fecharModal,
  onExcluido,
}) {
  const [metricas, setMetricas] = useState({});

  useEffect(() => {
    async function carregarMetricas() {
      if (!alunos || alunos.length === 0) return;

      const anoAtual = new Date().getFullYear();
      const inicio = `${anoAtual}-01-01`;
      const fim = new Date().toISOString().split("T")[0];

      const novasMetricas = {};
      for (const aluno of alunos) {
        try {
          const { data } = await api.get(`/alunos/${aluno.id}/metricas`, {
            params: { inicio, fim }
          });
          novasMetricas[aluno.id] = data;
        } catch (err) {
          console.error("Erro ao buscar métricas do aluno", aluno.id, err);
        }
      }
      setMetricas(novasMetricas);
    }

    carregarMetricas();
  }, [alunos]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-white">Lista de alunos</h2>
        <ContadorLista total={alunos.length} />
      </div>

      {carregando ? (
        <p className="text-gray-500">Carregando...</p>
      ) : alunos.length === 0 ? (
        <p className="text-gray-500">Nenhum aluno encontrado.</p>
      ) : (
        <div className="rounded-xl border bg-white divide-y">
          {alunos.map((aluno) => {
            const dados = metricas[aluno.id];
            const frequencia = dados
              ? `${Math.round(dados.taxa_presenca * 100)}%`
              : "-";

            return (
              <ListagemItem
                key={aluno.id}
                titulo={
                  <>
                    <span className="font-bold text-base text-gray-800">
                      {aluno.apelido}
                    </span>
                    <span className="text-sm text-gray-500"> - {aluno.nome}</span>
                  </>
                }
                subtitulo={`Frequência: ${frequencia}`}
                onVerMais={() => onVerMais(aluno)}
              />
            );
          })}
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
