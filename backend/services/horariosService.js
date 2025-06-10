const horariosRepository = require('../repositories/horariosRepository');

// Buscar todos os horários
async function listarHorarios() {
  return await horariosRepository.getHorarios();
}

// Buscar um horário específico
async function obterHorarioPorId(id) {
  if (!id) throw new Error('ID é obrigatório');
  return await horariosRepository.getHorarioById(id);
}

// Criar novo horário
async function criarHorario(dados) {
  const { turma, dias, horario, faixa_etaria } = dados;
  if (!turma || !dias || !horario || !faixa_etaria) {
    throw new Error('Todos os campos são obrigatórios');
  }
  return await horariosRepository.createHorario(dados);
}

// Atualizar horário existente
async function atualizarHorario(id, dados) {
  if (!id) throw new Error('ID é obrigatório');
  return await horariosRepository.updateHorario(id, dados);
}

// Excluir horário
async function excluirHorario(id) {
  if (!id) throw new Error('ID é obrigatório');
  return await horariosRepository.deleteHorario(id);
}

module.exports = {
  listarHorarios,
  obterHorarioPorId,
  criarHorario,
  atualizarHorario,
  excluirHorario,
};
