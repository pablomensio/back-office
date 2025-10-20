
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { adminAuth, adminDb } from '@/lib/firebaseAdmin'; // Importa la instancia correcta y ya inicializada

const CreateUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  displayName: z.string(),
  role: z.enum(['admin', 'supervisor', 'vendedor']),
  reportsTo: z.string().optional(),
});

export async function createUser(input: z.infer<typeof CreateUserInputSchema>) {
  try {
    // Ya no es necesario llamar a initializeAdminIfNeeded()
    
    const validatedInput = CreateUserInputSchema.parse(input);

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
    // Re-lanza un error simple para ser capturado por el cliente
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
        // Ya no es necesario llamar a initializeAdminIfNeeded()
        
        const validatedInput = UpdateUserInputSchema.parse(input);
        const { uid, ...updateData } = validatedInput;

        const cleanUpdateData = Object.fromEntries(Object.entries(updateData).filter(([_, v]) => v !== undefined));

        if (Object.keys(cleanUpdateData).length > 0) {
            await adminDb.collection('users').doc(uid).update(cleanUpdateData);
        }

        revalidatePath('/admin');
        return { success: true };
    } catch (error: any) {
        console.error('Error updating user:', error);
        throw new Error(error.message || 'Failed to update user.');
    }
}
