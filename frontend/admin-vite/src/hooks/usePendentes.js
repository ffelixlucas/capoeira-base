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

  // 🔹 Atualiza status genérico (aprovado ou rejeitado)
  async function atualizarStatus(id, status) {
    try {
      const res = await atualizarStatusPreMatricula(id, status);

      if (res?.sucesso) {
        // Remove instantaneamente da lista
        setPendentes((prev) => prev.filter((a) => a.id !== id));

        if (status === "aprovado") {
          toast.success(res.mensagem || "Pré-matrícula aprovada!");
        } else if (status === "rejeitado") {
          toast.info(res.mensagem || "Pré-matrícula rejeitada.");
        }
      } else {
        // Backend respondeu sem sucesso explícito
        throw new Error(res?.erro || "Falha ao atualizar status.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.erro ||
        err.message ||
        "Erro ao atualizar status da pré-matrícula.";
      toast.error(msg);
      console.error("❌ Erro ao atualizar status:", err);
    }
  }

  // 🔹 Funções específicas que usam o genérico
  const aprovarAluno = (id) => atualizarStatus(id, "aprovado");
  const rejeitarAluno = (id) => atualizarStatus(id, "rejeitado");

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
