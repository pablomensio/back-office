"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/firebase";
import { getAuth, signOut } from "firebase/auth";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";

export function AppHeader() {
  const isMobile = useIsMobile();
  const { user, isUserLoading } = useUser();
  const auth = getAuth();

  const handleLogout = () => {
    signOut(auth);
  };
  
  const getInitials = (email?: string | null) => {
    if (!email) return "U";
    const name = user?.displayName || "";
    const nameParts = name.split(' ');
    if (nameParts.length > 1 && nameParts[0] && nameParts[1]) {
        return nameParts[0].charAt(0) + nameParts[1].charAt(0);
    }
    return email.substring(0, 2).toUpperCase();
  }

  if (isUserLoading) {
    return (
        <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm lg:px-8">
            <div className="flex items-center gap-2">
                {isMobile && <SidebarTrigger />}
            </div>
            <Skeleton className="h-8 w-8 rounded-full" />
        </header>
    )
  }

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm lg:px-8">
      <div className="flex items-center gap-2">
        {isMobile && <SidebarTrigger />}
      </div>

      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.photoURL || ""} alt={user?.displayName || "Usuario"} data-ai-hint="person avatar" />
                <AvatarFallback>{getInitials(user?.email)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.displayName || "Usuario"}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/settings">Ajustes</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Cerrar sesión</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
