
import * as admin from 'firebase-admin';
import { AppUser } from '../src/lib/types';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env file in the project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });


const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

async function listUsersAndRoles() {
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

    const db = admin.firestore();


    console.log('Fetching users from Firestore...');
    try {
        const usersSnapshot = await db.collection('users').get();

        if (usersSnapshot.empty) {
        console.log('No users found in the "users" collection.');
        return;
        }

        const users: AppUser[] = [];
        usersSnapshot.forEach(doc => {
        users.push(doc.data() as AppUser);
        });
        
        console.log('\n--- User List ---');
        console.table(users.map(user => ({
            UID: user.uid,
            Email: user.email,
            Role: user.role,
            DisplayName: user.displayName || 'N/A'
        })));
        console.log('-----------------\n');

    } catch (error) {
        console.error('Error fetching users:', error);
        process.exit(1);
    }
}

listUsersAndRoles();
