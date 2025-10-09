import api from "../api";

/**
 * Envia dados de pré-matrícula pública
 */
export async function enviarPreMatricula(dados) {
  try {
    const { data } = await api.post("/public/pre-matriculas", dados);
    return data;
  } catch (err) {
    throw new Error(
      err.response?.data?.error || "Erro ao enviar pré-matrícula. Tente novamente."
    );
  }
}

/**
 * Busca o grupo (nome) da organização para exibir no formulário
 */
export async function buscarGrupo(organizacaoId) {
  try {
    const { data } = await api.get(`/public/matricula/grupo/${organizacaoId}`);
    return data.grupo;
  } catch (err) {
    throw new Error("Erro ao buscar grupo da organização.");
  }
}
