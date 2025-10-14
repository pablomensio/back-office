
"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Home,
  Users,
  CheckSquare,
  Car,
  Settings,
  Shield,
  CalendarDays,
} from "lucide-react";
import { useUser } from "@/firebase";

export function AppSidebar() {
  const pathname = usePathname();
  const { appUser } = useUser();

  const isActive = (path: string) => pathname === path;

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="h-14 items-center justify-center p-2">
        <Link href="/" className="flex items-center gap-2">
            <Car className="h-8 w-8 text-primary" />
            <span className="text-xl font-semibold group-data-[collapsible=icon]:hidden">
                Meny
            </span>
        </Link>
      </SidebarHeader>
      <SidebarMenu className="flex-1">
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive("/")}
            tooltip="Panel de control"
          >
            <Link href="/">
              <Home />
              <span>Panel de control</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive("/customers")}
            tooltip="Clientes"
          >
            <Link href="/customers">
              <Users />
              <span>Clientes</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive("/tasks")}
            tooltip="Tareas"
          >
            <Link href="/tasks">
              <CheckSquare />
              <span>Tareas</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
         <SidebarMenuItem>
          <SidebarMenuButton
            asChild
            isActive={isActive("/calendar")}
            tooltip="Calendario"
          >
            <Link href="/calendar">
              <CalendarDays />
              <span>Calendario</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {appUser?.role === 'admin' && (
            <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={isActive("/admin")}
                    tooltip="Administración"
                >
                    <Link href="/admin">
                        <Shield />
                        <span>Administración</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )}

      </SidebarMenu>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={isActive("/settings")}
              tooltip="Ajustes"
            >
              <Link href="/settings">
                <Settings />
                <span>Ajustes</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
