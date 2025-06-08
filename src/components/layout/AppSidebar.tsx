
"use client";

import React from "react"; // Ensure React is imported
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bug, LogOut, Settings2, UserCircle } from "lucide-react";

import { NAV_ITEMS, APP_NAME, type NavItem } from "@/lib/constants";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext"; // Import useAuth


const SidebarMenuItemContent = ({ item, currentPath }: { item: NavItem; currentPath: string }) => {
  const Icon = item.icon;
  const isActive = item.href === "#" ? false : currentPath.startsWith(item.href);

  if (item.subItems) {
    return (
      <SidebarMenuButton
        asChild
        isActive={item.subItems.some(sub => currentPath.startsWith(sub.href))}
        className="text-sm"
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon />
            <span>{item.label}</span>
          </div>
        </div>
      </SidebarMenuButton>
    );
  }

  return (
    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label} className="text-sm">
      <Link href={item.href}>
        <Icon />
        <span>{item.label}</span>
      </Link>
    </SidebarMenuButton>
  );
};

export function AppSidebar() {
  const pathname = usePathname();
  const { user, userData, logout } = useAuth(); // Get user and logout function

  const getInitials = (nameOrEmail?: string | null) => {
    if (!nameOrEmail) return "AU";
    const parts = nameOrEmail.split('@')[0].split(/[.\s]/);
    if (parts.length > 1) {
      return `${parts[0][0]}${parts[parts.length -1][0]}`.toUpperCase();
    }
    return nameOrEmail.substring(0,2).toUpperCase();
  };
  
  const displayName = userData?.name || user?.email || "User";
  const displayEmail = userData?.email || user?.email || "user@example.com";
  const avatarFallback = getInitials(displayName);


  const renderNavItems = (items: NavItem[]) => {
    return items.map((item, index) => {
      if (item.groupLabel) {
        // This is a group, render its subItems
        return (
          <SidebarGroup key={`group-${item.groupLabel}-${index}`}>
            <SidebarGroupLabel className="flex items-center gap-2">
              {/* <item.icon /> */}
              {item.groupLabel}
            </SidebarGroupLabel>
            {item.subItems && item.subItems.length > 0 && (
               <SidebarMenu>
                {item.subItems.map((subItem, subIndex) => (
                  <SidebarMenuItem key={`${subItem.href}-${subIndex}`}>
                    <SidebarMenuItemContent item={subItem} currentPath={pathname} />
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            )}
          </SidebarGroup>
        );
      }
      
      // Regular item or item with sub-items (collapsible)
      return (
        <SidebarMenuItem key={`${item.href}-${index}`}>
          <SidebarMenuItemContent item={item} currentPath={pathname} />
          {item.subItems && (
            <SidebarMenuSub>
              {item.subItems.map((subItem, subIndex) => (
                <SidebarMenuSubItem key={`${subItem.href}-${subIndex}`}>
                  <SidebarMenuSubButton asChild isActive={pathname.startsWith(subItem.href)}>
                    <Link href={subItem.href}>
                      <subItem.icon />
                      <span>{subItem.label}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          )}
        </SidebarMenuItem>
      );
    });
  };


  return (
    <Sidebar variant="sidebar" collapsible="icon" className="shadow-md">
      <SidebarHeader className="border-b border-sidebar-border">
        <Link href="/dashboard" className="flex items-center gap-2 py-2">
          <Bug className="h-7 w-7 text-primary" />
          <span className="text-xl font-semibold tracking-tight text-sidebar-foreground group-data-[collapsible=icon]:hidden">
            {APP_NAME}
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>{renderNavItems(NAV_ITEMS.filter(item => !item.groupLabel))}</SidebarMenu>
        {NAV_ITEMS.filter(item => item.groupLabel).map((groupItem, index) => (
          <React.Fragment key={`group-section-${index}`}>
            <SidebarSeparator className="my-2" />
            {renderNavItems([groupItem])}
          </React.Fragment>
        ))}
      </SidebarContent>
      <SidebarFooter className="p-2 border-t border-sidebar-border">
         <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex h-auto w-full items-center justify-start gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.photoURL || "https://placehold.co/40x40.png"} alt={displayName} data-ai-hint="user avatar" />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
                <div className="text-left group-data-[collapsible=icon]:hidden">
                  <p className="text-sm font-medium">{displayName}</p>
                  <p className="text-xs text-muted-foreground">{displayEmail}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="right" align="start" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled>
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile (soon)</span>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                    <Settings2 className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
