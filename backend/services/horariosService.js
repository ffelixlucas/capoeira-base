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
  const { turma, dias, horario, faixa_etaria, instrutor, whatsapp_instrutor } = dados;

  if (!turma || !dias || !horario || !faixa_etaria) {
    throw new Error('Campos obrigatórios: turma, dias, horário e faixa etária');
  }

  return await horariosRepository.createHorario({
    turma,
    dias,
    horario,
    faixa_etaria,
    ordem: dados.ordem || null,
    instrutor: instrutor || null,
    whatsapp_instrutor: whatsapp_instrutor || null
  });
}

// Atualizar horário existente
async function atualizarHorario(id, dados) {
  if (!id) throw new Error('ID é obrigatório');

  const { turma, dias, horario, faixa_etaria, instrutor, whatsapp_instrutor } = dados;

  if (!turma || !dias || !horario || !faixa_etaria) {
    throw new Error('Campos obrigatórios: turma, dias, horário e faixa etária');
  }

  return await horariosRepository.updateHorario(id, {
    turma,
    dias,
    horario,
    faixa_etaria,
    ordem: dados.ordem || null,
    instrutor: instrutor || null,
    whatsapp_instrutor: whatsapp_instrutor || null
  });
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
