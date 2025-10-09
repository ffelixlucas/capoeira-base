// src/hooks/usePendentes.js
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  listarPendentes,
  atualizarStatusPreMatricula,
} from "../services/preMatriculasService";

export function usePendentes(organizacaoId = 1) {
  const [pendentes, setPendentes] = useState([]);
  const [carregando, setCarregando] = useState(false);

  // 🔹 Carrega lista de pré-matrículas pendentes
  async function carregarPendentes() {
    try {
      setCarregando(true);
      const lista = await listarPendentes(organizacaoId);
      setPendentes(lista || []);
    } catch (err) {
      toast.error("Erro ao carregar pré-matrículas pendentes");
    } finally {
      setCarregando(false);
    }
  }

  // 🔹 Aprovar pré-matrícula
  async function aprovarAluno(id) {
    try {
      await atualizarStatusPreMatricula(id, "aprovado");
      toast.success("Pré-matrícula aprovada! Matrícula criada com sucesso.");
      setPendentes((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error("Erro ao aprovar pré-matrícula");
    }
  }

  // 🔹 Rejeitar pré-matrícula
  async function rejeitarAluno(id) {
    try {
      await atualizarStatusPreMatricula(id, "rejeitado");
      toast.info("Pré-matrícula rejeitada.");
      setPendentes((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      toast.error("Erro ao rejeitar pré-matrícula");
    }
  }

  // 🔹 Carregar automaticamente ao montar o hook
  useEffect(() => {
    carregarPendentes();
  }, [organizacaoId]);

  return {
    pendentes,
    carregando,
    carregarPendentes,
    aprovarAluno,
    rejeitarAluno,
  };
}
