// backend/modules/roles/rolesController.js

const rolesService = require('./rolesService');

const getAll = async (req, res) => {
  try {
    const roles = await rolesService.listarRoles();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const create = async (req, res) => {
  try {
    const novoPapel = await rolesService.criarRole(req.body);
    res.status(201).json(novoPapel);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const update = async (req, res) => {
  const { id } = req.params;
  try {
    await rolesService.atualizarRole(id, req.body);
    res.status(204).end();
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const remove = async (req, res) => {
  const { id } = req.params;
  try {
    await rolesService.deletarRole(id);
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAll,
  create,
  update,
  remove,
};
