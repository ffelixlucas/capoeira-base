// /src/utils/mercadoPago.js
import { initMercadoPago } from "@mercadopago/sdk-react";
import { logger } from "./logger";

let initialized = false;
let initializedKey = "";

export const initMP = (overridePublicKey = "") => {
  const publicKey =
    String(overridePublicKey || "").trim() ||
    String(import.meta.env.VITE_MP_PUBLIC_KEY || "").trim();
  if (!publicKey) {
    logger.error("[mercadoPago] VITE_MP_PUBLIC_KEY não definida no .env");
    return;
  }

  if (initialized && initializedKey === publicKey) return;

  initMercadoPago(publicKey);
  initialized = true;
  initializedKey = publicKey;

  logger.log("[mercadoPago] SDK inicializado com chave pública:", publicKey);
};
