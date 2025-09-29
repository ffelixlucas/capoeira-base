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
