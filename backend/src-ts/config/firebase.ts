import admin from "firebase-admin";
import logger from "../utils/logger";

// Variáveis de ambiente
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;

// Railway costuma salvar quebra de linha como "\\n"
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;

const runtimeEnv = process.env.NODE_ENV || "development";

let serviceAccount: {
  projectId: string;
  clientEmail: string;
  privateKey: string;
} | null = null;

let storageBucketName: string | null = null;
let credentialsSource: "env" | "file" = "env";

/**
 * Se todas envs existem, usamos variáveis de ambiente.
 * Caso contrário, tentamos credenciais locais para desenvolvimento.
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
  credentialsSource = "env";

  logger.info(
    "[firebase] Credenciais carregadas via variáveis de ambiente.",
    { env: runtimeEnv }
  );
} else {
  try {
    const localCreds = require("./capoeira-base-firebase-adminsdk-fbsvc-9c895f87be.json");

    serviceAccount = {
      projectId: localCreds.project_id,
      clientEmail: localCreds.client_email,
      privateKey: localCreds.private_key,
    };

    storageBucketName = "capoeira-base.firebaseapp.com";
    credentialsSource = "file";

    logger.info(
      "[firebase] Credenciais carregadas via arquivo local.",
      { env: runtimeEnv }
    );
  } catch (err: any) {
    logger.error("[firebase] Falha ao carregar credenciais locais:", err);
    throw new Error("Credenciais locais do Firebase não encontradas.");
  }
}

if (serviceAccount && storageBucketName) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: storageBucketName,
  });

  logger.info("[firebase] Firebase Admin SDK inicializado com sucesso.", {
    bucket: storageBucketName,
    source: credentialsSource,
    env: runtimeEnv,
  });
} else {
  logger.error("[firebase] Credenciais Firebase ausentes.");
  throw new Error("Falha ao inicializar Firebase Admin SDK.");
}

export const bucket = admin.storage().bucket();
export default bucket;
