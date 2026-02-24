import { bucket } from "../config/firebase";
import logger from "./logger";

export async function deletarArquivoFirebase(url: string) {
  try {
    if (!url) return;

    // Extrai o path após o bucket
    const urlObj = new URL(url);
    const path = decodeURIComponent(
      urlObj.pathname.replace(/^\/[^/]+\//, "")
    );

    await bucket.file(path).delete();

    logger.info("[firebaseStorageHelper] Arquivo deletado", { path });

  } catch (error: any) {
    logger.error("[firebaseStorageHelper] Erro ao deletar arquivo", {
      error: error.message,
    });
  }
}