
'use server';

import { z } from 'zod';
import * as admin from 'firebase-admin';
import { revalidatePath } from 'next/cache';

// Helper to initialize the Admin SDK safely (only once)
function initializeAdminIfNeeded() {
  if (admin.apps.length === 0) {
    try {
        // This works in Firebase App Hosting and other managed environments
        admin.initializeApp();
        console.log('🔥 Firebase Admin SDK initialized successfully via Application Default Credentials.');
    } catch (e: any) {
        console.error("Failed to initialize Firebase Admin SDK with ADC, trying service account from ENV", e.message);
        try {
            // Fallback for local development or environments where the service account is in an env var
            const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
            if (!serviceAccountString) {
                throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set.");
            }
            const serviceAccount = JSON.parse(serviceAccountString);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
            console.log('🔥 Firebase Admin SDK initialized successfully via environment variable.');
        } catch (error: any) {
            console.error("Firebase Admin SDK initialization error:", error);
            throw new Error(`Firebase Admin SDK failed to initialize: ${error.message}`);
        }
    }
  }
}

const CreateUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string(),
  role: z.enum(['admin', 'supervisor', 'vendedor']),
  reportsTo: z.string().optional(),
});

export async function createUser(input: z.infer<typeof CreateUserInputSchema>) {
  try {
    initializeAdminIfNeeded();

    const validatedInput = CreateUserInputSchema.parse(input);
    const adminAuth = admin.auth();
    const adminDb = admin.firestore();

    const userRecord = await adminAuth.createUser({
      email: validatedInput.email,
      password: validatedInput.password,
      displayName: validatedInput.displayName,
      emailVerified: true,
      disabled: false,
    });

    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: validatedInput.email,
      displayName: validatedInput.displayName,
      role: validatedInput.role,
      reportsTo: validatedInput.reportsTo || null,
    });

    revalidatePath('/admin');
    return { success: true, uid: userRecord.uid };
  } catch (error: any) {
    console.error('Error creating user:', error);
    // Re-throw a plain error to be caught by the client
    throw new Error(error.message || 'An unexpected error occurred.');
  }
}

const UpdateUserInputSchema = z.object({
    uid: z.string(),
    displayName: z.string().optional(),
    role: z.enum(['admin', 'supervisor', 'vendedor']).optional(),
    reportsTo: z.string().optional(),
});

export async function updateUser(input: z.infer<typeof UpdateUserInputSchema>) {
    try {
        initializeAdminIfNeeded();

        const validatedInput = UpdateUserInputSchema.parse(input);
        const { uid, ...updateData } = validatedInput;

        const cleanUpdateData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));

        if (Object.keys(cleanUpdateData).length > 0) {
            await admin.firestore().collection('users').doc(uid).update(cleanUpdateData);
        }

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating user:', error);
        throw new Error(error.message || 'Failed to update user.');
    }
}
