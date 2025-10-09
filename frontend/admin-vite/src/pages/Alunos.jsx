import { useState, useEffect } from "react";
import AlunoList from "../components/alunos/AlunoList";
import AlunoForm from "../components/alunos/AlunoForm";
import Busca from "../components/ui/Busca";
import ModalAlunoForm from "../components/alunos/ModalAlunoForm";
import ModalPendentes from "../components/alunos/ModalPendentes";
import { useAlunos } from "../hooks/useAlunos";
import { buscarAluno } from "../services/alunoService";
import { toast } from "react-toastify";
import { useMinhasTurmas } from "../hooks/useMinhasTurmas";
import api from "../services/api";

function Alunos() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  const [usuario] = useState(() => JSON.parse(localStorage.getItem("usuario")));
  const [busca, setBusca] = useState("");
  const { alunos, carregando, carregarAlunos } = useAlunos();
  const {
    turmas,
    turmaSelecionada,
    setTurmaSelecionada,
    carregando: carregandoTurmas,
  } = useMinhasTurmas(usuario);

  const [contadorPendentes, setContadorPendentes] = useState(0);
  const [mostrarPendentes, setMostrarPendentes] = useState(false);

  useEffect(() => {
    if (usuario?.roles?.includes("admin")) {
      api
        .get(`/public/admin/pre-matriculas/pendentes/${usuario.organizacao_id}`)
        .then(({ data }) => setContadorPendentes(data.length || 0))
        .catch(() => toast.error("Erro ao carregar pré-matrículas pendentes"));
    }
  }, [usuario]);

  async function atualizarContadorPendentes() {
    try {
      const { data } = await api.get(
        `/public/admin/pre-matriculas/pendentes/${usuario.organizacao_id}`
      );
      setContadorPendentes(data.length || 0);
    } catch {
      toast.error("Erro ao atualizar contador de pendentes");
    }
  }
  useEffect(() => {
    carregarAlunos();
  }, []);

  async function abrirFichaCompleta(item) {
    // 🟢 Se for uma pré-matrícula pendente, monta ficha local
    if (item.status === "pendente") {
      const dadosFicha = [
        { label: "Nome", valor: item.nome },
        { label: "E-mail", valor: item.email || "-" },
        { label: "Telefone", valor: item.telefone || "-" },
        {
          label: "Já treinou",
          valor: item.ja_treinou === "sim" ? "Sim" : "Não",
        },
        { label: "Grupo de origem", valor: item.grupo_origem || "-" },
        {
          label: "Observações médicas",
          valor: item.observacoes_medicas || "Não informado",
        },
        { label: "Status", valor: item.status },
      ];
  
      setAlunoSelecionado({
        ...item,
        dadosFicha,
        isPreMatricula: true,
      });
      return;
    }
  
    // 🔵 Caso contrário (aluno matriculado), busca normalmente
    try {
      const alunoCompleto = await buscarAluno(item.id);
      const anoAtual = new Date().getFullYear();
      const inicio = `${anoAtual}-01-01`;
      const fim = new Date().toISOString().split("T")[0];
      const { data: metricas } = await api.get(`/alunos/${item.id}/metricas`, {
        params: { inicio, fim },
      });
      setAlunoSelecionado({ ...alunoCompleto, metricas });
    } catch (err) {
      toast.error("Erro ao carregar ficha do aluno");
    }
  }
  

  const alunosFiltrados = alunos
    .filter((a) => {
      if (turmaSelecionada === "todos" || !turmaSelecionada) return true;
      if (turmaSelecionada === "sem_turma") return a.turma_id === null;
      return a.turma_id === Number(turmaSelecionada);
    })
    .filter((a) => {
      if (!busca) return true;
      const termo = busca.toLowerCase();
      return (
        a.nome.toLowerCase().includes(termo) ||
        (a.apelido && a.apelido.toLowerCase().includes(termo)) ||
        (a.turma && a.turma.toLowerCase().includes(termo))
      );
    });

  return (
    <div className="p-6 text-center">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-3">
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
            className="w-full sm:w-60 p-2 border rounded-md bg-white text-gray-800 text-sm"
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

        <div className="flex gap-2">
          <button
            onClick={() => setMostrarForm(!mostrarForm)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition"
          >
            {mostrarForm ? "Fechar" : "Cadastrar Aluno"}
          </button>

          {usuario?.roles?.includes("admin") && (
            <button
              onClick={() => setMostrarPendentes(true)}
              className="relative bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-md text-sm font-medium shadow-sm transition"
            >
              Pré-Matrículas Pendentes
              {contadorPendentes > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow">
                  {contadorPendentes}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      <Busca
        placeholder="Buscar por nome, apelido ou turma"
        onBuscar={setBusca}
      />

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

      {mostrarForm && (
        <ModalAlunoForm
          aberto={mostrarForm}
          onClose={() => {
            setMostrarForm(false);
            setModoEdicao(false);
          }}
          onCriado={carregarAlunos}
          alunoParaEdicao={modoEdicao}
        />
      )}

      {usuario?.roles?.includes("admin") && (
        <ModalPendentes
          aberto={mostrarPendentes}
          onClose={() => setMostrarPendentes(false)}
          onAtualizarContador={atualizarContadorPendentes}
          onAtualizarAlunos={carregarAlunos}
          onAbrirFicha={abrirFichaCompleta}
          organizacaoId={usuario.organizacao_id}
        />
      )}
    </div>
  );
}

export default Alunos;
