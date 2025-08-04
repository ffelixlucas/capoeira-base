import axios from "axios";

export async function gerarPagamentoPix(dados) {
    const response = await axios.post("/api/public/inscricoes/pagamento", dados);
    return response.data;
  }
  
