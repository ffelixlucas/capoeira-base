import "dotenv/config";
console.log("RESEND_API_KEY carregada:", process.env.RESEND_API_KEY ? "SIM" : "NAO");

import app from "./app";
import logger from "./utils/logger";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.log(`[STARTUP] Servidor rodando na porta ${PORT}`);
});
