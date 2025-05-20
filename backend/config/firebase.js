const admin = require('firebase-admin');
const serviceAccount = require('./capoeira-base-firebase-adminsdk-fbsvc-9c895f87be.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
storageBucket: 'gs://capoeira-base.firebasestorage.app'
});

const bucket = admin.storage().bucket();
module.exports = bucket;
