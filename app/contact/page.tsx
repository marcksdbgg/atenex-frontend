// File: app/contact/page.tsx (MODIFICADO - Iteración 3: Formulario y Estilo)
"use client";

import React, { useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button'; // Importar buttonVariants
import { useRouter } from 'next/navigation';
import { APP_NAME } from '@/lib/constants';
import { useAuth } from '@/lib/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, Linkedin, Loader2, Building, MapPin, Send, Info, Check } from 'lucide-react'; // Añadidos Send, Info, Check
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Importar Select
import { Checkbox } from "@/components/ui/checkbox"; // Importar Checkbox
import AtenexLogoIcon from '@/components/icons/atenex-logo'; // Importar logo

// Opciones para el dropdown de motivo
const contactReasons = [
    "Solicitar una Demo",
    "Información de Precios",
    "Consulta Técnica",
    "Soporte",
    "Colaboración / Partnership",
    "Otro",
];

export default function ContactPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const isAuthenticated = !isAuthLoading && !!user;

  // Header consistente con otras páginas públicas
  const renderHeader = () => (
    <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-lg border-b border-border/60">
        <div className="container flex items-center justify-between h-16 px-4 md:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-semibold text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            aria-label={`${APP_NAME} - Inicio`}
          >
             {/* Usar AtenexLogoIcon aquí también */}
             <AtenexLogoIcon className="h-7 w-auto" />
            <span className='font-bold'>{APP_NAME}</span>
          </Link>
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <LinkButton href="/">Inicio</LinkButton>
            <LinkButton href="/about">Nosotros</LinkButton>
            <LinkButton href="/contact" isActive={true}>Contacto</LinkButton>
            <div className="pl-2 sm:pl-4">
                {isAuthLoading ? (
                    <Button variant="ghost" disabled={true} size="sm" className="w-[95px]"> <Loader2 className="h-4 w-4 animate-spin" /> </Button>
                ) : isAuthenticated ? (
                    <Button variant="default" onClick={() => router.push('/chat')} size="sm" className="w-[95px] shadow-sm"> Ir a la App </Button>
                ) : (
                    <Button variant="outline" onClick={() => router.push('/login')} size="sm" className="w-[95px]"> Acceder </Button>
                )}
            </div>
          </nav>
        </div>
    </header>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-muted/10 dark:to-muted/10">
      {renderHeader()}

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-12 md:py-20 flex-1">
        {/* Título y descripción Actualizados */}
        <section className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4">
            Hablemos
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Completa el formulario o utiliza nuestros datos de contacto. Estamos listos para ayudarte a implementar Atenex en tu organización.
          </p>
        </section>

        {/* Grid para Formulario e Información */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start max-w-6xl mx-auto">

          {/* Columna Izquierda: Formulario Actualizado */}
          <Card className="lg:col-span-3 shadow-lg border border-border/60"> {/* Sombra más pronunciada */}
            <CardHeader>
              <CardTitle>Envíanos tu Consulta</CardTitle>
              <CardDescription>
                Nos pondremos en contacto contigo lo antes posible.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Componente de formulario mejorado */}
              <ContactForm />
            </CardContent>
          </Card>

          {/* Columna Derecha: Información Adicional Actualizada */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-md border">
              <CardHeader>
                <CardTitle className="text-lg">Información Directa</CardTitle>
                 <CardDescription>Otras formas de contactarnos.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4"> {/* Aumentar espaciado */}
                 {/* Email Actualizado */}
                 <ContactInfoItem Icon={Mail} label="Email Principal:" href="mailto:mark.romero.dev@gmail.com" text="mark.romero.dev@gmail.com" />
                 {/* LinkedIn Placeholder */}
                 <ContactInfoItem Icon={Linkedin} label="LinkedIn:" href="#" text="MarkDev (Próximamente)" isPlaceholder={true} />
                 {/* Teléfono Placeholder */}
                 {/* <ContactInfoItem Icon={Phone} label="Teléfono:" href="tel:+15551234567" text="+1 (555) 123-4567" /> */}
                 {/* WhatsApp Placeholder */}
                 {/* <ContactInfoItem Icon={MessageCircle} label="WhatsApp:" href="https://wa.me/15551234567" text="Chatea por WhatsApp" targetBlank={true}/> */}
                 <Separator className='my-4'/>
                 {/* Oficina Placeholder */}
                 <ContactInfoItem Icon={MapPin} label="Ubicación:" text="Desarrollo Remoto" />
                 <Separator className='my-4'/>
                 {/* Nota sobre tiempo de respuesta */}
                 <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <Info className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Normalmente respondemos en 24 horas hábiles.</span>
                 </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

       {/* Footer Consistente */}
       <footer className="bg-muted/20 border-t border-border/60 py-6 mt-16">
         <div className="container text-center text-muted-foreground text-xs sm:text-sm flex flex-col sm:flex-row justify-between items-center gap-2">
           <div className="flex flex-col sm:flex-row gap-1 sm:gap-2 items-center">
               <span>© {new Date().getFullYear()} {APP_NAME}. Todos los derechos reservados.</span>
               <span className="hidden sm:inline-block opacity-50">|</span>
               <span className='opacity-80'>Desarrollado por MarkDev</span>
           </div>
           <div className="flex gap-3">
              <Link href="/privacy" className="hover:text-primary hover:underline underline-offset-4 transition-colors">Política de Privacidad</Link>
              <span className='opacity-50'>|</span>
              <Link href="/terms" className="hover:text-primary hover:underline underline-offset-4 transition-colors">Términos de Servicio</Link>
           </div>
         </div>
       </footer>
    </div>
  );
}

// Componente LinkButton (Header Navigation)
function LinkButton({ href, children, Icon, isActive = false }: { href: string; children: React.ReactNode; Icon?: React.ComponentType<{ className?: string }>; isActive?: boolean }) {
  return (
    <Link
        href={href}
        className={cn(
            buttonVariants({ variant: 'ghost' }),
            "text-sm px-2 sm:px-3 py-1 h-8 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            isActive ? "text-primary font-semibold bg-primary/10" : "text-muted-foreground"
        )}
     >
       {Icon && <Icon className="h-4 w-4 mr-1.5 hidden sm:inline-block flex-shrink-0" />}
      {children}
    </Link>
  );
}


// Formulario de contacto Actualizado
function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  // Aquí iría la integración con react-hook-form y zod para validación real

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setIsSubmitting(true);
      setSubmitSuccess(false);
      console.log("Simulando envío de formulario...");

      // Simular llamada API
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Simular éxito
      toast.success("Consulta Enviada", { description: "Gracias por contactarnos. Te responderemos pronto."});
      setSubmitSuccess(true);
      // Aquí se resetearía el formulario con react-hook-form form.reset()

      // Simular fallo (descomentar para probar)
      // toast.error("Error al Enviar", { description: "Hubo un problema al enviar tu consulta. Inténtalo de nuevo." });

      setIsSubmitting(false);

      // Opcional: Resetear el estado de éxito después de un tiempo
      // setTimeout(() => setSubmitSuccess(false), 4000);
  }

  return (
      <form onSubmit={handleSubmit} className="space-y-5"> {/* Aumentar espaciado */}
         {/* Fila Nombre y Correo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre Completo <span className="text-destructive">*</span></Label>
              <Input id="name" required placeholder="Tu Nombre" disabled={isSubmitting} />
              {/* Aquí irían los mensajes de error de validación */}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo Electrónico <span className="text-destructive">*</span></Label>
              <Input id="email" type="email" required placeholder="tu@empresa.com" disabled={isSubmitting} />
            </div>
        </div>
         {/* Fila Empresa y Teléfono */}
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <Label htmlFor="companyName">Nombre de la Empresa</Label>
                <Input id="companyName" placeholder="Nombre de tu Organización" disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="phone">Teléfono (Opcional)</Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" disabled={isSubmitting} />
            </div>
        </div>
         {/* Motivo de Contacto */}
        <div className="space-y-1.5">
          <Label htmlFor="reason">Motivo de Contacto <span className="text-destructive">*</span></Label>
          <Select name="reason" required disabled={isSubmitting}>
              <SelectTrigger id="reason" className="w-full">
                <SelectValue placeholder="Selecciona un motivo..." />
              </SelectTrigger>
              <SelectContent>
                {contactReasons.map(reason => (
                     <SelectItem key={reason} value={reason}>{reason}</SelectItem>
                ))}
              </SelectContent>
          </Select>
        </div>
         {/* Mensaje */}
        <div className="space-y-1.5">
          <Label htmlFor="message">Mensaje <span className="text-destructive">*</span></Label>
          <Textarea
            id="message"
            required
            placeholder="Cuéntanos cómo podemos ayudarte..."
            className="min-h-[120px]"
            disabled={isSubmitting}
          />
        </div>
         {/* Checkbox Privacidad */}
         <div className="flex items-center space-x-2">
            <Checkbox id="privacy" required disabled={isSubmitting} />
            <Label htmlFor="privacy" className="text-xs text-muted-foreground font-normal">
                 He leído y acepto la <Link href="/privacy" className="underline hover:text-primary" target="_blank">Política de Privacidad</Link>. <span className="text-destructive">*</span>
            </Label>
         </div>
         {/* Botón Enviar */}
        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting || submitSuccess}>
           {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
           {submitSuccess && <Check className="mr-2 h-4 w-4" />}
           {isSubmitting ? 'Enviando...' : submitSuccess ? 'Enviado Correctamente' : 'Enviar Consulta'}
        </Button>
      </form>
  );
}

