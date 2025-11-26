import admin from "firebase-admin";
import  logger  from "../utils/logger";

// Variáveis de ambiente (produção Railway)
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;

// OBS: Railway salva quebra de linha como "\\n" → precisamos revertê-las para "\n"
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;

let serviceAccount: {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} | null = null;

let storageBucketName: string | null = null;

/**
 * 🔍 PRODUÇÃO (Railway)
 * Se todas envs existem → usamos elas
 */
if (
  FIREBASE_PROJECT_ID &&
  FIREBASE_CLIENT_EMAIL &&
  FIREBASE_PRIVATE_KEY &&
  FIREBASE_STORAGE_BUCKET
) {
  serviceAccount = {
    projectId: FIREBASE_PROJECT_ID,
    clientEmail: FIREBASE_CLIENT_EMAIL,
    privateKey: FIREBASE_PRIVATE_KEY,
  };

  storageBucketName = FIREBASE_STORAGE_BUCKET;

  logger.log("Ambiente de produção detectado. Firebase via variáveis de ambiente.");
}

/**
 * 🖥️ DESENVOLVIMENTO LOCAL
 */
else {
  try {
    // Arquivo que você subiu — substitua pelo nome do arquivo real se usar outro
    // 🚨 Não mova para dist, TypeScript mantém o caminho relativo igual
    // O arquivo deve estar em: backend/src-ts/config/<arquivo>.json
    // OU manter onde está e ajustar o caminho relativo abaixo.
    // Aqui vamos usar o arquivo já existente no backend original:
    const localCreds = require("./capoeira-base-firebase-adminsdk-fbsvc-9c895f87be.json");

    serviceAccount = {
      projectId: localCreds.project_id,
      clientEmail: localCreds.client_email,
      privateKey: localCreds.private_key,
    };

    storageBucketName = "capoeira-base.firebaseapp.com";

    logger.log("Ambiente local detectado. Firebase via arquivo JSON.");
  } catch (err: any) {
    logger.error("Falha ao carregar credenciais locais:", err);
    throw new Error("Credenciais locais do Firebase não encontradas.");
  }
}

/**
 * 🚀 Inicializa Firebase Admin
 */
if (serviceAccount && storageBucketName) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: storageBucketName,
  });

  logger.log(
    "Firebase Admin SDK inicializado com sucesso.",
    { bucket: storageBucketName }
  );
} else {
  logger.error("Credenciais Firebase ausentes.");
  throw new Error("Falha ao inicializar Firebase Admin SDK.");
}

export const bucket = admin.storage().bucket();
export default bucket;
