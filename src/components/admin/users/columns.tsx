"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AppUser } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { UserDialog } from "./user-dialog";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";

export const columns: ColumnDef<AppUser>[] = [
  {
    accessorKey: "displayName",
    header: "Nombre",
    cell: ({ row }) => {
      const user = row.original;
      const name = user.displayName || user.email;
      const fallback = (user.displayName || user.email).substring(0, 2).toUpperCase();
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.photoURL} alt={name} data-ai-hint="person avatar" />
            <AvatarFallback>{fallback}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{name}</span>
            <span className="text-sm text-muted-foreground">
              {user.email}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "role",
    header: "Rol",
    cell: ({ row }) => {
      const role = row.original.role;
      return <Badge variant="outline">{role}</Badge>;
    },
  },
  {
    accessorKey: "reportsTo",
    header: "Reporta a",
    cell: ({ row }) => {
        const reportsTo = row.original.reportsTo;
        // In a real app, you'd fetch the supervisor's name
        return reportsTo ? <span className="text-sm text-muted-foreground">{reportsTo}</span> : "-";
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="text-right">
            <UserDialog user={user}>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Abrir menú</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </UserDialog>
        </div>
      );
    },
  },
];
