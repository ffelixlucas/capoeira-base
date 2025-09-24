import { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-toastify";

export function usePendentes() {
  const [pendentes, setPendentes] = useState([]);
  const [carregando, setCarregando] = useState(false);

  async function carregarPendentes() {
    try {
      setCarregando(true);
      const { data } = await api.get("/alunos/pendentes");
      setPendentes(data);
    } catch (err) {
      toast.error("Erro ao carregar matrículas pendentes");
    } finally {
      setCarregando(false);
    }
  }

  async function aprovarAluno(id) {
    try {
      await api.patch(`/alunos/${id}/status`, { status: "ativo" });
      toast.success("Aluno aprovado com sucesso!");
      // remove da lista local
      setPendentes((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error("Erro ao aprovar aluno");
    }
  }

  async function rejeitarAluno(id) {
    try {
      await api.patch(`/alunos/${id}/status`, { status: "inativo" });
      toast.success("Aluno rejeitado e removido.");
      // remove da lista local
      setPendentes((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error("Erro ao rejeitar aluno");
    }
  }

  // Carrega logo ao montar
  useEffect(() => {
    carregarPendentes();
  }, []);

  return {
    pendentes,
    carregando,
    carregarPendentes,
    aprovarAluno,
    rejeitarAluno,
  };
}
