// File: components/layout/AdminSidebar.tsx (MODIFICADO - Añadido Footer con UserMenu y Logout)
"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // Importar useRouter
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    BarChartBig, Users, Building, PanelLeftClose, PanelLeftOpen, Settings, Wrench,
    LogOut, // Importar icono Logout
    HelpCircle // Importar icono HelpCircle
} from 'lucide-react';
import { APP_NAME } from '@/lib/constants';
import AtenexLogo from '@/components/icons/atenex-logo';
import { useAuth } from '@/lib/hooks/useAuth'; // Importar useAuth
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"; // Importar DropdownMenu
import { Avatar, AvatarFallback } from "@/components/ui/avatar"; // Importar Avatar
import { Skeleton } from "@/components/ui/skeleton"; // Importar Skeleton
import { ThemePaletteButton } from '@/components/theme-palette-button'; // Importar ThemePaletteButton


interface AdminSidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

// Items de navegación del Admin
const adminNavItems = [
  { href: '/admin?view=stats', label: 'Estadísticas', icon: BarChartBig, view: 'stats' },
  { href: '/admin?view=management', label: 'Gestión', icon: Wrench, view: 'management' },
  { href: '/settings', label: 'Configuración', icon: Settings },
];

export function AdminSidebar({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter(); // Añadir router para navegación
  const { user, signOut, isLoading: isAuthLoading } = useAuth(); // Obtener datos de usuario y función signOut

  // Leer el parámetro 'view' para determinar la sección activa
  const searchParams = React.useMemo(() => {
    if (typeof window !== 'undefined') { // Asegurar que se ejecuta en el cliente
        return new URLSearchParams(window.location.search);
    }
    return new URLSearchParams(); // Devolver vacío en SSR
  }, [pathname]); // Re-calcular si pathname cambia
  const currentView = searchParams.get('view') || 'stats'; // Default a 'stats'

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
          // Redirección ya se maneja dentro de signOut en useAuth
      } catch (error) {
          // Opcional: manejar error si es necesario
      }
  };


  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "flex h-full flex-col border-r bg-card transition-all duration-300 ease-in-out",
          isCollapsed ? "w-[60px] items-center px-2 py-4" : "w-64 p-4"
        )}
      >
        {/* Sección Superior: Logo y Toggle */}
        <div
          className={cn(
            "flex items-center mb-6 relative",
            isCollapsed ? "h-10 justify-center" : "h-12 justify-between"
          )}
        >
          <Link
            href="/admin"
            className={cn(
              "flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm",
              isCollapsed ? 'justify-center w-full' : ''
            )}
            aria-label={`${APP_NAME} - Admin Dashboard`}
          >
            <AtenexLogo className={cn("h-8 w-auto text-primary", isCollapsed ? "h-7" : "")} />
            {!isCollapsed && (
              <span className="text-xl font-bold text-foreground tracking-tight">{APP_NAME} Admin</span>
            )}
          </Link>
           {!isCollapsed && (
             <Button
               variant="ghost"
               size="icon"
               className="h-8 w-8 lg:absolute lg:-right-10 lg:top-2 bg-background border shadow-sm hover:bg-accent"
               onClick={() => setIsCollapsed(true)}
               aria-label="Colapsar sidebar"
             >
               <PanelLeftClose className="h-4 w-4" />
             </Button>
           )}
        </div>

         {isCollapsed && (
           <Button
             variant="ghost"
             size="icon"
             className="h-8 w-8 mb-4"
             onClick={() => setIsCollapsed(false)}
             aria-label="Expandir sidebar"
           >
             <PanelLeftOpen className="h-4 w-4" />
           </Button>
         )}

        {/* Navegación Admin (Ocupa espacio restante) */}
        <nav className={cn("flex flex-col gap-1 flex-grow", isCollapsed ? "items-center mt-4" : "mt-2")}>
          {adminNavItems.map((item) => {
             const isActive = item.href === '/settings'
               ? pathname === item.href
               : item.view === currentView;

            return (
              <Tooltip key={item.href} disableHoverableContent={!isCollapsed}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: isCollapsed ? "icon" : "default" }),
                      "w-full transition-colors duration-150 ease-in-out relative group",
                      isCollapsed ? "h-10 w-10 rounded-lg" : "justify-start pl-3 py-2 text-sm h-10",
                      isActive
                        ? 'font-semibold text-primary bg-primary/10 dark:bg-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 dark:hover:bg-accent/30'
                    )}
                    aria-label={item.label}
                  >
                    {isActive && !isCollapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary rounded-r-md"></span>
                    )}
                    <item.icon
                      className={cn(
                        "h-5 w-5 transition-colors",
                        isCollapsed ? "" : "mr-3",
                        isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
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
        </nav>

         {/* Footer: Botones y Menú Usuario */}
         <div className={cn(
             "flex items-center border-t mt-auto shrink-0", // mt-auto empuja al fondo
             isCollapsed ? "flex-col gap-2 pt-3" : "flex-row gap-2 pt-3 -mx-4 px-4 h-[57px]" // Altura fija y padding cuando expandido
           )}>
             <ThemePaletteButton />
             {/* Botón Ayuda */}
             <Tooltip disableHoverableContent={!isCollapsed}>
                 <TooltipTrigger asChild>
                     <Button
                         variant="ghost"
                         size="icon"
                         className="h-9 w-9 text-muted-foreground hover:text-foreground"
                         onClick={() => router.push('/help')}
                         aria-label="Ayuda y Soporte"
                     >
                         <HelpCircle className="h-5 w-5" />
                     </Button>
                 </TooltipTrigger>
                 {isCollapsed && (
                     <TooltipContent side="right" sideOffset={5}>Ayuda</TooltipContent>
                 )}
             </Tooltip>

             {/* User Menu Dropdown */}
              <div className={cn(isCollapsed ? "w-full mt-auto" : "ml-auto")}> {/* ml-auto para alinear a la derecha si expandido */}
                {isAuthLoading ? (
                    <Skeleton className={cn("rounded-full", isCollapsed ? "h-9 w-9" : "h-9 w-9")}/>
                ) : user ? (
                    <DropdownMenu>
                        <Tooltip disableHoverableContent={!isCollapsed}>
                            <TooltipTrigger asChild>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className={cn(
                                        "relative rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        isCollapsed ? "h-9 w-9 p-0" : "h-9 w-9"
                                    )}>
                                        <Avatar className="h-9 w-9 border">
                                            <AvatarFallback className="bg-secondary text-secondary-foreground font-medium text-xs">
                                                {getInitials(user.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="sr-only">Abrir menú de usuario</span>
                                    </Button>
                                </DropdownMenuTrigger>
                            </TooltipTrigger>
                            {isCollapsed && (
                                <TooltipContent side="right" sideOffset={5} className="flex flex-col items-start">
                                    <span className="font-medium">{user.name || 'Usuario'}</span>
                                    <span className="text-xs text-muted-foreground">{user.email}</span>
                                </TooltipContent>
                            )}
                        </Tooltip>
                        <DropdownMenuContent className="w-60" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal p-2">
                        <div className="flex flex-col space-y-1.5">
                            <p className="text-sm font-medium leading-none truncate" title={user.name || 'Usuario'}>
                                {user.name || 'Usuario'}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground truncate" title={user.email}>
                                {user.email}
                            </p>
                             {/* Mostrar Rol Admin */}
                            {user.isAdmin && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 pt-1" title={`Rol: Admin`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                                        <path fillRule="evenodd" d="M8 1a.75.75 0 0 1 .75.75V3h3.75A1.75 1.75 0 0 1 14.25 4.75v3.51a.75.75 0 0 1-1.5 0V5.76L8 8.41l-4.75-2.65v6.01c0 .17.02.338.059.497l1.49-.497a.75.75 0 1 1 .502 1.414l-2.08 1.04A2.25 2.25 0 0 1 3.25 11H.75a.75.75 0 0 1 0-1.5h1.77a.75.75 0 0 0 .75-.75V4.75A1.75 1.75 0 0 1 5 3h3V1.75A.75.75 0 0 1 8 1Z" clipRule="evenodd" />
                                    </svg>
                                    <span>Rol: Administrador</span>
                                </div>
                            )}
                            {/* Info Empresa (si aplica a admin) */}
                            {user.companyId && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 pt-1" title={`ID Empresa: ${user.companyId}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0">
                                    <path fillRule="evenodd" d="M4 1.75A2.25 2.25 0 0 0 1.75 4v1.5a.75.75 0 0 0 1.5 0V4c0-.414.336-.75.75-.75h8.5c.414 0 .75.336.75.75v1.5a.75.75 0 0 0 1.5 0V4A2.25 2.25 0 0 0 12 1.75H4ZM1.75 8.5A.75.75 0 0 0 1 9.25v2.25A2.25 2.25 0 0 0 3.25 14h9.5A2.25 2.25 0 0 0 15 11.5V9.25a.75.75 0 0 0-1.5 0v2.25c0 .414-.336.75-.75.75h-9.5c-.414 0-.75-.336-.75-.75V9.25a.75.75 0 0 0-.75-.75Z" clipRule="evenodd" />
                                </svg>
                                <span className="truncate">Empresa: {user.companyId.substring(0, 8)}...</span>
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
                    <Skeleton className={cn("rounded-full", isCollapsed ? "h-9 w-9" : "h-9 w-9")}/>
                )}
             </div>
         </div>

      </aside>
    </TooltipProvider>
  );
}