import { getApps, initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// This function ensures the Firebase Admin SDK is initialized,
// handling both production and development environments.
if (getApps().length === 0) {
  if (process.env.NODE_ENV === 'production') {
    // In production (deployed on App Hosting), the SDK automatically
    // finds the credentials from the assigned service account.
    initializeApp();
    console.log('🔥 Firebase Admin initialized with Application Default Credentials (Production).');
  } else {
    // In development, we manually use the local service account file.
    // The require() function loads the JSON file at runtime.
    try {
      const serviceAccount = require('../../../service-account.json');
      initializeApp({
        credential: cert(serviceAccount),
      });
      console.log('🔥 Firebase Admin initialized with local service-account.json (Development).');
    } catch (error) {
      console.error(
        "Firebase Admin SDK initialization failed in development. " +
        "Make sure you have a 'service-account.json' file at the root of your project.",
        error
      );
    }
  }
}

// Export the initialized services
const adminApp = getApps()[0];
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
