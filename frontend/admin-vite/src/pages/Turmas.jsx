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
  const { turmas, carregando, carregarTurmas } = useTurmas();

  useEffect(() => {
    carregarTurmas();
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-cor-primaria mb-4">Turmas</h1>

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
    }
  `}
      >
        <IoMdAdd size={20} />
        {mostrarForm ? "Cancelar" : "Criar nova turma"}
      </button>

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

      {modalEncerrarAberto && turmaSelecionada && (
        <ModalEncerrarTurma
          turma={turmaSelecionada}
          turmas={turmas}
          onClose={() => {
            setModalEncerrarAberto(false);
            setTurmaSelecionada(null);
          }}
          onSucesso={() => {
            carregarTurmas();
          }}
        />
      )}
    </div>
  );
}