// Componente ContactInfoItem Actualizado
function ContactInfoItem({ Icon, label, href, text, targetBlank = false, isPlaceholder = false }: {
    Icon: React.ComponentType<{ className?: string }>,
    label: string,
    href?: string,
    text: string,
    targetBlank?: boolean,
    isPlaceholder?: boolean // Prop para indicar si es placeholder
}) {
    const content = (
        <>
            <Icon className={cn("h-4 w-4 flex-shrink-0", isPlaceholder ? "text-muted-foreground/60" : "text-primary")} />
            <div className="flex flex-col flex-1 min-w-0">
                <span className={cn("font-medium", isPlaceholder ? "text-muted-foreground/80" : "text-foreground/90")}>{label}</span>
                 <span className={cn("text-muted-foreground break-words", isPlaceholder && "italic")}>{text}</span>
             </div>
        </>
    );
    const containerClasses = cn("flex items-start space-x-3 text-sm", isPlaceholder && "opacity-70"); // Usa items-start y gap
    const linkClasses = "inline-flex items-start gap-3 group hover:opacity-80 transition-opacity w-full";

    return (
        <div className={containerClasses}>
            {href && !isPlaceholder ? (
                 <a
                    href={href}
                    className={cn(linkClasses)}
                    target={targetBlank ? "_blank" : undefined}
                    rel={targetBlank ? "noopener noreferrer" : undefined}
                >
                    {content}
                 </a>
            ) : (
                <div className="inline-flex items-start gap-3 w-full">{content}</div>
            )}
        </div>
    );
}