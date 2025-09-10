// /src/utils/mercadoPago.js
import { initMercadoPago } from "@mercadopago/sdk-react";
import { logger } from "./logger";

let initialized = false;

export const initMP = () => {
  if (initialized) return;

  const publicKey = import.meta.env.VITE_MP_PUBLIC_KEY;
  if (!publicKey) {
    logger.error("[mercadoPago] VITE_MP_PUBLIC_KEY não definida no .env");
    return;
  }

  initMercadoPago(publicKey);
  initialized = true;

  logger.log("[mercadoPago] SDK inicializado com chave pública:", publicKey);
};
