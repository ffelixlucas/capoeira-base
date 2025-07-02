const agendaService = require('./agendaService');

const formatarDataHora = (data) => {
  if (!data) return { data: null, horario: null };
  const d = new Date(data);
  return {
    data: d.toLocaleDateString("pt-BR"),
    horario: d.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};


const listarEventos = async (req, res) => {
  try {
    const eventos = await agendaService.listarEventos();

    const eventosFormatados = eventos.map((evento) => {
      const raw = typeof evento.data_inicio === "string"
      ? evento.data_inicio.replace(" ", "T")
      : evento.data_inicio?.toISOString?.() ?? null;
          const { data, horario } = formatarDataHora(raw);

      return {
        ...evento,
        data_inicio: raw, 
        data_formatada: data,
        horario_formatado: horario,
      };
    });

    res.json(eventosFormatados);
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao listar eventos.' });
  }
};



const criarEvento = async (req, res) => {
  try {
    const usuarioId = req.usuario?.id || null; // via verifyToken
    const idCriado = await agendaService.criarEvento(req.body, usuarioId);
    res.status(201).json({ mensagem: 'Evento criado com sucesso.', id: idCriado });
  } catch (error) {
    res.status(400).json({ erro: error.message });
  }
};

const excluirEvento = async (req, res) => {
  try {
    const sucesso = await agendaService.excluirEvento(req.params.id);
    if (sucesso) {
      res.json({ mensagem: 'Evento excluído com sucesso.' });
    } else {
      res.status(404).json({ erro: 'Evento não encontrado.' });
    }
  } catch (error) {
    res.status(500).json({ erro: 'Erro ao excluir evento.' });
  }
};

async function atualizarEvento(req, res) {
  const { id } = req.params;
  const dados = req.body;
  try {
    await agendaService.atualizarEvento(id, dados);
    res.status(200).json({ message: "Evento atualizado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar evento" });
  }
}


module.exports = {
  listarEventos,
  criarEvento,
  excluirEvento,
  atualizarEvento
};
