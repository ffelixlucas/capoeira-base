const admin = require('firebase-admin');

let serviceAccount;

// No ambiente de produção (Railway), lemos as variáveis separadas
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  // ATENÇÃO: A CHAVE PRIVADA PRECISA TER AS QUEBRAS DE LINHA CORRETAS.
  // Se você colocou \\n na variável do Railway, precisamos converter de volta para \n.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

  serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: privateKey, // Use a chave privada corrigida aqui
  };
} else {
  // Ambiente local: carrega o arquivo JSON diretamente
  // Certifique-se de que o caminho e o nome do arquivo estão corretos
  try {
    serviceAccount = require('./capoeira-base-firebase-adminsdk-fbsvc-9c895f87be.json');
  } catch (error) {
    console.error('Erro ao carregar o arquivo de credenciais local:', error);
    throw new Error('Arquivo de credenciais local não encontrado ou mal formatado.');
  }
}

// Verifica se serviceAccount foi carregado antes de inicializar o Admin SDK
if (serviceAccount && serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'capoeira-base.firebaseapp.com' // 
  });
  console.log('Firebase Admin SDK inicializado com sucesso!');
} else {
  console.error('Erro: Variáveis de ambiente do Firebase ausentes ou incompletas para produção.');
  throw new Error('Credenciais do Firebase Admin SDK ausentes ou mal configuradas.');
}

const bucket = admin.storage().bucket();
module.exports = bucket;