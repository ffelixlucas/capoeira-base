import React, { useState } from "react";
import EquipeList from "../components/equipe/EquipeList";
import EquipeForm from "../components/equipe/EquipeForm";
import Busca from "../components/ui/Busca";
import { useAuth } from "../contexts/AuthContext";
import { useEquipe } from "../hooks/useEquipe";
import BotaoVoltarDashboard from "../components/ui/BotaoVoltarDashboard";

function Equipe() {
  const [mostrarForm, setMostrarForm] = useState(false);
  const [membroSelecionado, setMembroSelecionado] = useState(null);
  const [busca, setBusca] = useState("");
  const { membros, loading, erro, carregarEquipe } = useEquipe();

  const membrosFiltrados = membros.filter((membro) => {
    if (!busca) return true;
    const termo = busca.toLowerCase();
    return (
      membro.nome.toLowerCase().includes(termo) ||
      (membro.email && membro.email.toLowerCase().includes(termo)) ||
      (membro.telefone && membro.telefone.toLowerCase().includes(termo))
    );
  });

  return (
    <div className="p-4">
      <BotaoVoltarDashboard className="mb-4" />
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-2xl font-bold">Gestão da Equipe</h1>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMembroSelecionado(null);
              setMostrarForm(true);
            }}
            className="bg-cor-primaria text-white px-4 py-2 rounded-lg text-sm hover:bg-cor-primaria/90 transition"
          >
            + Novo Membro
          </button>
          <a
            href="/turmas"
            className="bg-white border border-cor-primaria text-cor-primaria px-4 py-2 rounded-lg text-sm hover:bg-cor-primaria hover:text-white transition"
          >
            Turmas
          </a>
        </div>
      </div>
      <div className="mb-3">
        <Busca
          placeholder="Buscar por nome, e-mail ou telefone"
          onBuscar={setBusca}
        />
      </div>

      <EquipeList
        membros={membrosFiltrados}
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
