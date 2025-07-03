const bucket = require("../../config/firebase");
const { v4: uuidv4 } = require("uuid");
const agendaRepository = require("./agendaRepository");

const listarEventos = async () => {
  return await agendaRepository.listarEventos();
};

const criarEvento = async (dados, usuarioId) => {
  if (!dados.titulo || !dados.data_inicio) {
    throw new Error("Título e data de início são obrigatórios.");
  }

  const evento = {
    ...dados,
    criado_por: usuarioId || null,
  };

  const id = await agendaRepository.criarEvento(evento);
  return { id };
};

async function processarUploadEvento(imagem, dados, usuarioId) {
  if (!imagem) {
    throw new Error("Imagem não encontrada no corpo da requisição.");
  }

  const nomeArquivo = `eventos/${uuidv4()}-${imagem.originalname}`;
  const file = bucket.file(nomeArquivo);

  await file.save(imagem.buffer, {
    metadata: { contentType: imagem.mimetype },
  });

  const imagem_url = `https://storage.googleapis.com/${bucket.name}/${nomeArquivo}`;

  // ⬇️ Garante tipos corretos e campos esperados
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
    criado_por: usuarioId || null,
  };

  const id = await agendaRepository.criarEvento(evento);

  return { id, imagem_url };
}

const excluirEvento = async (id) => {
  const evento = await agendaRepository.buscarPorId(id);

  if (!evento) {
    throw new Error("Evento não encontrado ou já removido.");
  }

  // 🔥 Se houver imagem, deletar do Firebase
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

  const sucesso = await agendaRepository.excluirEvento(id);
  return sucesso;
};

async function atualizarEvento(id, dados) {
  return agendaRepository.atualizar(id, dados);
}

module.exports = {
  listarEventos,
  criarEvento,
  processarUploadEvento,
  excluirEvento,
  atualizarEvento,
};
