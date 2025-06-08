
"use client";

import { Bell, Search, LogOut as LogOutIcon, Settings as SettingsIcon, UserCircle } from "lucide-react"; // Added LogOutIcon
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumbs } from "./Breadcrumbs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // Import useAuth

export function AppHeader() {
  const { user, userData, logout } = useAuth(); // Get user and logout function

  const getInitials = (nameOrEmail?: string | null) => {
    if (!nameOrEmail) return "AU"; // Admin User fallback
    const parts = nameOrEmail.split('@')[0].split(/[.\s]/); // Split by dot, space, or use part before @
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length -1][0]}`.toUpperCase();
    }
    return nameOrEmail.substring(0,2).toUpperCase();
  };

  const displayName = userData?.name || user?.email || "User";
  const avatarFallback = getInitials(displayName);


  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="hidden md:block">
        <Breadcrumbs />
      </div>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
        />
      </div>
       <Button variant="outline" size="icon" className="shrink-0">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="overflow-hidden rounded-full">
            <Avatar className="h-8 w-8">
              {/* Add user?.photoURL if you implement avatar uploads */}
              <AvatarImage src={user?.photoURL || "https://placehold.co/40x40.png"} alt={displayName} data-ai-hint="user avatar" />
              <AvatarFallback>{avatarFallback}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator />
           <DropdownMenuItem asChild>
             <Link href="/settings"><SettingsIcon className="mr-2 h-4 w-4" />Settings</Link>
           </DropdownMenuItem>
          <DropdownMenuItem disabled> 
            <UserCircle className="mr-2 h-4 w-4" /> Profile (soon)
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>
            <LogOutIcon className="mr-2 h-4 w-4" /> Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
