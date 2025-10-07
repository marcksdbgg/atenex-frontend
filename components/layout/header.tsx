// File: components/layout/header.tsx
"use client";

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle, MessageSquare } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();

  const getTitle = () => {
    if (pathname.startsWith('/chat')) return "Chat";
    if (pathname.startsWith('/knowledge')) return "Base de Conocimiento";
    if (pathname.startsWith('/settings')) return "Configuración";
    if (pathname.startsWith('/admin')) return "Panel de Administración";
    return APP_NAME; // Fallback
  };

  const handleNewChat = () => {
    // Si ya estamos en /chat o /chat/[id], la lógica de ChatPage se encargará de resetear.
    // Si estamos en otra página, simplemente navegamos.
    router.push('/chat');
  };

  const showNewChatButton = pathname.startsWith('/chat');

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur-sm md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        {/* <MessageSquare className="h-6 w-6 text-primary" /> // Icono opcional para el título */}
        <h1 className="text-lg font-semibold text-foreground">{getTitle()}</h1>
      </div>
      
      {showNewChatButton && (
        <Button variant="outline" size="sm" onClick={handleNewChat}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Chat
        </Button>
      )}
    </header>
  );
}