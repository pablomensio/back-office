"use client";

import {
  addDocumentNonBlocking,
  useCollection,
  useMemoFirebase,
  useUser,
} from "@/firebase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Activity } from "@/lib/types";
import { Mail, Phone, Calendar, PenSquare, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "../ui/skeleton";
import { collection, getFirestore, query, orderBy } from "firebase/firestore";

const activityIcons = {
  Email: <Mail className="h-4 w-4" />,
  Llamada: <Phone className="h-4 w-4" />,
  Reunión: <Calendar className="h-4 w-4" />,
  Nota: <PenSquare className="h-4 w-4" />,
};

export function ActivityLog({ customerId }: { customerId?: string }) {
  const { user } = useUser();
  const firestore = getFirestore();
  const { toast } = useToast();

  const activitiesQuery = useMemoFirebase(() => {
    if (!user || !customerId) return null;
    return query(
      collection(
        firestore,
        `users/${user.uid}/customerProfiles/${customerId}/followUpActivities`
      ),
      orderBy("date", "desc")
    );
  }, [user, customerId, firestore]);

  const { data: activities, isLoading } = useCollection<Activity>(activitiesQuery);

  const handleAddActivity = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user || !customerId) return;

    const formData = new FormData(event.currentTarget);
    const newActivity = {
      customerId: customerId,
      activityType: formData.get("type") as Activity["activityType"],
      date: new Date().toISOString(),
      notes: formData.get("notes") as string,
    };

    const activitiesCol = collection(
      firestore,
      `users/${user.uid}/customerProfiles/${customerId}/followUpActivities`
    );
    addDocumentNonBlocking(activitiesCol, newActivity);

    toast({
      title: "Actividad registrada",
      description: `Se ha añadido ${newActivity.activityType} a la cronología del cliente.`,
    });
    event.currentTarget.reset();
  };

  if (isLoading) {
    return (
      <div className="space-y-4 py-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-4">
      <form onSubmit={handleAddActivity} className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <Select name="type" required defaultValue="Llamada">
            <SelectTrigger className="col-span-1">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Llamada">Llamada</SelectItem>
              <SelectItem value="Email">Email</SelectItem>
              <SelectItem value="Reunión">Reunión</SelectItem>
              <SelectItem value="Nota">Nota</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            name="notes"
            placeholder="Añadir notas sobre la interacción..."
            className="col-span-3"
            required
          />
        </div>
        <Button type="submit" className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Registrar Actividad
        </Button>
      </form>

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
        {activities && activities.map((activity) => (
          <div key={activity.id} className="flex gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              {activityIcons[activity.activityType]}
            </div>
            <div className="flex-1">
              <p className="font-medium">{activity.activityType}</p>
              <p className="text-sm text-muted-foreground">{activity.notes}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(activity.date), "PPP p")}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
