// File: components/ui/resizable.tsx (MODIFICADO)
"use client"

import * as React from "react"
import { GripVerticalIcon } from "lucide-react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cn } from "@/lib/utils"

function ResizablePanelGroup({
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelGroup>) {
  return (
    <ResizablePrimitive.PanelGroup
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
        className
      )}
      {...props}
    />
  )
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

function ResizableHandle({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.PanelResizeHandle> & {
  withHandle?: boolean
}) {
  return (
    <ResizablePrimitive.PanelResizeHandle
      data-slot="resizable-handle"
      className={cn(
        // Más sutil: opacidad baja, aumenta en hover/focus
        "relative flex w-px items-center justify-center bg-border", // Mantiene la línea de 1px
        "opacity-40 transition-all duration-200 ease-in-out hover:opacity-100 hover:bg-primary/20", // Aumenta opacidad y muestra área sutil en hover
        "focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none focus-visible:opacity-100 focus-visible:bg-primary/10", // Resalta en focus
        "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
        // Estilos para el after (línea visual) - Se puede quitar si se prefiere sin línea extra
        // "after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:-translate-y-1/2 data-[panel-group-direction=vertical]:after:translate-x-0",
        // Estilos para el div del handle si withHandle es true
        "[&[data-panel-group-direction=vertical]>div]:rotate-90",
        className
      )}
      {...props}
    >
      {withHandle && (
        // Más sutil: sin fondo explícito, solo el icono sobre el área resaltada en hover/focus
        <div className="z-10 flex h-5 w-2.5 items-center justify-center rounded-sm">
          {/* Icono más pequeño y con color muted */}
          <GripVerticalIcon className="h-3 w-3 text-muted-foreground" />
        </div>
      )}
    </ResizablePrimitive.PanelResizeHandle>
  )
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }