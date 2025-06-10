
"use client";

import { Bell, Search, LogOut as LogOutIcon, Settings as SettingsIcon, UserCircle } from "lucide-react";
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
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge"; // Added import for Badge

// Placeholder notification data
const placeholderNotifications = [
  { id: "1", title: "New user registered", message: "John Doe has joined.", time: "2m ago", icon: <UserCircle className="h-4 w-4 text-blue-500" /> },
  { id: "2", title: "Page Published", message: "'About Us' page is now live.", time: "1h ago", icon: <SettingsIcon className="h-4 w-4 text-green-500" /> },
  { id: "3", title: "System Update", message: "Maintenance scheduled for tonight.", time: "3h ago", icon: <LogOutIcon className="h-4 w-4 text-orange-500" /> },
  { id: "4", title: "Comment on 'Blog Post'", message: "Sarah commented: Great article!", time: "5h ago", icon: <UserCircle className="h-4 w-4 text-purple-500" /> },
  { id: "5", title: "Security Alert", message: "Unusual login attempt detected.", time: "1d ago", icon: <SettingsIcon className="h-4 w-4 text-red-500" /> },
];


export function AppHeader() {
  const { user, userData, logout } = useAuth(); 

  const getInitials = (nameOrEmail?: string | null) => {
    if (!nameOrEmail) return "AU"; 
    const parts = nameOrEmail.split('@')[0].split(/[.\s]/); 
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
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 relative">
            <Bell className="h-5 w-5" />
            {placeholderNotifications.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            )}
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80 sm:w-96">
          <DropdownMenuLabel className="flex justify-between items-center">
            Notifications
            <Badge variant="secondary">{placeholderNotifications.length} New</Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[300px]">
            {placeholderNotifications.length > 0 ? (
              placeholderNotifications.map(notification => (
                <DropdownMenuItem key={notification.id} className="flex items-start gap-2.5 p-2.5">
                  <div className="shrink-0 mt-0.5">{notification.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight">{notification.title}</p>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{notification.time}</p>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
            )}
          </ScrollArea>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="justify-center text-sm text-primary hover:!text-primary">
            View all notifications (TBD)
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="overflow-hidden rounded-full">
            <Avatar className="h-8 w-8">
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
