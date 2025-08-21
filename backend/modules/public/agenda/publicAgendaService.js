const agendaRepository = require("../../agenda/agendaRepository");

// 🔹 Lista apenas eventos públicos (com_inscricao = true)
async function listarEventosPublicos() {
  const todosEventos = await agendaRepository.listarEventos();
  
  // Apenas eventos que podem aparecer ao público
  return todosEventos
    .filter((evento) => evento.com_inscricao === 1 || evento.com_inscricao === true)
    .map((evento) => ({
      id: evento.id,
      titulo: evento.titulo,
      descricao_curta: evento.descricao_curta,
      data_inicio: evento.data_inicio,
      valor: evento.valor,
      imagem_url: evento.imagem_url,
    }));
}

// 🔹 Busca um evento público por ID (somente se for com_inscricao = true)
async function buscarEventoPublicoPorId(id) {
  const evento = await agendaRepository.buscarPorId(id);

  const inscricaoAtiva =
    evento?.com_inscricao === 1 ||
    evento?.com_inscricao === true ||
    evento?.com_inscricao === "1";

  if (!evento || !inscricaoAtiva || evento.status !== "ativo") {
    return null;
  }

  // Retorna apenas campos públicos
  return {
    id: evento.id,
    titulo: evento.titulo,
    descricao_curta: evento.descricao_curta,
    descricao_completa: evento.descricao_completa,
    data_inicio: evento.data_inicio,
    valor: evento.valor,
    imagem_url: evento.imagem_url,
    local: evento.local,
    endereco: evento.endereco,             
    telefone_contato: evento.telefone_contato, 
    possui_camiseta: evento.possui_camiseta,
    configuracoes: evento.configuracoes || {},
  };
}

module.exports = {
  listarEventosPublicos,
  buscarEventoPublicoPorId,
};
