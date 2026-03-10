// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import logger from "../utils/logger";

const DEFAULT_FIREBASE_CONFIG = {
  apiKey: "AIzaSyDatzRmObirVI57pyoPWct-s_i4vfpZwyI",
  authDomain: "capoeira-base.firebaseapp.com",
  projectId: "capoeira-base",
  storageBucket: "capoeira-base.appspot.com",
  messagingSenderId: "1003485062464",
  appId: "1:1003485062464:web:e759899bbe746b943246a5",
};

const fromEnv = (key) => {
  const value = import.meta.env[key];
  if (typeof value !== "string") return "";
  return value.trim();
};

const firebaseConfig = {
  apiKey: fromEnv("VITE_FIREBASE_API_KEY") || DEFAULT_FIREBASE_CONFIG.apiKey,
  authDomain:
    fromEnv("VITE_FIREBASE_AUTH_DOMAIN") || DEFAULT_FIREBASE_CONFIG.authDomain,
  projectId:
    fromEnv("VITE_FIREBASE_PROJECT_ID") || DEFAULT_FIREBASE_CONFIG.projectId,
  storageBucket:
    fromEnv("VITE_FIREBASE_STORAGE_BUCKET") ||
    DEFAULT_FIREBASE_CONFIG.storageBucket,
  messagingSenderId:
    fromEnv("VITE_FIREBASE_MESSAGING_SENDER_ID") ||
    DEFAULT_FIREBASE_CONFIG.messagingSenderId,
  appId: fromEnv("VITE_FIREBASE_APP_ID") || DEFAULT_FIREBASE_CONFIG.appId,
};

// Inicializa o app e o storage
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);

const usingFallback = !fromEnv("VITE_FIREBASE_API_KEY");

// 🔥 Log detalhado com logger
logger.info("[Firebase] Inicializado com sucesso", {
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  apiKey: `${firebaseConfig.apiKey.slice(0, 6)}...`, // mascarado
  source: usingFallback ? "fallback" : "env",
});

if (!firebaseConfig.storageBucket.includes("appspot.com")) {
  logger.warn(
    "[Firebase] ⚠️ Atenção: bucket não está no formato oficial (.appspot.com)",
    firebaseConfig.storageBucket
  );
} else {
  logger.debug(
    "[Firebase] Bucket verificado e válido (.appspot.com)",
    firebaseConfig.storageBucket
  );
}
