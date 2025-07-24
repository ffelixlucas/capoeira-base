import { useState, useEffect } from "react";
import BotaoVoltarDashboard from "../components/ui/BotaoVoltarDashboard";
import AlunoList from "../components/alunos/AlunoList";
import AlunoForm from "../components/alunos/AlunoForm";
import { useAlunos } from "../hooks/useAlunos";
import { buscarAluno } from "../services/alunoService";
import { toast } from "react-toastify";
import { useMinhasTurmas } from "../hooks/useMinhasTurmas";

function Alunos() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const { alunos, carregando, carregarAlunos } = useAlunos();
  const {
    turmas,
    turmaSelecionada,
    setTurmaSelecionada,
    carregando: carregandoTurmas,
  } = useMinhasTurmas(usuario);

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

  const alunosFiltrados =
    turmaSelecionada === "todos" || !turmaSelecionada
      ? alunos
      : alunos.filter((a) => a.turma_id === Number(turmaSelecionada));

  return (
    <div className="p-6 text-center">
      <BotaoVoltarDashboard />

      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
        <div className="w-full sm:w-auto text-left">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filtrar por turma:
          </label>
          {turmas.length === 1 && turmas[0].id === "todos" && (
            <p className="text-sm text-gray-500 mb-2">
              Nenhuma turma vinculada diretamente. Exibindo todos os alunos.
            </p>
          )}
          <select
            className="w-full sm:w-60 p-2 border rounded-md bg-black text-white text-sm"
            value={turmaSelecionada || "todos"}
            onChange={(e) => setTurmaSelecionada(e.target.value)}
          >
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.nome}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition"
        >
          {mostrarForm ? "Fechar" : "Cadastrar Aluno"}
        </button>
      </div>

      <AlunoList
        alunos={alunosFiltrados}
        carregando={carregando}
        onVerMais={abrirFichaCompleta}
        onEditar={(aluno) => {
          setModoEdicao(aluno);
          setMostrarForm(true);
        }}
        alunoSelecionado={alunoSelecionado}
        fecharModal={() => setAlunoSelecionado(null)}
        onExcluido={() => {
          setAlunoSelecionado(null);
          carregarAlunos();
        }}
      />
    </div>
  );
}

export default Alunos;
