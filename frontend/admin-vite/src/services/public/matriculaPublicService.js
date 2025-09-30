import api from "../api";

/**
 * Envia dados de matrícula pública para o backend
 * @param {Object} dados - Dados do formulário (nome, nascimento, cpf, etc.)
 */
export async function enviarMatricula(dados) {
  try {
    const { data } = await api.post("/public/matricula", dados);
    return data;
  } catch (err) {
    // Se backend retornar mensagem de erro, repassa para o front
    throw new Error(
      err.response?.data?.error || "Erro ao enviar matrícula. Tente novamente."
    );
  }
}

export async function buscarGrupo(organizacaoId) {
  try {
    const { data } = await api.get(`/public/matricula/grupo/${organizacaoId}`);
    return data.grupo; // só o nome do grupo
  } catch (err) {
    throw new Error("Erro ao buscar grupo da organização.");
  }
}