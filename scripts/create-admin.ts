
import * as admin from 'firebase-admin';
import { AppUser } from '../src/lib/types';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env file in the project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

async function createAdmin() {
  // Check for required environment variables and service account file
  if (!serviceAccountPath) {
    console.error('Error: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
    console.error('Please create a .env file and set the path to your service account key file.');
    process.exit(1);
  }

  if (!fs.existsSync(serviceAccountPath)) {
      console.error(`Error: Service account file not found at path: ${serviceAccountPath}`);
      console.error('Please make sure the path in your .env file is correct and the file exists in your project root.');
      process.exit(1);
  }

  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.error('Error: ADMIN_EMAIL or ADMIN_PASSWORD environment variables are not set.');
    console.error('Please define them in your .env file.');
    process.exit(1);
  }
  
  // Initialize Firebase Admin SDK
  try {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  } catch (error: any) {
    if (error.code !== 'app/duplicate-app') {
      console.error('Firebase Admin SDK initialization error:', error);
      process.exit(1);
    }
  }

  const auth = admin.auth();
  const db = admin.firestore();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;


  console.log(`Attempting to create admin user with email: ${adminEmail}`);

  try {
    // 1. Create the user in Firebase Auth
    const userRecord = await auth.createUser({
      email: adminEmail,
      password: adminPassword,
      emailVerified: true,
      disabled: false,
    });

    console.log('Successfully created new user in Firebase Auth with UID:', userRecord.uid);

    // 2. Create the user profile in Firestore
    const userDocRef = db.collection('users').doc(userRecord.uid);
    const adminUserData: AppUser = {
      uid: userRecord.uid,
      email: adminEmail,
      role: 'admin',
      displayName: 'Administrator',
    };

    await userDocRef.set(adminUserData);
    console.log('Successfully created user document in Firestore with admin role.');
    console.log('\nAdmin user created successfully!');

  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
      console.error('Error: This email address is already in use by an existing user.');
      console.log('If you want to make this user an admin, please do so manually in the Firestore database.');
    } else {
      console.error('An unexpected error occurred:', error);
      process.exit(1);
    }
  }
}

createAdmin();
