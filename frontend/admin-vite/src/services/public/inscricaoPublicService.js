import api from "../api";

export async function gerarPagamentoPix(dados) {
  try {
    const response = await api.post("/public/inscricoes/pagamento", dados);
    return response.data;
  } catch (error) {
    if (error.response?.data?.error === "Inscrição já realizada e paga.") {
      throw new Error("Este CPF já possui uma inscrição paga para este evento.");
    }
    throw new Error("Erro ao gerar pagamento. Tente novamente mais tarde.");
  }
}

export const buscarStatusInscricao = async (id) => {
  const { data } = await api.get(`/public/inscricoes/${id}`);
  return data;
};
