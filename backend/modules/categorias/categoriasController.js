// modules/categorias/categoriasController.js
const categoriasService = require("./categoriasService");
const { logger } = require("../../utils/logger.js");

async function listarTodas(req, res) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const categorias = await categoriasService.listarTodas(organizacaoId);

    return res.json({ sucesso: true, data: categorias });
  } catch (err) {
    logger.error("[categoriasController] listarTodas", err);
    return res
      .status(500)
      .json({ sucesso: false, erro: "Erro ao listar categorias" });
  }
}

async function criar(req, res) {
  try {
    const organizacaoId = req.usuario.organizacao_id;
    const { nome } = req.body;

    const id = await categoriasService.criar({ nome, organizacaoId });

    return res.status(201).json({ sucesso: true, id });
  } catch (err) {
    logger.error("[categoriasController] criar", err);
    return res
      .status(500)
      .json({ sucesso: false, erro: "Erro ao criar categoria" });
  }
}

async function atualizar(req, res) {
  try {
    const id = req.params.id;
    const organizacaoId = req.usuario.organizacao_id;
    const { nome } = req.body;

    const ok = await categoriasService.atualizar(id, { nome, organizacaoId });
    if (!ok) {
      return res
        .status(404)
        .json({ sucesso: false, erro: "Categoria não encontrada" });
    }

    return res.json({ sucesso: true });
  } catch (err) {
    logger.error("[categoriasController] atualizar", err);
    return res
      .status(500)
      .json({ sucesso: false, erro: "Erro ao atualizar categoria" });
  }
}

async function remover(req, res) {
  try {
    const id = req.params.id;
    const organizacaoId = req.usuario.organizacao_id;

    const ok = await categoriasService.remover(id, organizacaoId);
    if (!ok) {
      return res
        .status(404)
        .json({ sucesso: false, erro: "Categoria não encontrada" });
    }

    return res.json({ sucesso: true });
  } catch (err) {
    logger.error("[categoriasController] remover", err);
    return res
      .status(500)
      .json({ sucesso: false, erro: "Erro ao remover categoria" });
  }
}

async function buscarPorId(req, res) {
  try {
    const id = req.params.id;
    const organizacaoId = req.usuario.organizacao_id;

    const categoria = await categoriasService.buscarPorId(id, organizacaoId);
    if (!categoria) {
      return res
        .status(404)
        .json({ sucesso: false, erro: "Categoria não encontrada" });
    }

    return res.json({ sucesso: true, data: categoria });
  } catch (err) {
    logger.error("[categoriasController] buscarPorId", err);
    return res
      .status(500)
      .json({ sucesso: false, erro: "Erro ao buscar categoria" });
  }
}

async function buscarPorIdade(req, res) {
  try {
    const idade = Number(req.params.idade);
    const organizacaoId = req.usuario.organizacao_id;

    const categoria = await categoriasService.buscarPorIdade(
      idade,
      organizacaoId
    );

    return res.json({ sucesso: true, data: categoria });
  } catch (err) {
    logger.error("[categoriasController] buscarPorIdade", err);
    return res
      .status(500)
      .json({ sucesso: false, erro: "Erro ao buscar categoria por idade" });
  }
}

module.exports = {
  listarTodas,
  criar,
  atualizar,
  remover,
  buscarPorId,
  buscarPorIdade,
};
