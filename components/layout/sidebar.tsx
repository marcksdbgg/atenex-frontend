// File: components/layout/sidebar.tsx (REFACTORIZADO - Logo y Navegación v2)
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // Quitar useRouter si no se usa aquí
import { cn } from '@/lib/utils';

import { Button, buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BotMessageSquare, Database, Settings, HelpCircle } from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import { ChatHistory } from '@/components/chat/chat-history';
import { Separator } from '@/components/ui/separator';
import AtenexLogo from '@/components/icons/atenex-logo';
import { ThemePaletteButton } from '@/components/theme-palette-button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  isCollapsed: boolean;
}

// Items de navegación actualizados
const navItems = [
  // { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }, // Ejemplo
  { href: '/chat', label: 'Chat', icon: BotMessageSquare },
  { href: '/knowledge', label: 'Conocimiento', icon: Database }, // Texto más corto
  { href: '/settings', label: 'Configuración', icon: Settings },
];

export function Sidebar({ isCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { user, signOut, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  // Helper for user initials
  const getInitials = (name?: string | null): string => {
    if (!name) return '?';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length === 0) return '?';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      // Optionally handle error
    }
  };

  return (
    <aside className={cn(
      'flex h-full flex-col border-r bg-card',
      isCollapsed ? 'w-[60px] items-center px-2 py-4' : 'w-full p-4'
    )}>
      {/* Header: Logo */}
      <div className={cn('flex items-center mb-6', isCollapsed ? 'h-10 justify-center' : 'h-12 justify-start')}>
        <Link
          href="/chat"
          className={cn(
            'flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm',
            isCollapsed ? 'justify-center w-full' : ''
          )}
          aria-label={`${APP_NAME} - Inicio`}
        >
          <AtenexLogo className={cn('h-8 w-auto text-primary', isCollapsed ? 'h-7' : '')} />
          {!isCollapsed && (
            <span className="text-xl font-bold text-foreground tracking-tight">{APP_NAME}</span>
          )}
        </Link>
      </div>

      {/* Main: Navigation + Chat History (chat history is main scrollable area) */}
      <div className={cn('flex flex-col flex-1 min-h-0', isCollapsed ? 'w-full' : '')}>
        {/* Navigation */}
        <nav className={cn(
          'flex flex-col gap-1',
          isCollapsed ? 'items-center mt-4' : 'mt-2'
        )}>
          <TooltipProvider delayDuration={0}>
            {navItems.map((item) => {
              const isChatActive = item.href === '/chat' && (pathname === '/chat' || pathname.startsWith('/chat/'));
              const isActive = isChatActive || (item.href !== '/chat' && pathname.startsWith(item.href));
              return (
                <Tooltip key={item.href} disableHoverableContent={!isCollapsed}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        buttonVariants({ variant: 'ghost', size: isCollapsed ? 'icon' : 'default' }),
                        'w-full transition-colors duration-150 ease-in-out relative group',
                        isCollapsed ? 'h-10 w-10 rounded-lg' : 'justify-start pl-3 py-2 text-sm h-10',
                        isActive
                          ? 'font-semibold text-primary bg-primary/10 dark:bg-primary/20'
                          : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 dark:hover:bg-accent/30'
                      )}
                      aria-label={item.label}
                    >
                      {isActive && !isCollapsed && (
                        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary rounded-r-md transition-all duration-200"></span>
                      )}
                      <item.icon
                        className={cn(
                          'h-5 w-5 transition-colors',
                          isCollapsed ? '' : 'mr-3',
                          isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'
                        )}
                      />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </Link>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="right" sideOffset={5}>
                      {item.label}
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </nav>
        {/* Chat History: always visible, scrollable, flex-1 */}
        {!isCollapsed && (
          <div className="flex-1 flex flex-col min-h-0 mt-4 border-t pt-3 -mx-4 px-4">
            <div className="flex-1 min-h-0 bg-muted/40 rounded-lg shadow-sm p-2">
              <ChatHistory />
            </div>
          </div>
        )}
      </div>

      {/* Footer: Settings, Theme, Help, User menu */}
      {!isCollapsed && (
        <div className="flex flex-row items-end gap-2 border-t pt-3 mt-3 -mx-4 px-4 min-h-[56px]">
          {/* Theme button */}
          <ThemePaletteButton />
          {/* Help button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => router.push('/help')}
            aria-label="Ayuda y Soporte"
          >
            <HelpCircle className="h-5 w-5" />
          </Button>
          {/* User menu */}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Avatar className="h-9 w-9 border">
                    <AvatarFallback className="bg-secondary text-secondary-foreground font-medium text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="sr-only">Abrir menú de usuario</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-60" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-2">
                  <div className="flex flex-col space-y-1.5">
                    <p className="text-sm font-medium leading-none truncate" title={user.name || 'Usuario'}>
                      {user.name || 'Usuario'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground truncate" title={user.email}>
                      {user.email}
                    </p>
                    {user.companyId && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 pt-1" title={`ID Empresa: ${user.companyId}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                          <path fillRule="evenodd" d="M4 1.75A2.25 2.25 0 0 0 1.75 4v1.5a.75.75 0 0 0 1.5 0V4c0-.414.336-.75.75-.75h8.5c.414 0 .75.336.75.75v1.5a.75.75 0 0 0 1.5 0V4A2.25 2.25 0 0 0 12 1.75H4ZM1.75 8.5A.75.75 0 0 0 1 9.25v2.25A2.25 2.25 0 0 0 3.25 14h9.5A2.25 2.25 0 0 0 15 11.5V9.25a.75.75 0 0 0-1.5 0v2.25c0 .414-.336.75-.75.75h-9.5c-.414 0-.75-.336-.75-.75V9.25a.75.75 0 0 0-.75-.75Z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">Empresa: {user.companyId.substring(0, 8)}...</span>
                      </div>
                    )}
                    {user.roles && user.roles.length > 0 && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80" title={`Roles: ${user.roles.join(', ')}`}> 
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                          <path fillRule="evenodd" d="M8 1a.75.75 0 0 1 .75.75V3h3.75A1.75 1.75 0 0 1 14.25 4.75v3.51a.75.75 0 0 1-1.5 0V5.76L8 8.41l-4.75-2.65v6.01c0 .17.02.338.059.497l1.49-.497a.75.75 0 1 1 .502 1.414l-2.08 1.04A2.25 2.25 0 0 1 3.25 11H.75a.75.75 0 0 1 0-1.5h1.77a.75.75 0 0 0 .75-.75V4.75A1.75 1.75 0 0 1 5 3h3V1.75A.75.75 0 0 1 8 1Z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">Rol(es): {user.roles.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configuración</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10 dark:focus:bg-destructive/20">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Cerrar sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Skeleton className="h-9 w-9 rounded-full" />
          )}
        </div>
      )}
    </aside>
  );
}