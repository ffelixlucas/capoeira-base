// src/pages/Horarios.jsx

import React, { useState } from 'react';
import useHorarios from '../hooks/useHorarios';
import HorarioList from '../components/horarios/HorarioList';
import HorarioForm from '../components/horarios/HorarioForm';
import { toast } from 'react-toastify';

function Horarios() {
  const {
    horarios,
    carregando,
    adicionarHorario,
    editarHorario,
    removerHorario,
  } = useHorarios();

  const [modoEdicao, setModoEdicao] = useState(false);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);

  // 🟢 Abrir form para criar novo
  const handleNovo = () => {
    setHorarioSelecionado(null);
    setModoEdicao(true);
  };

  // ✏️ Abrir form para editar
  const handleEditar = (item) => {
    setHorarioSelecionado(item);
    setModoEdicao(true);
  };

  // 🗑️ Remover
  const handleExcluir = async (id) => {
    if (confirm('Deseja realmente excluir este horário?')) {
      try {
        await removerHorario(id);
        toast.success('Horário excluído com sucesso');
      } catch (err) {
        toast.error('Erro ao excluir horário');
      }
    }
  };

  // 💾 Salvar (criar ou editar)
  const handleSalvar = async (dados) => {
    try {
      if (horarioSelecionado) {
        await editarHorario(horarioSelecionado.id, dados);
        toast.success('Horário atualizado com sucesso');
      } else {
        await adicionarHorario(dados);
        toast.success('Horário criado com sucesso');
      }
      setModoEdicao(false);
      setHorarioSelecionado(null);
    } catch (err) {
      toast.error('Erro ao salvar horário');
    }
  };

  // 🚫 Cancelar form
  const handleCancelar = () => {
    setModoEdicao(false);
    setHorarioSelecionado(null);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Horários</h1>
        {!modoEdicao && (
          <button
            onClick={handleNovo}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Novo Horário
          </button>
        )}
      </div>

      {modoEdicao ? (
        <HorarioForm
          onSubmit={handleSalvar}
          onCancel={handleCancelar}
          dadosIniciais={horarioSelecionado}
        />
      ) : (
        <HorarioList
          horarios={horarios}
          carregando={carregando}
          onEditar={handleEditar}
          onExcluir={handleExcluir}
        />
      )}
    </div>
  );
}

export default Horarios;
