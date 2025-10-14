"use client";

import { useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, getFirestore } from "firebase/firestore";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { isPast, isToday, isFuture, parseISO } from "date-fns";
import type { Task, Customer } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function TasksPage() {
  const { user, isUserLoading } = useUser();
  const firestore = getFirestore();

  const tasksQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/taskReminders`);
  }, [user, firestore]);

  const customersQuery = useMemoFirebase(() => {
    if (!user) return null;
    return collection(firestore, `users/${user.uid}/customerProfiles`);
  }, [user, firestore]);

  const { data: tasks, isLoading: tasksLoading } = useCollection<Task>(tasksQuery);
  const { data: customers, isLoading: customersLoading } = useCollection<Customer>(customersQuery);

  const customerMap = new Map(customers?.map((c) => [c.id, `${c.firstName} ${c.lastName}`]));
  const isLoading = tasksLoading || customersLoading || isUserLoading;

  const taskGroups = {
    overdue: tasks?.filter(
      (t) => !t.isCompleted && isPast(parseISO(t.dueDate)) && !isToday(parseISO(t.dueDate))
    ) || [],
    today: tasks?.filter(
      (t) => !t.isCompleted && isToday(parseISO(t.dueDate))
    ) || [],
    upcoming: tasks?.filter(
      (t) => !t.isCompleted && isFuture(parseISO(t.dueDate))
    ) || [],
    completed: tasks?.filter((t) => t.isCompleted) || [],
  };

  const TaskItem = ({ task }: { task: Task }) => (
    <div className="flex items-center space-x-4 p-2 rounded-md hover:bg-secondary">
      <Checkbox id={`task-${task.id}`} checked={task.isCompleted} />
      <div className="flex-1">
        <label htmlFor={`task-${task.id}`} className="font-medium">{task.taskType}</label>
        <p className="text-sm text-muted-foreground">
          Para: {customerMap.get(task.customerId) || "Cliente Desconocido"}
        </p>
      </div>
      <p className="text-sm text-muted-foreground">
        {new Date(task.dueDate).toLocaleDateString()}
      </p>
    </div>
  );
  
  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <div>
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-5 w-80 mt-2" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
        <p className="text-muted-foreground">
          Gestiona tus recordatorios programados y actividades de seguimiento.
        </p>
      </div>
      <Card>
        <CardContent className="p-0">
          <Accordion type="multiple" defaultValue={["overdue", "today", "upcoming"]} className="w-full">
            <AccordionItem value="overdue">
              <AccordionTrigger className="px-6">
                Vencidas ({taskGroups.overdue.length})
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                {taskGroups.overdue.length > 0 ? (
                  taskGroups.overdue.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No hay tareas vencidas.</p>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="today">
              <AccordionTrigger className="px-6">Hoy ({taskGroups.today.length})</AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                {taskGroups.today.length > 0 ? (
                  taskGroups.today.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No hay tareas para hoy.</p>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="upcoming">
              <AccordionTrigger className="px-6">
                Próximas ({taskGroups.upcoming.length})
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                 {taskGroups.upcoming.length > 0 ? (
                  taskGroups.upcoming.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No hay tareas próximas.</p>
                )}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="completed">
              <AccordionTrigger className="px-6">
                Completadas ({taskGroups.completed.length})
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4">
                {taskGroups.completed.length > 0 ? (
                  taskGroups.completed.map((task) => (
                    <TaskItem key={task.id} task={task} />
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">No hay tareas completadas.</p>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
