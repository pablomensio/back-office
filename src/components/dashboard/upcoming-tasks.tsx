"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Task, Customer } from "@/lib/types";
import { formatDistanceToNow } from "date-fns";
import { es } from 'date-fns/locale';

interface UpcomingTasksProps {
  tasks: Task[];
  customers: Customer[];
}

export function UpcomingTasks({ tasks, customers }: UpcomingTasksProps) {
  const customerMap = new Map(customers.map((c) => [c.id, `${c.firstName} ${c.lastName}`]));
  const upcomingTasks = tasks
    .filter((task) => !task.isCompleted)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Próximas Tareas</CardTitle>
        <CardDescription>
          Tus próximos recordatorios y seguimientos.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingTasks.length > 0 ? (
          <div className="space-y-4">
            {upcomingTasks.map((task) => (
              <div key={task.id} className="flex items-center space-x-4">
                <Checkbox id={`task-dash-${task.id}`} checked={task.isCompleted} />
                <div className="flex-1">
                  <label htmlFor={`task-dash-${task.id}`} className="font-medium">
                    {task.taskType}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    Para: {customerMap.get(task.customerId) || "Desconocido"}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  Vence {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true, locale: es })}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No hay tareas próximas. ¡Buen trabajo!</p>
        )}
      </CardContent>
    </Card>
  );
}
