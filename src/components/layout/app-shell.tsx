"use client";

import React from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";

export default function AppShell({ children }: { children: React.ReactNode }) {
  // We can use this to set the default state of the sidebar.
  // The state is saved in a cookie so it will be remembered across sessions.
  const [open, setOpen] = React.useState(true);

  return (
    <SidebarProvider open={open} onOpenChange={setOpen}>
      <AppSidebar />
      <SidebarInset className="min-h-screen">
        <AppHeader />
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
