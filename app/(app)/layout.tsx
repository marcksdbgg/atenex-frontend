// File: app/(app)/layout.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAuth } from '@/lib/hooks/useAuth';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading, signOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const bypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
  const incompleteSetupWarningShown = useRef(false);

  useEffect(() => {
    incompleteSetupWarningShown.current = false;
  }, [user?.userId]);

  useEffect(() => {
    if (bypassAuth) {
      console.warn("AppLayout: Auth check SKIPPED (Bypass).");
      return;
    }
    if (isLoading) {
      console.log("AppLayout: Waiting for auth state...");
      return;
    }
    if (!user) {
      console.log("AppLayout: No user found after loading, redirecting to /");
      router.replace('/');
      return;
    }

    if (user.isAdmin && !pathname.startsWith('/admin')) {
        console.log("AppLayout: Admin user detected outside /admin, redirecting to /admin");
        router.replace('/admin');
        return; 
    }
    if (!user.isAdmin && pathname.startsWith('/admin')) {
        console.log("AppLayout: Non-admin user detected in /admin, redirecting to /chat");
        router.replace('/chat'); 
        return; 
    }

    if (!user.isAdmin && !user.companyId) {
       if (!incompleteSetupWarningShown.current) {
          console.error(`AppLayout: User data is incomplete (CompanyID: ${user?.companyId}). Showing warning.`);
          toast.error("Configuración de cuenta incompleta", { 
            description: "Falta el ID de la compañía. Por favor, contacta al administrador.",
            duration: 10000, // Mantener el toast más tiempo
           });
          incompleteSetupWarningShown.current = true;
       }
    } else if (user.companyId || user.isAdmin) { // Resetear si los datos son correctos
        incompleteSetupWarningShown.current = false;
    }

    console.log("AppLayout: Auth check passed for current route.");

  }, [isLoading, user, bypassAuth, router, pathname, signOut]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Cargando sesión...</p>
      </div>
    );
  }

   if (!user && !bypassAuth) {
        return (
          <div className="flex h-screen items-center justify-center bg-background">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Redirigiendo...</p>
          </div>
        );
   }

  if (user?.isAdmin) {
      return <AdminLayout>{children}</AdminLayout>;
  }
  else if (user) {
      return (
         <div className="flex h-screen bg-secondary/30 dark:bg-muted/30 overflow-hidden">
          <ResizablePanelGroup direction="horizontal" className="h-full items-stretch">
              <ResizablePanel
                  collapsible collapsedSize={4} minSize={15} maxSize={25} defaultSize={18}
                  onCollapse={() => setIsSidebarCollapsed(true)} onExpand={() => setIsSidebarCollapsed(false)}
                  className={cn(
                      "transition-all duration-300 ease-in-out bg-background dark:bg-card",
                      isSidebarCollapsed ? "min-w-[60px] max-w-[60px]" : "min-w-[220px]"
                  )}
                  order={1}
              >
                  <Sidebar isCollapsed={isSidebarCollapsed} />
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={82} minSize={30} order={2} className="flex flex-col"> {/* Panel principal ahora es flex-col */}
                  <Header />
                  {/* Main ahora tiene flex-1, min-h-0 y overflow-hidden para que el contenido del chat se ajuste */}
                  <main className="flex-1 bg-background overflow-hidden min-h-0 flex flex-col">
                      {children}
                  </main>
              </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      );
  }

  return null;
}