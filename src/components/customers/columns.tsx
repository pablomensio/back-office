"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Customer, SalesFunnelStage } from "@/lib/types";
import {
  Circle,
  Phone,
  Calendar,
  Star,
  CheckCircle,
  MoreHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomerDialog } from "./customer-dialog";
import { Button } from "../ui/button";

const stageIcons: Record<SalesFunnelStage, React.ReactNode> = {
  Lead: <Circle className="h-4 w-4 text-gray-500" />,
  Contactado: <Phone className="h-4 w-4 text-blue-500" />,
  Cita: <Calendar className="h-4 w-4 text-purple-500" />,
  Calificado: <Star className="h-4 w-4 text-yellow-500" />,
  Cerrado: <CheckCircle className="h-4 w-4 text-green-500" />,
};

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "name",
    header: "Cliente",
    cell: ({ row }) => {
      const customer = row.original;
      const name = `${customer.firstName} ${customer.lastName}`;
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={customer.avatarUrl} alt={name} data-ai-hint="person avatar" />
            <AvatarFallback>{customer.firstName.charAt(0)}{customer.lastName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            <span className="text-sm text-muted-foreground">
              {customer.email}
            </span>
          </div>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const customer = row.original;
      const name = `${customer.firstName} ${customer.lastName}`;
      return name.toLowerCase().includes(value.toLowerCase());
    }
  },
  {
    accessorKey: "phone",
    header: "Teléfono",
  },
  {
    accessorKey: "salesFunnelStatus.status",
    header: "Embudo de Ventas",
    cell: ({ row }) => {
      const stage = row.original.salesFunnelStatus?.status;
      if (!stage) return null;
      return (
        <Badge variant="outline" className="gap-2">
          {stageIcons[stage]}
          <span>{stage}</span>
        </Badge>
      );
    },
  },
  {
    accessorKey: "preferences.budget",
    header: "Presupuesto",
    cell: ({ row }) => {
      const budget = row.original.preferences?.budget;
      if (!budget) return <div className="text-right">-</div>;
      const amount = parseFloat(String(budget));
      const formatted = new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR",
      }).format(amount);
      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const customer = row.original;
      return (
        <div className="text-right">
            <CustomerDialog customer={customer}>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </CustomerDialog>
        </div>
      );
    },
  },
];
