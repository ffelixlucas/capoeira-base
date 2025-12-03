import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import api from "../services/api";
import {
  listarPendentes,
  atualizarStatusPreMatricula,
} from "../services/preMatriculasService";

export function usePendentes(organizacaoId = 1) {
  const [pendentes, setPendentes] = useState([]);
  const [carregando, setCarregando] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* 🔹 Carrega lista de pré-matrículas pendentes                                */
  /* -------------------------------------------------------------------------- */
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

  /* -------------------------------------------------------------------------- */
  /* 🔹 Aprovar pré-matrícula (fluxo NOVO administrativo)                       */
  /* -------------------------------------------------------------------------- */
  async function aprovarAluno(id, turmaId) {
    try {
      const { data } = await api.patch("admin/matricula/aprovar-pre", {
        pre_matricula_id: id,
        turma_id: turmaId,
      });

      toast.success("Pré-matrícula aprovada e aluno criado!");

      // Remove imediatamente da lista
      setPendentes((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      const msg =
        err.response?.data?.erro ||
        err.message ||
        "Erro ao aprovar pré-matrícula.";

      toast.error(msg);
      console.error("❌ Erro ao aprovar pré-matrícula:", err);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 🔹 Rejeitar pré-matrícula (fluxo antigo – permanece igual)                 */
  /* -------------------------------------------------------------------------- */
  async function rejeitarAluno(id) {
    try {
      const res = await atualizarStatusPreMatricula(id, "rejeitado");

      if (res?.sucesso) {
        toast.info(res.mensagem || "Pré-matrícula rejeitada.");
        setPendentes((prev) => prev.filter((a) => a.id !== id));
      } else {
        throw new Error(res?.erro || "Falha ao rejeitar pré-matrícula.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.erro ||
        err.message ||
        "Erro ao rejeitar pré-matrícula.";

      toast.error(msg);
      console.error("❌ Erro ao rejeitar pré-matrícula:", err);
    }
  }

  /* -------------------------------------------------------------------------- */
  /* 🔹 Carregar automaticamente ao montar                                       */
  /* -------------------------------------------------------------------------- */
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
