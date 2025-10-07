// File: app/help/page.tsx (MODIFICADO - Iteración 5.2)
"use client";

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'; // Añadido CardDescription
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BookText, Mail, Phone } from 'lucide-react'; // Iconos

export default function HelpPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto max-w-3xl p-4 md:p-8 space-y-8">
       {/* Botón volver mejorado */}
        <Button variant="ghost" onClick={() => router.push('/chat')} className="text-sm text-muted-foreground hover:text-foreground mb-4 -ml-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a la Aplicación
        </Button>
      {/* Título principal */}
      <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Ayuda y Soporte</h1>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
             <BookText className="h-5 w-5 text-primary"/> Documentación
          </CardTitle>
          <CardDescription>Recursos y guías para usar Atenex.</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
          <p>
            Encuentra guías detalladas y respuestas a preguntas frecuentes sobre cómo utilizar {APP_NAME}.
            Visita nuestra <a href="https://docs.atenex.com" target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline hover:text-primary/80">documentación oficial</a> para más información.
          </p>
        </CardContent>
      </Card>

       <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
             <Mail className="h-5 w-5 text-primary"/> Contactar con Soporte
          </CardTitle>
           <CardDescription>Si necesitas asistencia adicional.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm"> {/* Tamaño de texto base */}
           <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className='font-medium'>Email:</span>
              <a href="mailto:soporte@atenex.com" className="text-primary underline hover:text-primary/80">soporte@atenex.com</a>
           </div>
           <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <span className='font-medium'>Teléfono:</span>
               <a href="tel:+34123456789" className="text-primary underline hover:text-primary/80">+34 123 456 789</a>
           </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Definición local de APP_NAME si no está importado globalmente
const APP_NAME = "Atenex";