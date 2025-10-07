// File: app/(auth)/layout.tsx (MODIFICADO - Iteración 5.3)
import React from 'react';
import Image from 'next/image';
import { APP_NAME } from '@/lib/constants';
import { BookOpen } from 'lucide-react'; // Usar el mismo icono que en landing

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Fondo gradiente más sutil
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
       {/* Logo consistente con landing */}
       <div className="mb-8 flex items-center space-x-2 text-primary">
         <BookOpen className="h-7 w-7" />
         <span className="text-3xl font-bold">{APP_NAME}</span>
       </div>
      {children}
    </div>
  );
}