import axios from "axios";

export async function gerarPagamentoPix(dados) {
  try {
    const response = await axios.post("/api/public/inscricoes/pagamento", dados);
    return response.data;
  } catch (error) {
    if (error.response?.data?.error === "Inscrição já realizada e paga.") {
      throw new Error("Este CPF já possui uma inscrição paga para este evento.");
    }

    throw new Error("Erro ao gerar pagamento. Tente novamente mais tarde.");
  }
}

  

  export const buscarStatusInscricao = async (id) => {
    const { data } = await axios.get(`/api/public/inscricoes/${id}`);
    return data;
  };