// Esse é só um mock por enquanto para testar a lista
export async function buscarInscritosPorEvento(eventoId) {
    // Simula chamada ao backend
    return Promise.resolve([
      {
        id: 1,
        nome: "João Silva",
        telefone: "41999999999",
        status: "pago",
      },
      {
        id: 2,
        nome: "Maria Souza",
        telefone: "41988888888",
        status: "pendente",
      },
    ]);
  }
  