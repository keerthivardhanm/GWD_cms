
"use client";

import { Bell, Search, LogOut as LogOutIcon, Settings as SettingsIcon, UserCircle, AlertTriangle } from "lucide-react";
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
import { useAuth } from "@/context/AuthContext"; 
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import React, { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  icon: React.ReactNode; // Can be a Lucide icon component
  rawTimestamp?: Date; // For sorting if needed
}

const getIconForAction = (action: string) => {
  if (action.includes('CREATED')) return <UserCircle className="h-4 w-4 text-green-500" />;
  if (action.includes('UPDATED')) return <SettingsIcon className="h-4 w-4 text-blue-500" />;
  if (action.includes('DELETED')) return <LogOutIcon className="h-4 w-4 text-red-500" />; // Re-using LogOutIcon for delete
  if (action.includes('LOGIN') || action.includes('LOGOUT')) return <UserCircle className="h-4 w-4 text-purple-500" />;
  return <Bell className="h-4 w-4 text-gray-500" />; // Default
};


export function AppHeader() {
  const { user, userData, logout } = useAuth(); 
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoadingNotifications(true);
      try {
        const auditLogsQuery = query(collection(db, "auditLogs"), orderBy("timestamp", "desc"), limit(5));
        const auditLogsSnapshot = await getDocs(auditLogsQuery);
        const fetchedNotifications = auditLogsSnapshot.docs.map(docSnap => {
          const data = docSnap.data();
          const ts = data.timestamp instanceof Timestamp ? data.timestamp.toDate() : new Date();
          return {
            id: docSnap.id,
            title: `${data.action.replace(/_/g, ' ')} by ${data.userName || 'System'}`,
            message: `Entity: ${data.entityType || 'N/A'} - ${data.entityName || data.entityId || ''}`.substring(0, 100),
            time: formatDistanceToNow(ts, { addSuffix: true }),
            icon: getIconForAction(data.action || ''),
            rawTimestamp: ts,
          };
        });
        setNotifications(fetchedNotifications);
      } catch (error) {
        console.error("Error fetching notifications (audit logs):", error);
        // Potentially set an error state for notifications
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
    // Optionally, set up a listener for real-time updates if needed, or refetch periodically
    // For now, just fetch on mount.
  }, []);


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
            {notifications.length > 0 && (
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
            Recent Activity
            {notifications.length > 0 && <Badge variant="secondary">{notifications.length} New</Badge>}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <ScrollArea className="h-[300px]">
            {loadingNotifications && (
              <div className="p-4 text-center text-sm text-muted-foreground">Loading notifications...</div>
            )}
            {!loadingNotifications && notifications.length > 0 ? (
              notifications.map(notification => (
                <DropdownMenuItem key={notification.id} className="flex items-start gap-2.5 p-2.5 cursor-default">
                  <div className="shrink-0 mt-0.5">{notification.icon}</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight">{notification.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{notification.message}</p>
                    <p className="text-xs text-muted-foreground/70 mt-0.5">{notification.time}</p>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              !loadingNotifications && <div className="p-4 text-center text-sm text-muted-foreground">No new notifications</div>
            )}
          </ScrollArea>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="justify-center text-sm text-primary hover:!text-primary asChild">
             <Link href="/audit-logs">View all activity</Link>
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
    