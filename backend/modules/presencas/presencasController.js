const logger = require('../../utils/logger');
const service = require('./presencasService');

/**
 * GET /api/presencas?turma_id=1&data=2025-08-09
 */
exports.listarPorTurmaEData = async (req, res) => {
  try {
    const { turma_id, data } = req.query;
    if (!turma_id || !data) {
      return res.status(400).json({ erro: 'turma_id e data são obrigatórios' });
    }

    const result = await service.listarPorTurmaEData({
      user: req.user,
      turma_id: Number(turma_id),
      data,
    });

    res.json(result);
  } catch (e) {
    logger.error(e);
    return res.status(e.status || 500).json({
      erro: e.message || 'Falha ao listar presenças',
    });
  }
};

/**
 * POST /api/presencas/batch
 * Body: { turma_id, data, itens: [{ aluno_id, status }] }
 */
exports.salvarBatch = async (req, res) => {

  try {
    const { turma_id, data, itens } = req.body;
    if (!turma_id || !data || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({ erro: 'turma_id, data e itens[] são obrigatórios' });
    }

    const result = await service.salvarBatch({
      user: req.user,              // (mantém igual ao seu middleware)
      turma_id: Number(turma_id),
      data,
      itens,
    });

    // antes: { ok: true, mensagem: 'Presenças salvas' }
    return res.status(201).json(result); // agora devolve { ok, upsert }
  } catch (e) {
    logger.error(e);
    return res.status(e.status || 500).json({
      erro: e.message || 'Falha ao salvar presenças',
    });
  }
};

/**
 * PUT /api/presencas/:id
 * Body: { status, observacao }
 */
exports.atualizarUma = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status, observacao } = req.body;

    if (!id || (!status && typeof observacao === 'undefined')) {
      return res
        .status(400)
        .json({ erro: 'id e (status ou observacao) são obrigatórios' });
    }

    await service.atualizarUma({
      user: req.user,
      id,
      status,
      observacao,
    });

    return res.json({ ok: true });
  } catch (e) {
    logger.error(e);
    return res.status(e.status || 500).json({
      erro: e.message || 'Falha ao atualizar presença',
    });
  }
};

/**
 * GET /api/presencas/relatorio?inicio=YYYY-MM-DD&fim=YYYY-MM-DD
 * Admin -> todas as turmas; Instrutor -> apenas próprias turmas
 */
exports.relatorioPorPeriodo = async (req, res) => {
  try {
    const { inicio, fim } = req.query;
    if (!inicio || !fim) {
      return res.status(400).json({ erro: 'inicio e fim são obrigatórios' });
    }

    const result = await service.relatorioPorPeriodo({
      user: req.user,
      inicio,
      fim,
    });

    return res.json(result);
  } catch (e) {
    logger.error(e);
    return res.status(e.status || 500).json({
      erro: e.message || 'Falha ao gerar relatório',
    });
  }
};
