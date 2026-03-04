import "dotenv/config";

if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.info = () => {};
  console.debug = () => {};
}

import app from "./app";
import logger from "./utils/logger";

const PORT = process.env.PORT || 3000;

logger.debug("[STARTUP] RESEND_API_KEY carregada:", process.env.RESEND_API_KEY ? "SIM" : "NAO");

app.listen(PORT, () => {
  logger.info(`[STARTUP] Servidor rodando na porta ${PORT}`);
});
