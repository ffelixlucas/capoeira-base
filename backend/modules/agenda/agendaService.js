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
    throw new Error('Imagem não encontrada no corpo da requisição.');
  }

  // 1. Gerar nome único no Firebase
  const nomeArquivo = `eventos/${uuidv4()}-${imagem.originalname}`;
  const file = bucket.file(nomeArquivo);

  // 2. Upload direto com .save()
  await file.save(imagem.buffer, {
    metadata: { contentType: imagem.mimetype },
  });

  const imagem_url = `https://storage.googleapis.com/${bucket.name}/${nomeArquivo}`;

  // 3. Cria o evento passando a imagem
  const evento = {
    ...dados,
    imagem_url
  };

  const id = await agendaRepository.criarEvento({
    ...evento,
    criado_por: usuarioId || null
  });

  return { id, imagem_url };
}

const excluirEvento = async (id) => {
  const sucesso = await agendaRepository.excluirEvento(id);
  if (!sucesso) {
    throw new Error("Evento não encontrado ou já removido.");
  }
  return true;
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
