// src/pages/Alunos.jsx
import { useState, useEffect } from "react";
import BotaoVoltarDashboard from "../components/ui/BotaoVoltarDashboard";
import AlunoList from "../components/alunos/AlunoList";
import AlunoForm from "../components/alunos/AlunoForm";
import { useAlunos } from "../hooks/useAlunos";
import { buscarAluno } from "../services/alunoService";

function Alunos() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const { alunos, carregando, carregarAlunos } = useAlunos();
  const [modoEdicao, setModoEdicao] = useState(false);

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
    <div className="p-6 text-center">
      <BotaoVoltarDashboard />

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-900">Alunos</h1>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition"
        >
          {mostrarForm ? "Fechar" : "Cadastrar Aluno"}
        </button>
      </div>

      {mostrarForm && (
        <div className="mb-6">
          <AlunoForm
            aluno={modoEdicao}
            onCriado={() => {
              setMostrarForm(false);
              setModoEdicao(false);
              carregarAlunos();
            }}
          />
        </div>
      )}

      <AlunoList
        alunos={alunos}
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
