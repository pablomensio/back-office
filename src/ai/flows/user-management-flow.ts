'use server';
/**
 * @fileOverview User management flows for creating and updating users.
 * This file contains Genkit flows that use the Firebase Admin SDK to manage users,
 * which is a secure way to handle user creation and updates from an admin panel.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { adminAuth, adminDb } from '../../lib/firebaseAdmin'; // Import the initialized services

// Define the input schema for creating a user
const CreateUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string(),
  role: z.enum(['admin', 'supervisor', 'vendedor']),
  reportsTo: z.string().optional(),
});
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

const CreateUserOutputSchema = z.object({
  uid: z.string(),
});
export type CreateUserOutput = z.infer<typeof CreateUserOutputSchema>;

// Define the input schema for updating a user
const UpdateUserInputSchema = z.object({
    uid: z.string(),
    displayName: z.string().optional(),
    role: z.enum(['admin', 'supervisor', 'vendedor']).optional(),
    reportsTo: z.string().optional(),
});
export type UpdateUserInput = z.infer<typeof UpdateUserInputSchema>;


// Exported wrapper function for the create user flow
export async function createUser(input: CreateUserInput): Promise<CreateUserOutput> {
  return createUserFlow(input);
}

// Exported wrapper function for the update user flow
export async function updateUser(input: UpdateUserInput): Promise<void> {
    return updateUserFlow(input);
}

const createUserFlow = ai.defineFlow(
  {
    name: 'createUserFlow',
    inputSchema: CreateUserInputSchema,
    outputSchema: CreateUserOutputSchema,
  },
  async (input) => {
    try {
      // 1. Create user in Firebase Auth using the imported adminAuth service
      const userRecord = await adminAuth.createUser({
        email: input.email,
        password: input.password,
        displayName: input.displayName,
        emailVerified: true, // Admins can create verified users
        disabled: false,
      });

      // 2. Create user profile in Firestore using the imported adminDb service
      const userDocRef = adminDb.collection('users').doc(userRecord.uid);
      await userDocRef.set({
        uid: userRecord.uid,
        email: input.email,
        displayName: input.displayName,
        role: input.role,
        reportsTo: input.reportsTo || null,
      });

      return { uid: userRecord.uid };
    } catch (error: any) {
      console.error('Error in createUserFlow:', error);
      // Throwing the error so it can be caught by the client-side caller
      throw new Error(error.message || 'An unexpected error occurred during user creation.');
    }
  }
);


const updateUserFlow = ai.defineFlow(
    {
      name: 'updateUserFlow',
      inputSchema: UpdateUserInputSchema,
      outputSchema: z.void(),
    },
    async (input) => {
      try {
        const { uid, ...updateData } = input;
  
        // Filter out undefined values
        const cleanUpdateData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));

        if (Object.keys(cleanUpdateData).length === 0) {
            return; // Nothing to update
        }
  
        // Update user profile in Firestore using the imported adminDb service
        const userDocRef = adminDb.collection('users').doc(uid);
        await userDocRef.update(cleanUpdateData);

      } catch (error: any) {
        console.error('Error in updateUserFlow:', error);
        throw new Error(error.message || 'Failed to update user.');
      }
    }
  );
