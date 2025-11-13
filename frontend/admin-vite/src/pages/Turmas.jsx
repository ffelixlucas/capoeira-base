import { useState, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import { useTurmas } from "../hooks/useTurmas";
import TurmaList from "../components/turmas/TurmaList";
import TurmaForm from "../components/turmas/TurmaForm";
import ModalEncerrarTurma from "../components/turmas/ModalEncerrarTurma";

export default function Turmas() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [turmaSelecionada, setTurmaSelecionada] = useState(null);
  const [modalEncerrarAberto, setModalEncerrarAberto] = useState(false);

  // Hook centralizado
  const { turmas, carregando, carregarTurmas, busca, setBusca } = useTurmas();

  useEffect(() => {
    carregarTurmas();
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto">
      {/* Título */}
      <h1 className="text-2xl font-bold text-cor-primaria mb-4 text-center">
        Turmas
      </h1>

      {/* Campo de busca */}
      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar por nome, faixa etária ou categoria..."
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-4 focus:ring-2 focus:ring-cor-primaria focus:outline-none"
      />

      {/* Botão principal */}
      <button
        onClick={() => {
          setMostrarForm(!mostrarForm);
          setTurmaSelecionada(null);
        }}
        className={`flex items-center gap-2 px-4 py-2 rounded-md shadow w-full justify-center mb-4 transition
          ${
            mostrarForm
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-cor-primaria text-white hover:bg-cor-primaria/90"
          }`}
      >
        <IoMdAdd size={20} />
        {mostrarForm ? "Cancelar" : "Criar nova turma"}
      </button>

      {/* Conteúdo principal */}
      {carregando ? (
        <p className="text-center text-gray-500">Carregando turmas...</p>
      ) : (
        <TurmaList
          turmas={turmas}
          onEditar={(turma) => {
            setTurmaSelecionada(turma);
            setMostrarForm(true);
          }}
          onExcluir={(turma) => {
            setTurmaSelecionada(turma);
            setModalEncerrarAberto(true);
          }}
        />
      )}

      {/* Formulário de criação/edição */}
      {mostrarForm && (
        <div className="mt-4">
          <TurmaForm
            turmaEditando={turmaSelecionada}
            onCriado={() => {
              carregarTurmas();
              setMostrarForm(false);
              setTurmaSelecionada(null);
            }}
          />
        </div>
      )}

      {/* Modal de encerramento */}
      {modalEncerrarAberto && turmaSelecionada && (
        <ModalEncerrarTurma
          turma={turmaSelecionada}
          turmas={turmas}
          onClose={() => {
            setModalEncerrarAberto(false);
            setTurmaSelecionada(null);
          }}
          onSucesso={() => carregarTurmas()}
        />
      )}
    </div>
  );
}
