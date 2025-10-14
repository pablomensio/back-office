"use client";
import { columns } from "@/components/customers/columns";
import { DataTable } from "@/components/customers/data-table";
import { CustomerDialog } from "@/components/customers/customer-dialog";
import { useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, getFirestore } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer } from "@/lib/types";

export default function CustomersPage() {
  const { user, isUserLoading } = useUser();
  const firestore = getFirestore();

  const customersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/customerProfiles`);
  }, [user, firestore]);

  const { data: customers, isLoading } = useCollection<Customer>(customersQuery);

  if (isLoading || isUserLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="h-5 w-96 mt-2" />
          </div>
          <Skeleton className="h-10 w-36" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona los perfiles de tus clientes, interacciones y embudo de ventas.
          </p>
        </div>
        <CustomerDialog />
      </div>
      <DataTable columns={columns} data={customers || []} />
    </div>
  );
}
