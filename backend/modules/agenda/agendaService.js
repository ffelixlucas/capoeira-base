const bucket = require("../../config/firebase");
const { v4: uuidv4 } = require("uuid");
const agendaRepository = require("./agendaRepository");

const listarEventos = async (status) => {
  const eventos = await agendaRepository.listarEventos(status);

  return eventos.map((e) => ({
    ...e,
    configuracoes: e.configuracoes
      ? typeof e.configuracoes === "string"
        ? JSON.parse(e.configuracoes)
        : e.configuracoes
      : {}, // se for null, devolve objeto vazio
  }));
};


const criarEvento = async (dados, usuarioId) => {
  if (!dados.titulo || !dados.data_inicio) {
    throw new Error("Título e data de início são obrigatórios.");
  }

  // Garantimos que os campos novos estejam presentes
  const evento = {
    titulo: dados.titulo,
    descricao_curta: dados.descricao_curta || "",
    descricao_completa: dados.descricao_completa || "",
    local: dados.local || "",
    endereco: dados.endereco || "",
    telefone_contato: dados.telefone_contato || "",
    data_inicio: dados.data_inicio,
    data_fim: dados.data_fim || null,
    imagem_url: dados.imagem_url || null,
    com_inscricao: dados.com_inscricao || false,
    valor: dados.valor || 0,
    responsavel_id: dados.responsavel_id || null,
    configuracoes: dados.configuracoes || {},
    criado_por: usuarioId || null,
    possui_camiseta: parseInt(dados.possui_camiseta) === 1 ? 1 : 0
  };

  const id = await agendaRepository.criarEvento(evento);
  return { id };
};

async function processarUploadEvento(imagem, dados, usuarioId) {
  let imagem_url = null;

  if (imagem) {
    const nomeArquivo = `eventos/${uuidv4()}-${imagem.originalname}`;
    const file = bucket.file(nomeArquivo);
  
    await file.save(imagem.buffer, {
      metadata: { contentType: imagem.mimetype },
    });
  
    imagem_url = `https://storage.googleapis.com/${bucket.name}/${nomeArquivo}`;
  }

  const evento = {
    titulo: dados.titulo || "",
    descricao_curta: dados.descricao_curta || "",
    descricao_completa: dados.descricao_completa || "",
    local: dados.local || "",
    endereco: dados.endereco || "",
    telefone_contato: dados.telefone_contato || "",
    data_inicio: dados.data_inicio || null,
    data_fim: dados.data_fim || null,
    imagem_url,
    com_inscricao: dados.com_inscricao || false,
    valor: dados.valor || 0,
    responsavel_id: dados.responsavel_id || null,
    configuracoes: dados.configuracoes || {},
    criado_por: usuarioId || null,
    possui_camiseta: parseInt(dados.possui_camiseta) === 1 ? 1 : 0
  };

  const id = await agendaRepository.criarEvento(evento);
  return { id, imagem_url };
}

const excluirEvento = async (id) => {
  const evento = await agendaRepository.buscarPorId(id);

  if (!evento) {
    throw new Error("Evento não encontrado ou já removido.");
  }

  // Deletar imagem do Firebase se houver
  if (evento.imagem_url) {
    const caminho = decodeURIComponent(
      new URL(evento.imagem_url).pathname.replace(/^\/[^/]+\//, "")
    );

    try {
      await bucket.file(caminho).delete();
      console.log("🗑️ Imagem do evento excluída do Firebase:", caminho);
    } catch (error) {
      console.warn("⚠️ Erro ao excluir imagem do evento:", error.message);
    }
  }

  return await agendaRepository.excluirEvento(id);
};

async function atualizarEvento(id, dados) {
  // Garante que todos os campos tenham valor padrão
  const evento = {
    titulo: dados.titulo ?? "",
    descricao_curta: dados.descricao_curta ?? "",
    descricao_completa: dados.descricao_completa ?? "",
    local: dados.local ?? "",
    endereco: dados.endereco ?? "",
    telefone_contato: dados.telefone_contato ?? "",
    data_inicio: dados.data_inicio ?? null,
    data_fim: dados.data_fim ?? null,
    imagem_url: dados.imagem_url ?? null,
    com_inscricao: dados.com_inscricao ?? false,
    valor: dados.valor ?? 0,
    responsavel_id: dados.responsavel_id ?? null,
    configuracoes: dados.configuracoes ?? {},
    possui_camiseta: parseInt(dados.possui_camiseta) === 1 ? 1 : 0
  };

  return agendaRepository.atualizar(id, evento);
}

async function atualizarStatus(id, status) {
  return agendaRepository.atualizarStatus(id, status);
}

module.exports = {
  listarEventos,
  criarEvento,
  processarUploadEvento,
  excluirEvento,
  atualizarEvento,
  atualizarStatus
};
