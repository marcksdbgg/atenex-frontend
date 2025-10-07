// File: app/layout.tsx (CORREGIDO - Sin cabecera duplicada)
// Purpose: Root layout, sets up global providers (Theme, Auth) and Toaster.
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css"; // Import global styles
// Quitamos import de AtenexLogo aquí
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/lib/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";

// Setup Inter font
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

// Metadata for the application
export const metadata: Metadata = {
  title: "Atenex - AI Knowledge Assistant",
  description: "Query your enterprise knowledge base using natural language with Atenex.",
  // Añadir icono usando el logo SVG (requiere ponerlo en /public o /app)
  // icons: {
  //   icon: '/favicon.svg', // O la ruta a tu logo SVG
  // },
};

// Quitamos APP_NAME si no se usa aquí directamente
// const APP_NAME = "Atenex";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          inter.variable
        )}
      >
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* ELIMINADA la <header> de aquí */}
            {/* Renderiza directamente el contenido de la página/layout anidado */}
            {children}
            {/* Toaster global */}
            <Toaster richColors position="top-right" closeButton />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}