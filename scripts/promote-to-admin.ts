
import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

async function promoteUserToAdmin() {
  // 1. Check for Service Account
  if (!serviceAccountPath) {
    console.error('Error: GOOGLE_APPLICATION_CREDENTIALS environment variable is not set.');
    process.exit(1);
  }
  if (!fs.existsSync(serviceAccountPath)) {
      console.error(`Error: Service account file not found at path: ${serviceAccountPath}`);
      process.exit(1);
  }

  // 2. Get email from command line arguments
  const emailToPromote = process.argv[2];
  if (!emailToPromote) {
    console.error('Error: Please provide the email of the user to promote to admin.');
    console.error('Usage: npx tsx scripts/promote-to-admin.ts <user-email>');
    process.exit(1);
  }

  // 3. Initialize Firebase Admin SDK
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

  console.log(`🚀 Attempting to promote user: ${emailToPromote}`);

  try {
    // 4. Get User by email from Firebase Auth to get the UID
    const userRecord = await auth.getUserByEmail(emailToPromote);
    const uid = userRecord.uid;
    console.log(`✅ Found user in Authentication with UID: ${uid}`);

    // 5. Create or Update the user's document in Firestore
    const userDocRef = db.collection('users').doc(uid);
    
    // Prepare user data
    const userData = {
        uid: uid,
        email: userRecord.email,
        displayName: userRecord.displayName || 'Usuario', // Use existing display name or a default
        role: 'admin'
    };

    // Use set with merge to create the doc if it doesn't exist, or update it if it does.
    await userDocRef.set(userData, { merge: true });

    console.log(`✅ User document in Firestore created/updated. ${emailToPromote} is now an admin.`);
    console.log('\n🎉 Promotion successful!');

  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.error(`Error: No user found with the email: ${emailToPromote}`);
    } else {
      console.error('An unexpected error occurred:', error);
    }
    process.exit(1);
  }
}

promoteUserToAdmin();
