'use client';

import { useCollection, useMemoFirebase, useUser } from "@/firebase";
import { collection, getFirestore } from "firebase/firestore";
import { UserTable } from "@/components/admin/users/data-table";
import { columns } from "@/components/admin/users/columns";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppUser } from "@/lib/types";

export default function AdminPage() {
    // Log 8: Si llega aquí, ya pasó el handler
    const { appUser } = useUser();
    console.log('🌐 [AdminPage] Rendering with appUser:', appUser);

    const firestore = getFirestore();

    // Query to get all users. In a real-world scenario with many users,
    // you'd want to implement pagination.
    const usersQuery = useMemoFirebase(() => {
        return collection(firestore, 'users');
    }, [firestore]);

    const { data: users, isLoading } = useCollection<AppUser>(usersQuery);

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Administración de Usuarios</h1>
                <p className="text-muted-foreground">
                    Gestiona los usuarios de la aplicación, asigna roles y supervisores.
                </p>
            </div>
            
            {isLoading ? (
                 <Skeleton className="h-[500px] w-full" />
            ) : (
                <UserTable columns={columns} data={users || []} />
            )}
        </div>
    );
}
