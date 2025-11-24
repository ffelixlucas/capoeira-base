require("dotenv").config();
const app = require("./app");
const PORT = process.env.PORT || 3000;
const logger = require("./utils/logger.js");

app.listen(PORT, () => {
  logger.log(`[STARTUP] Servidor rodando na porta ${PORT}`);
});
