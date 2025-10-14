
"use client";

import React, { useState, useMemo } from "react";
import { useCollection, useUser, useMemoFirebase } from "@/firebase";
import { collection, getFirestore } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  addMonths, 
  subMonths, 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  isSameDay, 
  parseISO 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import type { Task, Customer } from "@/lib/types";
import { Button } from "@/components/ui/button";

type Event = {
  date: Date;
  title: string;
  isCompleted: boolean;
  color?: string;
};

export default function CalendarPage() {
  const { user, isUserLoading } = useUser();
  const firestore = getFirestore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Data fetching from Firestore
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

  const isLoading = tasksLoading || customersLoading || isUserLoading;

  // Map customer IDs to names for easy lookup
  const customerMap = useMemo(() => 
    new Map(customers?.map((c) => [c.id, `${c.firstName} ${c.lastName}`]))
  , [customers]);

  // Transform tasks into calendar events
  const events: Event[] = useMemo(() => {
    return tasks?.map(task => ({
      date: parseISO(task.dueDate),
      title: `${task.taskType} - ${customerMap.get(task.customerId) || 'Cliente Desconocido'}`,
      isCompleted: task.isCompleted,
      color: task.isCompleted ? 'hsl(var(--secondary-foreground))' : 'hsl(var(--accent))'
    })) || [];
  }, [tasks, customerMap]);

  // Calendar logic
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start week on Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(e.date, day));

  if (isLoading) {
    return (
        <div className="flex flex-col gap-8">
            <div>
                <Skeleton className="h-9 w-48" />
                <Skeleton className="h-5 w-96 mt-2" />
            </div>
            <Skeleton className="h-[600px] w-full" />
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendario</h1>
            <p className="text-muted-foreground">
                Organiza tus citas, tareas y recordatorios de un vistazo.
            </p>
        </div>
        <motion.div
            className="bg-card rounded-2xl shadow-lg p-6 max-w-full mx-auto border border-border"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2 text-card-foreground capitalize">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h2>
                <div className="flex items-center gap-2">
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="icon" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 text-center text-sm font-semibold text-muted-foreground mb-2">
                {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
                <div key={d}>{d}</div>
                ))}
            </div>

            <motion.div
                className="grid grid-cols-7 gap-2"
                key={currentMonth.toString()}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {days.map((day) => {
                const inMonth = isSameMonth(day, monthStart);
                const today = isToday(day);
                const eventsForDay = getEventsForDay(day);

                return (
                    <div
                    key={day.toISOString()}
                    className={`relative p-2 rounded-xl h-28 border transition-all
                        ${inMonth ? 'bg-background hover:bg-muted/50' : 'bg-muted/30 text-muted-foreground'}
                        ${today ? 'border-primary' : 'border-border'}`}
                    >
                    <div className="text-right text-xs font-semibold">
                        {format(day, 'd')}
                    </div>

                    <div className="flex flex-col gap-1 mt-1 overflow-hidden">
                        {eventsForDay.slice(0, 2).map((event, i) => (
                        <div
                            key={i}
                            className={`text-xs truncate rounded-md px-1.5 py-0.5 text-white ${event.isCompleted ? 'opacity-60' : ''}`}
                            style={{
                            backgroundColor: event.color
                            }}
                        >
                            {event.title}
                        </div>
                        ))}
                        {eventsForDay.length > 2 && (
                        <div className="text-[10px] text-muted-foreground mt-0.5">
                            +{eventsForDay.length - 2} más
                        </div>
                        )}
                    </div>
                    </div>
                );
                })}
            </motion.div>
        </motion.div>
    </div>
  );
}
