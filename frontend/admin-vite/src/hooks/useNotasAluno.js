// src/hooks/useNotasAluno.js
import api from "../services/api";
import { toast } from "react-toastify";
import { useState } from "react";

export function useNotasAluno(alunoId) {
  const [notas, setNotas] = useState([]);
  const [carregando, setCarregando] = useState(false);

  async function carregarNotas() {
    setCarregando(true);
    try {
      const res = await api.get(`/notas-aluno/${alunoId}`);
      setNotas(res.data);
    } catch (err) {
      toast.error("Erro ao carregar notas");
    } finally {
      setCarregando(false);
    }
  }

  async function adicionarNota(texto) {
    try {
      const res = await api.post(`/notas-aluno/${alunoId}`, { texto });
      setNotas((prev) => [res.data, ...prev]);
    } catch (err) {
      toast.error("Erro ao adicionar nota");
    }
  }

  async function removerNota(id) {
    try {
      await api.delete(`/notas-aluno/${id}`);
      setNotas((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      toast.error("Erro ao remover nota");
    }
  }

  return {
    notas,
    carregando,
    carregarNotas,
    adicionarNota,
    removerNota,
  };
}
