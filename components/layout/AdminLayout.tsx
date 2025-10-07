// File: components/layout/AdminLayout.tsx
"use client";

import React, { useState } from 'react';
import { Header } from './header'; // Reutilizamos el header general
import { AdminSidebar } from './AdminSidebar'; // Sidebar específico para admin
import { cn } from '@/lib/utils';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  // El estado de colapso podría ser útil si el AdminSidebar lo soporta
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-muted/30 overflow-hidden">
      {/* Admin Sidebar */}
      <AdminSidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
      />

      {/* Contenido Principal Admin */}
      <div className="flex h-full flex-1 flex-col">
        <Header /> {/* Reutilizar header si es apropiado */}
        <main className="flex-1 overflow-y-auto bg-background p-6 lg:p-8">
          {children} {/* Aquí se renderizará el contenido de /admin/page.tsx */}
        </main>
      </div>
    </div>
  );
}