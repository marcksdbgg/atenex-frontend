// File: components/theme-palette-button.tsx (REFACTORIZADO - Temas Reducidos)
"use client";

import * as React from "react";
import { Palette, Check } from "lucide-react"; // Importar Check
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel, // Importar Label
  DropdownMenuSeparator, // Importar Separator
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Definición de temas B2B disponibles (REDUCIDOS)
const themes = [
    { value: 'system', label: 'Automático (Sistema)' },
    { value: 'light', label: 'Claro Profesional' }, // Tema Blanco
    { value: 'dark', label: 'Oscuro Elegante' },   // Tema Azul Oscuro
    { value: 'zinc', label: 'Zinc (Perla)' },     // Tema Perla/Gris Oscuro
];

export function ThemePaletteButton() {
  const { setTheme, theme: activeTheme, resolvedTheme } = useTheme();

  // El tema resuelto (light o dark) si activeTheme es 'system'
  const currentResolvedTheme = resolvedTheme;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
           <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Cambiar tema">
               <Palette className="h-5 w-5"/>
            </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52"> {/* Ancho ajustado */}
           <DropdownMenuLabel className="px-2 py-1.5 text-xs font-semibold">Apariencia</DropdownMenuLabel>
           <DropdownMenuSeparator />
           {themes.map((theme) => {
               // Determinar si este item es el activo (considerando 'system')
               const isActive = activeTheme === theme.value;
               // Si el tema activo es 'system', debemos ver si el 'resolvedTheme' coincide con 'light' o 'dark'
               // Esto es principalmente para la lógica de la marca de verificación, pero no cambia qué se muestra como "activo" en la lista.
               const isEffectivelyActive = activeTheme === theme.value || (activeTheme === 'system' && resolvedTheme === theme.value);

               return (
                 <DropdownMenuItem
                    key={theme.value}
                    onClick={() => setTheme(theme.value)}
                    className={cn(
                        "flex items-center justify-between cursor-pointer text-sm px-2 py-1.5 rounded-sm",
                        isActive // Marca el item del dropdown si es el seleccionado directamente
                          ? "font-semibold text-primary bg-accent dark:bg-accent/50"
                          : "hover:bg-accent/50 dark:hover:bg-accent/20"
                    )}
                 >
                    <span>{theme.label}</span>
                    {/* Mostrar check si este tema es el que está efectivamente activo */}
                    {isEffectivelyActive && ( <Check className="h-4 w-4" /> )}
                 </DropdownMenuItem>
               );
           })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}