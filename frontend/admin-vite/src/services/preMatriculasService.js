// src/services/preMatriculasService.js
import api from "./api";

/**
 * Lista todas as pré-matrículas pendentes de uma organização
 */
export async function listarPendentes(organizacaoId) {
  const { data } = await api.get(
    `/public/admin/pre-matriculas/pendentes/${organizacaoId}`
  );
  return data || [];
}

/**
 * Atualiza o status de uma pré-matrícula (aprovar ou rejeitar)
 */
export async function atualizarStatusPreMatricula(id, status) {
  const { data } = await api.patch(`/public/admin/pre-matriculas/${id}/status`, {
    status,
  });
  return data;
}
