import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useEffect } from "react";
import useHorarios from "../hooks/useHorarios";
import HorarioList from "../components/horarios/HorarioList";
import HorarioForm from "../components/horarios/HorarioForm";
import { toast } from "react-toastify";
import { logger } from "../utils/logger";

function Horarios() {
  const {
    horarios,
    carregando,
    adicionarHorario,
    editarHorario,
    removerHorario,
    atualizarVariosHorarios, // 🔥 precisa existir no hook/useHorarios
  } = useHorarios();

  const [modoEdicao, setModoEdicao] = useState(false);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);

  const { token } = useAuth();
  const [equipe, setEquipe] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/equipe`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setEquipe(data))
      .catch((err) => logger.error("Erro ao buscar equipe:", err));
  }, [token]);

  // 🔥 Ordena os horários pela ordem
  const horariosOrdenados = [...horarios].sort(
    (a, b) => (a.ordem || 999) - (b.ordem || 999)
  );

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
    if (confirm("Deseja realmente excluir este horário?")) {
      try {
        await removerHorario(id);
        toast.success("Horário excluído com sucesso");
      } catch (err) {
        toast.error("Erro ao excluir horário");
      }
    }
  };

  // 💾 Salvar (criar ou editar)
  const handleSalvar = async (dados) => {
    try {
      if (horarioSelecionado) {
        await editarHorario(horarioSelecionado.id, dados);
        toast.success("Horário atualizado com sucesso");
      } else {
        await adicionarHorario(dados);
        toast.success("Horário criado com sucesso");
      }
      setModoEdicao(false);
      setHorarioSelecionado(null);
    } catch (err) {
      toast.error("Erro ao salvar horário");
    }
  };

  // 🚫 Cancelar form
  const handleCancelar = () => {
    setModoEdicao(false);
    setHorarioSelecionado(null);
  };

  // 🔥 Gerenciar ordem de exibição

  const moverParaCima = (index) => {
    if (index === 0) return;
    const novaOrdem = [...horariosOrdenados];
    [novaOrdem[index - 1], novaOrdem[index]] = [
      novaOrdem[index],
      novaOrdem[index - 1],
    ];
    salvarNovaOrdem(novaOrdem);
  };

  const moverParaBaixo = (index) => {
    if (index === horariosOrdenados.length - 1) return;
    const novaOrdem = [...horariosOrdenados];
    [novaOrdem[index], novaOrdem[index + 1]] = [
      novaOrdem[index + 1],
      novaOrdem[index],
    ];
    salvarNovaOrdem(novaOrdem);
  };

  const salvarNovaOrdem = async (lista) => {
    const listaComOrdem = lista.map((item, index) => ({
      ...item,
      ordem: index + 1,
    }));

    try {
      await atualizarVariosHorarios(listaComOrdem);
      toast.success("Ordem atualizada com sucesso");
    } catch (err) {
      logger.error(err);
      toast.error("Erro ao atualizar ordem");
    }
  };

  return (
    <div className="p-4 space-y-4">

      {/* Título e botão de novo horário */}
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-bold">Ordem de Exibição</h1>
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
          horarios={horariosOrdenados}
          equipe={equipe} 
          carregando={carregando}
          onEditar={handleEditar}
          onExcluir={handleExcluir}
          onMoverCima={moverParaCima}
          onMoverBaixo={moverParaBaixo}
        />
      )}
    </div>
  );
}

export default Horarios;
