import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

// Inicializa y exporta el app (usa getApps() para checks seguros)
const adminApp = getApps().length ? getApps()[0] : initializeApp({
  credential: cert(serviceAccount),
});

// Exporta servicios listos (usa el app explícitamente)
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

console.log('🔥 Firebase Admin inicializado con creds explícitas.');
