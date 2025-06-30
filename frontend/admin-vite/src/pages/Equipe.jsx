import React, { useState } from "react";
import EquipeList from "../components/equipe/EquipeList";
import EquipeForm from "../components/equipe/EquipeForm";
import { useAuth } from "../contexts/AuthContext";
import { useEquipe } from "../hooks/useEquipe";

function Equipe() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [membroSelecionado, setMembroSelecionado] = useState(null);
  const { membros, loading, erro, carregarEquipe } = useEquipe();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Gestão da Equipe</h1>
        <button
          onClick={() => {
            setMembroSelecionado(null);
            setMostrarForm(true);
          }}
          className="bg-cor-primaria text-white px-4 py-2 rounded-lg text-sm hover:bg-cor-primaria/90 transition"
        >
          + Novo Membro
        </button>
      </div>

      <EquipeList
        membros={membros}
        loading={loading}
        erro={erro}
        onEditar={(membro) => {
          setMembroSelecionado(membro);
          setMostrarForm(true);
        }}
        onAtualizar={carregarEquipe}
      />

      {mostrarForm && (
        <EquipeForm
          onClose={() => {
            setMostrarForm(false);
            setMembroSelecionado(null);
          }}
          onSave={() => {
            carregarEquipe();
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
