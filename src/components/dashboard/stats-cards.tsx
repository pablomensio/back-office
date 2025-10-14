"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Circle,
  Phone,
  Calendar,
  Star,
  CheckCircle,
  Users,
} from "lucide-react";
import type { Customer, SalesFunnelStage } from "@/lib/types";

interface StatsCardsProps {
  customers: Customer[];
}

const stageDetails: Record<
  SalesFunnelStage,
  { icon: React.ElementType; label: string }
> = {
  Lead: { icon: Circle, label: "Leads" },
  Contactado: { icon: Phone, label: "Contactados" },
  Cita: { icon: Calendar, label: "Citas" },
  Calificado: { icon: Star, label: "Calificados" },
  Cerrado: { icon: CheckCircle, label: "Cerrados" },
};

export function StatsCards({ customers }: StatsCardsProps) {
  const totalCustomers = customers.length;
  const stageCounts = customers.reduce((acc, customer) => {
    const stage = customer.salesFunnelStatus?.status;
    if (stage) {
        acc[stage] = (acc[stage] || 0) + 1;
    }
    return acc;
  }, {} as Record<SalesFunnelStage, number>);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clientes Totales</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCustomers}</div>
        </CardContent>
      </Card>
      {Object.entries(stageDetails).map(([stage, { icon: Icon, label }]) => (
        <Card key={stage}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{label}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stageCounts[stage as SalesFunnelStage] || 0}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
