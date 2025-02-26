// src/config/firebase.ts
import admin from 'firebase-admin';
import path from 'path';

// Se o arquivo estiver na raiz do projeto:
const serviceAccount = require(path.resolve(__dirname, '../../chatbotclients-firebase-adminsdk-fbsvc-bed4bfd9f4.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
//   databaseURL: process.env.FIREBASE_DATABASE_URL || "https://<seu-project-id>.firebaseio.com",
});

const db = admin.firestore();

export { admin, db };