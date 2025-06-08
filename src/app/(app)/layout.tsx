import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppHeader } from "@/components/layout/AppHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
