import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "react-router-dom";

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
import { RefreshCcw, UserPlus, Bell } from "lucide-react";

import ModalSelecionarRelatorio from "../components/relatorios/ModalSelecionarRelatorio";
import ModalRelatorioGeralAlunos from "../components/relatorios/ModalRelatorioGeralAlunos";
import ModalRelatorioPresencasTurma from "../components/relatorios/ModalRelatorioPresencasTurma";
import ModalRelatorioIndividualAluno from "../components/relatorios/ModalRelatorioIndividualAluno";
import ModalRelatorioFaltasCronicas from "../components/relatorios/ModalRelatorioFaltasCronicas";

function Alunos() {
  const { token, usuario, carregando: carregandoAuth } = useAuth(); // 👈 pega estado global do Auth
  const location = useLocation();

  const [mostrarForm, setMostrarForm] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  const [busca, setBusca] = useState("");
  const { alunos, carregando, carregarAlunos } = useAlunos();
  const {
    turmas,
    turmaSelecionada,
    setTurmaSelecionada,
    carregando: carregandoTurmas,
  } = useMinhasTurmas(usuario);

  // ✅ Aguarda AuthContext pronto antes de buscar alunos
  useEffect(() => {
    if (carregandoAuth || !token || !usuario) return;
    carregarAlunos();
  }, [carregandoAuth, token, usuario]);

  const [contadorPendentes, setContadorPendentes] = useState(0);
  const [mostrarPendentes, setMostrarPendentes] = useState(false);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [mostrarGuiaTrocaTurma, setMostrarGuiaTrocaTurma] = useState(false);

  const [mostrarModalRelatorios, setMostrarModalRelatorios] = useState(false);
  const [mostrarRelatorioGeral, setMostrarRelatorioGeral] = useState(false);
  const [mostrarRelatorioPresencas, setMostrarRelatorioPresencas] =
    useState(false);
  const [mostrarRelatorioIndividual, setMostrarRelatorioIndividual] =
    useState(false);
  const [mostrarRelatorioFaltas, setMostrarRelatorioFaltas] = useState(false);

  useEffect(() => {
    if (usuario?.roles?.includes("admin")) {
      api
        .get(`/public/admin/pre-matriculas/pendentes/${usuario.organizacao_id}`)
        .then(({ data }) => setContadorPendentes(data.length || 0))
        .catch(() => toast.error("Erro ao carregar pré-matrículas pendentes"));
    }
  }, [usuario]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const acao = params.get("acao");
    const turmaFromQuery = params.get("turma");

    if (acao === "trocar-turma") {
      setMostrarGuiaTrocaTurma(true);
    }

    if (turmaFromQuery && turmas.length > 0) {
      const existe = turmas.some((t) => String(t.id) === String(turmaFromQuery));
      if (existe) {
        setTurmaSelecionada(String(turmaFromQuery));
      }
    }
  }, [location.search, turmas, setTurmaSelecionada]);

  async function atualizarContadorPendentes() {
    try {
      const { data } = await api.get(
        `/public/admin/pre-matriculas/pendentes/${usuario.organizacao_id}`
      );
      setContadorPendentes(data.length || 0);
      setUltimaAtualizacao(new Date());
      await carregarAlunos();
      toast.success("Dados atualizados com sucesso");
    } catch {
      toast.error("Erro ao atualizar dados");
    }
  }

  async function abrirFichaCompleta(item) {
    // 🟢 Se for uma pré-matrícula pendente, monta ficha local
    if (item.status === "pendente") {
      const dadosFicha = [
        { label: "Nome", valor: item.nome },
        { label: "E-mail", valor: item.email || "-" },
        {
          label: "Telefone",
          valor:
            item.telefone_aluno ||
            item.telefone ||
            item.telefone_responsavel ||
            "-",
        },
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
    <div className="p-0 m-0 w-full">
      {mostrarGuiaTrocaTurma && (
        <div className="mb-3 rounded-xl border border-amber-300/40 bg-amber-100/10 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-amber-200">
                Guia rápido: corrigir turma de aluno
              </p>
              <p className="text-xs text-amber-100/85 mt-1">
                1. Encontre o aluno na lista.
              </p>
              <p className="text-xs text-amber-100/85">
                2. Clique em <strong>Editar</strong>.
              </p>
              <p className="text-xs text-amber-100/85">
                3. Altere o campo <strong>Turma</strong> e salve.
              </p>
              <p className="text-xs text-amber-100/85">
                4. Volte na Chamada para confirmar a turma correta.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMostrarGuiaTrocaTurma(false)}
              className="text-xs rounded-lg border border-amber-300/40 px-2 py-1 text-amber-100 hover:bg-amber-200/10 transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

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

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          {/* 🔹 Barra de ações — duas linhas, layout equilibrado */}
          <div className="flex flex-col items-center sm:items-start w-full gap-2 mt-2">
            {/* Linha principal */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 w-full">
              {/* Cadastrar aluno */}
              <button
                onClick={() => setMostrarForm(!mostrarForm)}
                className="flex items-center justify-center gap-2 bg-cor-primaria hover:bg-cor-destaque text-black px-4 py-2 rounded-md text-sm font-medium transition-all active:scale-[0.97]"
              >
                <UserPlus size={16} /> {mostrarForm ? "Fechar" : "Cadastrar"}
              </button>

              {/* Pré-matrículas pendentes */}
              {usuario?.roles?.includes("admin") && (
                <button
                  onClick={() => setMostrarPendentes(true)}
                  className="relative flex items-center justify-center gap-2 bg-cor-primaria hover:bg-cor-destaque text-black px-4 py-2 rounded-md text-sm font-medium transition-all active:scale-[0.97]"
                >
                  <Bell size={16} /> Pré-Matrículas
                  {contadorPendentes > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                      {contadorPendentes}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => setMostrarModalRelatorios(true)}
                className="flex items-center justify-center gap-2 bg-cor-primaria hover:bg-cor-destaque text-black px-4 py-2 rounded-md text-sm font-medium transition-all active:scale-[0.97]"
              >
                📄 Relatórios
              </button>
            </div>

            {/* Linha secundária — Atualizar + hora */}
            <div className="flex items-center justify-center sm:justify-start gap-2 w-full">
              <button
                onClick={atualizarContadorPendentes}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-xs font-medium transition-all active:scale-[0.97]"
              >
                <RefreshCcw size={14} className="text-gray-600" /> Atualizar
              </button>

              {ultimaAtualizacao && (
                <span className="text-xs text-gray-400 italic whitespace-nowrap">
                  Última atualização{" "}
                  {ultimaAtualizacao.toLocaleTimeString("pt-BR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
            </div>
          </div>
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
        onEditar={async (aluno) => {
          try {
            const alunoCompleto = await buscarAluno(aluno.id);
            console.log(alunoCompleto);
            setModoEdicao(alunoCompleto);
            setMostrarForm(true);
          } catch {
            toast.error("Erro ao carregar dados completos do aluno.");
          }
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

      <ModalSelecionarRelatorio
        aberto={mostrarModalRelatorios}
        onClose={() => setMostrarModalRelatorios(false)}
        onSelecionar={(tipo) => {
          setMostrarModalRelatorios(false);

          if (tipo === "geral") {
            setMostrarRelatorioGeral(true);
          }

          if (tipo === "presencas") {
            setTurmaSelecionada("todos"); // 👈 força "todas" ao abrir
            setMostrarRelatorioPresencas(true);
          }

          if (tipo === "individual") {
            setMostrarRelatorioIndividual(true);
          }

          if (tipo === "faltas") {
            setMostrarRelatorioFaltas(true);
          }
        }}
      />

      <ModalRelatorioGeralAlunos
        aberto={mostrarRelatorioGeral}
        onClose={() => setMostrarRelatorioGeral(false)}
        alunos={alunosFiltrados}
        turmas={turmas}
        turmaSelecionada={turmaSelecionada}
        onTrocarTurma={setTurmaSelecionada}
      />

      <ModalRelatorioPresencasTurma
        aberto={mostrarRelatorioPresencas}
        onClose={() => setMostrarRelatorioPresencas(false)}
        alunos={alunosFiltrados}
        turmas={turmas}
        turmaSelecionada={turmaSelecionada}
        onTrocarTurma={(id) => setTurmaSelecionada(id)}
      />

      <ModalRelatorioIndividualAluno
        aberto={mostrarRelatorioIndividual}
        onClose={() => setMostrarRelatorioIndividual(false)}
        alunos={alunosFiltrados}
        turmas={turmas}
        turmaSelecionada={turmaSelecionada}
        onTrocarTurma={setTurmaSelecionada}
      />

      <ModalRelatorioFaltasCronicas
        aberto={mostrarRelatorioFaltas}
        onClose={() => setMostrarRelatorioFaltas(false)}
        alunos={alunosFiltrados}
        turmas={turmas}
        turmaSelecionada={turmaSelecionada}
        onTrocarTurma={setTurmaSelecionada}
      />
    </div>
  );
}

export default Alunos;
