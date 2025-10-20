
'use server';
/**
 * @fileOverview User management flows for creating and updating users.
 * This file is being deprecated in favor of Next.js Server Actions.
 * The logic has been moved to src/app/admin/actions.ts
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// This file is no longer in use.
// The Genkit flows have been replaced by standard Next.js Server Actions
// in src/app/admin/actions.ts for better reliability and simpler architecture.

const StubSchema = z.object({ message: z.string() });

export async function createUser(input: any): Promise<any> {
  console.warn("DEPRECATED: createUser flow is no longer in use. Use the Server Action instead.");
  return { success: false, message: "This flow is deprecated." };
}

export async function updateUser(input: any): Promise<any> {
    console.warn("DEPRECATED: updateUser flow is no longer in use. Use the Server Action instead.");
    return { success: false, message: "This flow is deprecated." };
}
