import { bucket } from "../config/firebase"; // ajuste se caminho for diferente
import logger from "../utils/logger";
import fs from "fs";
import multer from "multer";

interface UploadImagemParams {
    organizacaoId: number;
    tipo: "produto" | "sku";
    entidadeId: number;
    file: any; // vamos tipar melhor depois
  }

export async function uploadImagem({
  organizacaoId,
  tipo,
  entidadeId,
  file,
}: UploadImagemParams): Promise<string> {
  if (!organizacaoId) {
    throw new Error("Organização não informada");
  }

  if (!file) {
    throw new Error("Arquivo não enviado");
  }

  const timestamp = Date.now();
  const extensao = file.originalname.split(".").pop();

  const destino = `organizacoes/${organizacaoId}/${tipo}s/${entidadeId}/${timestamp}.${extensao}`;

  logger.debug("[imageStorageService] Enviando imagem", {
    destino,
    tipo,
    entidadeId,
  });

  await bucket.upload(file.path, {
    destination: destino,
    metadata: { contentType: file.mimetype },
  });

  fs.unlinkSync(file.path);

  const fileRef = bucket.file(destino);
  const [url] = await fileRef.getSignedUrl({
    action: "read",
    expires: "03-01-2035",
  });

  logger.info("[imageStorageService] Upload concluído", { destino });

  return url;
}