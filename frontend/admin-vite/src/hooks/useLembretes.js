import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  listarLembretes,
  criarLembrete,
  atualizarLembrete,
  excluirLembrete,
} from "../services/lembretesService";

export function useLembretes({ status = "" } = {}) {
  const [lembretes, setLembretes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    fetchLembretes();
  }, [status]);

  async function fetchLembretes() {
    try {
      setLoading(true);
      const data = await listarLembretes(status);
      setLembretes(data);
    } catch (err) {
      console.error(err);
      setErro("Erro ao carregar lembretes");
    } finally {
      setLoading(false);
    }
  }

  async function adicionar(dados) {
    await criarLembrete(dados);
    await fetchLembretes();
  }

  async function editar(id, dados) {
    const dadosFiltrados = {
      titulo: dados.titulo,
      descricao: dados.descricao,
      prioridade: dados.prioridade,
      status: dados.status,
      data: dados.data ? dados.data.split("T")[0] : null, // 👈 converte ISO para '2025-07-01'
    };

    console.log("Enviando dados para atualização:", dadosFiltrados);

    await atualizarLembrete(id, dadosFiltrados);
    await fetchLembretes();

    toast.success(
      dados.status === "feito"
        ? "Lembrete marcado como feito!"
        : "Lembrete marcado como pendente."
    );
  }

  async function remover(id) {
    await excluirLembrete(id);
    await fetchLembretes();
  }

  return {
    lembretes,
    loading,
    erro,
    adicionar,
    editar,
    remover,
    atualizar: fetchLembretes,
  };
}
