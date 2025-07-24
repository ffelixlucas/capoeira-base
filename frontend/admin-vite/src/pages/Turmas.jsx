import { useState, useEffect } from "react";
import { IoMdAdd } from "react-icons/io";
import BotaoVoltarDashboard from "../components/ui/BotaoVoltarDashboard";
import { useTurmas } from "../hooks/useTurmas";
import TurmaList from "../components/turmas/TurmaList";

export default function Turmas() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const { turmas, carregando, carregarTurmas } = useTurmas();

  useEffect(() => {
    carregarTurmas();
  }, []);

  return (
    <div className="p-4 max-w-md mx-auto">
      <BotaoVoltarDashboard />
      <h1 className="text-2xl font-bold text-cor-primaria mb-4">Turmas</h1>

      <button
        onClick={() => setMostrarForm(!mostrarForm)}
        className="flex items-center gap-2 bg-cor-primaria text-white px-4 py-2 rounded-md shadow w-full justify-center mb-4"
      >
        <IoMdAdd size={20} />
        {mostrarForm ? "Cancelar" : "Criar nova turma"}
      </button>

      {carregando ? (
        <p className="text-center text-gray-500">Carregando turmas...</p>
      ) : (
        <TurmaList turmas={turmas} />
      )}

      {mostrarForm && (
        <div className="mt-4">
          {/* Aqui entra o formulário TurmaForm futuramente */}
          <p className="text-center text-sm text-gray-400">
            [Formulário será exibido aqui]
          </p>
        </div>
      )}
    </div>
  );
}
