'use client';

import React, { useMemo, type ReactNode, useEffect } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase, useAuth } from '@/firebase';
import { usePathname, useRouter } from 'next/navigation';
import AppShell from '@/components/layout/app-shell';
import { Skeleton } from '@/components/ui/skeleton';

function AuthHandler({ children }: { children: ReactNode }) {
  const { user, appUser, isUserLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isAdminPage = pathname === '/admin';

  useEffect(() => {
    // Log 5: Estado completo antes de decidir
    console.log('🛡️ [AuthHandler] Checking auth state:', { isUserLoading, user: !!user, appUser, role: appUser?.role });

    if (isUserLoading) {
      console.log("⏳ [AuthHandler] Still loading user data. No action taken.");
      return;
    }

    if (!user) {
      if (!isAuthPage) {
        console.log('🔐 [AuthHandler] No user found. Redirecting to /login.');
        router.replace('/login');
      }
      return;
    }

    if (isAuthPage) {
      console.log('🔄 [AuthHandler] User is on an auth page. Redirecting to /.');
      router.replace('/');
      return;
    }
    
    if (isAdminPage && appUser?.role !== 'admin') {
      // Log 6: Razón de redirección
      console.log(`🚫 [AuthHandler] Access to /admin denied. User role is '${appUser?.role}'. Redirecting to /.`);
      router.replace('/');
      return;
    } else if (isAdminPage) {
        // Log 7: Éxito
        console.log('✅ [AuthHandler] Access to /admin granted. User role is admin.');
    }

  }, [isUserLoading, user, appUser, router, pathname, isAuthPage, isAdminPage]);

  if (isUserLoading && !isAuthPage) {
    return (
      <AppShell>
        <div className="flex flex-col gap-8">
          <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
          <Skeleton className="h-[500px] w-full" />
        </div>
      </AppShell>
    );
  }

  if (isAdminPage && appUser?.role !== 'admin') {
       return (
        <AppShell>
            <div className="flex flex-col gap-8">
                <div>
                    <Skeleton className="h-9 w-64" />
                    <Skeleton className="h-5 w-96 mt-2" />
                </div>
                <Skeleton className="h-[500px] w-full" />
            </div>
        </AppShell>
      )
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (user) {
    return <AppShell>{children}</AppShell>;
  }

  return null;
}

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    return initializeFirebase();
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      <AuthHandler>
        {children}
      </AuthHandler>
    </FirebaseProvider>
  );
}
