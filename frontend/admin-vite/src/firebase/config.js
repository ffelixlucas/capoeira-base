// src/firebase/config.js
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import logger from "../utils/logger";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializa o app e o storage
const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);

// 🔥 Log detalhado com logger
logger.info("[Firebase] Inicializado com sucesso", {
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  apiKey: firebaseConfig.apiKey.slice(0, 6) + "...", // mascarado
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
