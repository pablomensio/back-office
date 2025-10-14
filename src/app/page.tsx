"use client";

import { StatsCards } from "@/components/dashboard/stats-cards";
import { UpcomingTasks } from "@/components/dashboard/upcoming-tasks";
import { useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, query, where, getFirestore } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import type { Customer, Task } from "@/lib/types";

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = getFirestore();

  const customersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/customerProfiles`);
  }, [user, firestore]);

  const tasksQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, `users/${user.uid}/customerProfiles`),
      where("completed", "==", false)
    );
  }, [user, firestore]);

  const { data: customers, isLoading: customersLoading } = useCollection<Customer>(customersQuery);
  const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);

  const isLoading = customersLoading || tasksLoading || isUserLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96 mt-2" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Panel de control</h1>
        <p className="text-muted-foreground">
          Aquí tienes un resumen rápido del rendimiento de tus ventas y tareas.
        </p>
      </div>

      <StatsCards customers={customers || []} />

      <UpcomingTasks tasks={tasks || []} customers={customers || []} />
    </div>
  );
}
