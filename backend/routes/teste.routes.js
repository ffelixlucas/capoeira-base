const express = require('express');
const router = express.Router();

router.get('/teste', (req, res) => {
  res.json({ mensagem: 'API funcionando com sucesso!' });
});

module.exports = router;
