const admin = require('firebase-admin');

let serviceAccount;

if (process.env.FIREBASE_CONFIG) {
  // Ambiente de produção (Railway)
  serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG);
} else {
  // Ambiente local
  serviceAccount = require('./capoeira-base-firebase-adminsdk-fbsvc-9c895f87be.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'capoeira-base.appspot.com'
});

const bucket = admin.storage().bucket();
module.exports = bucket;
