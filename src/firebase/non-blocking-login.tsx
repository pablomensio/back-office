'use client';
import {
  Auth,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { getSdks } from '.';
import { AppUser } from '@/lib/types';


/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth): void {
  signInAnonymously(authInstance);
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string): void {
  createUserWithEmailAndPassword(authInstance, email, password)
    .then(userCredential => {
        const user = userCredential.user;
        const { firestore } = getSdks(authInstance.app);
        const userRef = doc(firestore, 'users', user.uid);
        
        // Default role for new sign-ups is 'vendedor'
        const newUser: AppUser = {
            uid: user.uid,
            email: user.email!,
            role: 'vendedor',
            displayName: user.email!.split('@')[0], // Default display name
        };
        
        return setDoc(userRef, newUser, { merge: true });
    });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string): void {
  signInWithEmailAndPassword(authInstance, email, password);
}
