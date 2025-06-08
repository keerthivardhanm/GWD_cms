
"use client"; // Required for hooks like useEffect, useAuth, useRouter

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AppLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // This state should ideally be brief as the useEffect above will redirect.
    // You could show a blank page or a minimal "Redirecting..." message.
    return null; 
  }

  return (
    <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <SidebarInset className="flex flex-col">
            <AppHeader />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6">
                {children}
            </main>
        </SidebarInset>
    </SidebarProvider>
  );
}
