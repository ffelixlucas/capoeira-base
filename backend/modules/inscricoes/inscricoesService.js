const inscricoesRepository = require('./inscricoesRepository');

async function listarPorEvento(eventoId) {
  return inscricoesRepository.listarPorEvento(eventoId);
}

async function buscarPorId(id) {
  return inscricoesRepository.buscarPorId(id);
}

async function criarInscricao(dados) {
  return inscricoesRepository.criarInscricao(dados);
}

async function processarWebhook(payload) {
  return inscricoesRepository.atualizarStatus(payload);
}

// NOVO: atualização de inscrição
async function atualizarInscricao(id, dados) {
  // Campos permitidos
  const camposPermitidos = [
    'nome', 'apelido', 'telefone', 'email',
    'responsavel_nome', 'responsavel_contato', 'responsavel_parentesco',
    'alergias_restricoes', 'tamanho_camiseta'
  ];

  // Filtra apenas os campos permitidos
  const dadosFiltrados = {};
  for (const campo of camposPermitidos) {
    if (dados[campo] !== undefined) {
      dadosFiltrados[campo] = dados[campo];
    }
  }

  // Se não houver dados válidos, retorna erro
  if (Object.keys(dadosFiltrados).length === 0) {
    throw new Error('Nenhum campo válido para atualização');
  }

  return inscricoesRepository.atualizarInscricao(id, dadosFiltrados);
}

module.exports = {
  listarPorEvento,
  buscarPorId,
  criarInscricao,
  processarWebhook,
  atualizarInscricao 
};
