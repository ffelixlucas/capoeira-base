import api from "../api";

/**
 * Envia dados de pré-matrícula pública
 * Aceita tanto `organizacao_id` quanto `slug`
 */
export async function enviarPreMatricula(dados, slug) {
  try {
    // 🧭 Decide o endpoint conforme a origem
    const endpoint = slug
      ? `/public/pre-matriculas/${slug}` // nova rota com slug
      : `/public/pre-matriculas`;        // rota tradicional com organizacao_id

    const { data } = await api.post(endpoint, dados);
    return data;
  } catch (err) {
    console.error("❌ Erro ao enviar pré-matrícula:", err);
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

/**
 * Valida CPF em tempo real
 * Verifica em pré-matrículas e alunos
 */
export async function validarCpf(cpf, slug) {
  try {
    const { data } = await api.get(`/public/pre-matriculas/validar-cpf`, {
      params: { cpf, slug }
    });

    return data; // { existe: boolean, tipo?, mensagem? }
  } catch (err) {
    console.error("❌ Erro ao validar CPF:", err);
    throw new Error("Erro ao validar CPF.");
  }
}
