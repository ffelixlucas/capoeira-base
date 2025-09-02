const admin = require("firebase-admin");

// Variáveis de ambiente para produção
const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const FIREBASE_CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
// A chave privada precisa ter as quebras de linha corretas (\n)
// Se no Railway você colou com \\n, então precisamos reverter para \n
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

// O nome do bucket EXATO do Firebase Storage
const FIREBASE_STORAGE_BUCKET = process.env.FIREBASE_STORAGE_BUCKET;

let serviceAccount;
let storageBucketName;

// Se estamos em produção (detectamos pelas variáveis do Railway)
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

  if (process.env.NODE_ENV !== "production") {
    console.log(
      "Ambiente de produção detectado. Usando variáveis de ambiente para Firebase."
    );
  }
} else {
  // Ambiente local (desenvolvimento)
  try {
    serviceAccount = require("./capoeira-base-firebase-adminsdk-fbsvc-9c895f87be.json");
    storageBucketName = "capoeira-base.firebaseapp.com";

    if (process.env.NODE_ENV !== "production") {
      console.log("Ambiente local detectado. Usando arquivo JSON para Firebase.");
    }
  } catch (error) {
    console.error("Erro ao carregar credenciais locais:", error.message);
    throw new Error(
      "Arquivo de credenciais local não encontrado ou mal formatado."
    );
  }
}

// Inicializa o Admin SDK APENAS SE serviceAccount e storageBucketName estiverem definidos
if (serviceAccount && storageBucketName) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: storageBucketName,
  });

  if (process.env.NODE_ENV !== "production") {
    console.log(
      "Firebase Admin SDK inicializado com sucesso com bucket:",
      storageBucketName
    );
  }
} else {
  console.error("Erro crítico: credenciais ou bucket ausentes.");
  throw new Error("Falha na inicialização do Firebase Admin SDK.");
}

const bucket = admin.storage().bucket();
module.exports = bucket;
