import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// En un entorno de servidor gestionado como App Hosting,
// initializeApp() puede descubrir las credenciales automáticamente
// sin necesidad de pasarle el service account manualmente.
// Esto es más seguro y robusto.
if (!getApps().length) {
  initializeApp();
  console.log('🔥 Firebase Admin inicializado con credenciales por defecto.');
}

// Obtenemos la app inicializada (ya sea la que acabamos de crear o una existente)
const adminApp = getApps()[0];

// Exporta los servicios que necesitas
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
