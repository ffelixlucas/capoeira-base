import React, { useState } from "react";
import EquipeList from "../components/equipe/EquipeList";
import EquipeForm from "../components/equipe/EquipeForm";

function Equipe() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [membroSelecionado, setMembroSelecionado] = useState(null);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestão da Equipe</h1>
        <button
          onClick={() => {
            setMembroSelecionado(null); // ← limpa antes de novo cadastro
            setMostrarForm(true);
          }}
          className="bg-cor-primaria text-white px-4 py-2 rounded-lg text-sm hover:bg-cor-primaria/90 transition"
        >
          + Novo Membro
        </button>
      </div>

      <EquipeList
        onEditar={(membro) => {
          setMembroSelecionado(membro);
          setMostrarForm(true);
        }}
      />

      {mostrarForm && (
        <EquipeForm
          onClose={() => {
            setMostrarForm(false);
            setMembroSelecionado(null);
          }}
          membroSelecionado={membroSelecionado}
        />
      )}
    </div>
  );
}

export default Equipe;
