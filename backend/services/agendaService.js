const agendaRepository = require('../repositories/agendaRepository');

const listarEventos = async () => {
  return await agendaRepository.listarEventos();
};

const criarEvento = async (dados, usuarioId) => {
  if (!dados.titulo || !dados.data_inicio) {
    throw new Error('Título e data de início são obrigatórios.');
  }

  const evento = {
    ...dados,
    criado_por: usuarioId || null
  };

  const id = await agendaRepository.criarEvento(evento);
  return { id };
};

const excluirEvento = async (id) => {
  const sucesso = await agendaRepository.excluirEvento(id);
  if (!sucesso) {
    throw new Error('Evento não encontrado ou já removido.');
  }
  return true;
};

module.exports = {
  listarEventos,
  criarEvento,
  excluirEvento,
};
