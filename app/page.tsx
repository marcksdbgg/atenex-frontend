// File: app/page.tsx
"use client";

import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { APP_NAME } from '@/lib/constants';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils';
import {
    Loader2, Home as HomeIcon, Info, Mail, Search, Library, Zap, ChevronRight,
    UploadCloud, BrainCircuit, MessageSquare, CheckCircle, GraduationCap, HelpCircle, TrendingUp, // Cómo Funciona
    Briefcase, FileLock, ShieldCheck, Settings, Lightbulb, Scale // Casos Uso y Seguridad
} from 'lucide-react';
import Link from 'next/link';
import AtenexLogoIcon from '@/components/icons/atenex-logo';
import { Separator } from '@/components/ui/separator'; // Importar Separator

// Mapeo de iconos extendido
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Search, Library, Zap, HomeIcon, Info, Mail, UploadCloud, BrainCircuit, MessageSquare,
  CheckCircle, GraduationCap, HelpCircle, TrendingUp, Briefcase, FileLock, ShieldCheck, Settings, Lightbulb, Scale
};

// Empresas Placeholder para Social Proof
const trustedLogos = [
    { name: "Empresas Innovadoras", logo: null }, // Usaremos texto como placeholder
    { name: "Consultora Global", logo: null },
    { name: "Startup Tecnológica", logo: null },
    { name: "Sector Financiero", logo: null },
    { name: "Manufactura Avanzada", logo: null },
];

// Pasos Cómo Funciona
const howItWorksSteps = [
    { icon: UploadCloud, title: "1. Carga Segura", description: "Sube documentos y datos de múltiples formatos de forma segura." },
    { icon: BrainCircuit, title: "2. Procesamiento IA", description: "Atenex indexa y comprende semánticamente el contenido." },
    { icon: MessageSquare, title: "3. Consulta Natural", description: "Haz preguntas como hablarías con un experto humano." },
    { icon: CheckCircle, title: "4. Respuesta Precisa", description: "Recibe respuestas directas con las fuentes originales verificadas." },
];

// Casos de Uso
const useCases = [
  { icon: GraduationCap, title: "Onboarding y Formación", description: "Acelera la integración de nuevos empleados dándoles acceso instantáneo a políticas, guías y documentación relevante." },
  { icon: HelpCircle, title: "Soporte Interno (TI/RRHH)", description: "Responde preguntas frecuentes de forma automática sobre procesos internos, beneficios o soporte técnico." },
  { icon: TrendingUp, title: "Ventas y Marketing", description: "Accede rápidamente a información de producto, estudios de caso y argumentarios de venta actualizados." },
  { icon: Lightbulb, title: "I+D y Producto", description: "Encuentra investigaciones pasadas, especificaciones técnicas y feedback de usuarios para innovar más rápido." },
  { icon: Scale, title: "Cumplimiento y Legal", description: "Localiza fácilmente políticas, regulaciones y documentación contractual específica." },
];

// Puntos de Seguridad
const securityPoints = [
    { icon: ShieldCheck, title: "Seguridad de Datos", description: "Protegemos tu información con encriptación en tránsito y en reposo, y las mejores prácticas de seguridad cloud." },
    { icon: FileLock, title: "Privacidad Garantizada", description: "Tu conocimiento es tuyo. Nunca usamos tus datos para entrenar modelos de IA públicos." },
    // { icon: Settings, title: "Control de Acceso", description: "Gestiona permisos para asegurar que solo el personal autorizado acceda a información sensible (Próximamente)." },
];


export default function HomePage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const isAuthenticated = !isAuthLoading && !!user;

  // Decide el texto y la acción del CTA principal (Mantenemos "Comenzar Ahora" por simplicidad, podría ser "Solicitar Demo")
  const mainCtaText = isAuthenticated ? 'Ir a la App' : 'Comenzar Ahora';
  const mainCtaAction = () => {
    if (isAuthenticated) {
        router.push('/chat');
    } else {
        router.push('/login');
    }
  };


  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-b from-background via-background to-secondary/10 dark:to-muted/10">
      {/* --- Header --- */}
      <header className="sticky top-0 z-50 w-full bg-background/90 backdrop-blur-lg border-b border-border/60">
        {/* FLAG_LLM: Añadido container y mx-auto al div interior para centrar el header */}
        <div className="container mx-auto flex items-center justify-between h-16 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm" aria-label={`${APP_NAME} - Inicio`}>
             <AtenexLogoIcon className="h-7 w-auto" />
            <span className='font-bold'>{APP_NAME}</span>
          </Link>
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <LinkButton href="/" Icon={HomeIcon} isActive={true}>Inicio</LinkButton>
            <LinkButton href="/about" Icon={Info}>Nosotros</LinkButton>
            <LinkButton href="/contact" Icon={Mail}>Contacto</LinkButton>
            <div className="pl-2 sm:pl-4">
                {isAuthLoading ? ( <Button variant="ghost" disabled={true} size="sm" className="w-[95px]"> <Loader2 className="h-4 w-4 animate-spin" /> </Button> )
                 : isAuthenticated ? ( <Button variant="default" onClick={() => router.push('/chat')} size="sm" className="w-[95px] shadow-sm"> Ir a la App </Button> )
                 : ( <Button variant="outline" onClick={() => router.push('/login')} size="sm" className="w-[95px] transition-colors duration-150 hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"> Acceder </Button> )}
            </div>
          </nav>
        </div>
      </header>

      {/* --- Contenido Principal --- */}
      <main className="flex-1 flex flex-col items-center text-center animate-fade-in opacity-0 [--animation-delay:200ms]" style={{animationFillMode: 'forwards'}}>

         {/* --- Hero Section --- */}
         <section className="w-full pt-16 pb-16 md:pt-24 md:pb-20 px-4">
             {/* FLAG_LLM: Añadido container y mx-auto para centrar el contenido hero */}
            <div className="container mx-auto max-w-4xl">
                <div className="mb-8 flex justify-center">
                    <AtenexLogoIcon className="h-24 w-auto text-primary drop-shadow-lg" />
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tighter text-foreground mb-6 leading-tight">
                    Desbloquea el Conocimiento Oculto en tu Empresa con <span className="text-primary">{APP_NAME}</span>
                </h1>
                <h2 className="text-xl sm:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
                    La IA que conecta a tu equipo con la información crucial de tus documentos, al instante.
                </h2>
                <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                    Haz preguntas en lenguaje natural. Obtén respuestas precisas al instante, directamente desde los documentos y datos de tu organización.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {isAuthLoading ? ( <Button size="lg" disabled={true} className="w-full sm:w-auto px-8 shadow-md"> <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando... </Button>)
                     : ( <Button size="lg" onClick={mainCtaAction} className={cn("w-full sm:w-auto px-8 transition-transform duration-150 ease-in-out transform hover:scale-[1.03]", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:outline-none shadow-lg")}> {mainCtaText} <ChevronRight className='ml-1 h-5 w-5'/> </Button> )}
                </div>
                {!isAuthenticated && !isAuthLoading && ( <p className="text-xs text-muted-foreground mt-6"> ¿Ya tienes cuenta?{' '} <Link href="/login" className="font-medium text-primary hover:underline underline-offset-4"> Inicia Sesión </Link> </p> )}
            </div>
         </section>
         {/* --- FIN Hero Section --- */}

         {/* --- Social Proof Section --- */}
         <section className="w-full py-12 md:py-16 bg-gradient-to-b from-background to-muted/20 dark:to-muted/10 border-y">
             {/* FLAG_LLM: Añadido container y mx-auto para centrar el contenido de social proof */}
            <div className="container mx-auto max-w-5xl px-4">
                 <h3 className="text-center text-lg font-semibold text-muted-foreground tracking-wider uppercase mb-8">
                    Impulsando Empresas Como la Tuya
                 </h3>
                 <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 opacity-70">
                    {trustedLogos.map(logo => (
                        <span key={logo.name} className="text-sm font-medium text-muted-foreground italic" title={logo.name}>
                            {logo.name}
                        </span>
                    ))}
                 </div>
            </div>
         </section>
         {/* --- FIN Social Proof --- */}


         {/* --- Cómo Funciona Section --- */}
         <section className="w-full py-16 md:py-24 px-4">
             {/* FLAG_LLM: Añadido container y mx-auto para centrar el contenido de cómo funciona */}
             <div className="container mx-auto max-w-4xl text-center">
                <h2 className="text-3xl font-bold tracking-tight mb-4">Atenex en Acción</h2>
                <p className="text-lg text-muted-foreground mb-12">De documentos dispersos a decisiones informadas en 4 simples pasos.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
                    {howItWorksSteps.map((step) => (
                        <div key={step.title} className="flex flex-col items-center text-center">
                            <div className="mb-4 flex items-center justify-center h-14 w-14 rounded-full bg-primary/10 text-primary">
                                <step.icon className="h-7 w-7" />
                            </div>
                            <h4 className="text-md font-semibold mb-1.5">{step.title}</h4>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                        </div>
                    ))}
                </div>
             </div>
         </section>
         {/* --- FIN Cómo Funciona --- */}


         {/* --- Features Section --- */}
         <section className="w-full py-16 md:py-24 px-4 bg-muted/20 dark:bg-muted/10 border-y">
             {/* FLAG_LLM: Añadido container y mx-auto para centrar las features */}
             <div className="container mx-auto max-w-6xl">
                 <h2 className="text-3xl font-bold tracking-tight text-center mb-12">Potencia Tu Inteligencia Empresarial</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                    <FeatureCard title="Búsqueda Inteligente" description="Encuentra información exacta al instante usando lenguaje natural, ahorrando horas de búsqueda manual y frustración." icon="Search"/>
                    <FeatureCard title="Conocimiento Centralizado" description="Rompe los silos de información accediendo al conocimiento colectivo en un solo lugar seguro, eliminando la duplicidad de esfuerzos." icon="Library"/>
                    <FeatureCard title="Productividad Mejorada" description="Empodera a tu equipo con acceso rápido a datos relevantes, acelerando la incorporación y permitiendo decisiones más rápidas." icon="Zap"/>
                </div>
            </div>
         </section>
         {/* --- FIN Features Section --- */}


         {/* --- Casos de Uso Section --- */}
         <section className="w-full py-16 md:py-24 px-4">
             {/* FLAG_LLM: Añadido container y mx-auto para centrar los casos de uso */}
             <div className="container mx-auto max-w-6xl">
                 <h2 className="text-3xl font-bold tracking-tight text-center mb-4">Ideal Para Cada Departamento</h2>
                 <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">Desde RRHH hasta I+D, Atenex se adapta a las necesidades específicas de tu equipo.</p>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                     {useCases.map((useCase) => (
                         <UseCaseCard key={useCase.title} {...useCase} />
                     ))}
                 </div>
            </div>
         </section>
         {/* --- FIN Casos de Uso --- */}


         {/* --- Seguridad Section --- */}
         <section className="w-full py-16 md:py-24 px-4 bg-muted/20 dark:bg-muted/10 border-y">
             {/* FLAG_LLM: Añadido container y mx-auto para centrar la sección de seguridad */}
             <div className="container mx-auto max-w-4xl text-center">
                 <h2 className="text-3xl font-bold tracking-tight mb-4">Seguridad y Confianza en el Núcleo</h2>
                 <p className="text-lg text-muted-foreground mb-12">Tu información es tu activo más valioso. La protegemos como si fuera nuestra.</p>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                     {securityPoints.map((point) => (
                         <div key={point.title} className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border">
                            <point.icon className="h-8 w-8 text-primary mt-1 flex-shrink-0" />
                            <div>
                                <h4 className="text-md font-semibold mb-1">{point.title}</h4>
                                <p className="text-sm text-muted-foreground">{point.description}</p>
                            </div>
                         </div>
                     ))}
                 </div>
            </div>
         </section>
         {/* --- FIN Seguridad --- */}


         {/* --- CTA Final Section --- */}
         <section className="w-full py-16 md:py-24 px-4">
             {/* FLAG_LLM: Añadido container y mx-auto para centrar el CTA final */}
            <div className="container mx-auto max-w-3xl text-center">
                 <h2 className="text-3xl font-bold tracking-tight mb-4">¿Listo para Potenciar tu Conocimiento Interno?</h2>
                 <p className="text-lg text-muted-foreground mb-8">Descubre cómo Atenex puede transformar el acceso a la información en tu empresa.</p>
                  {/* Repetir CTA Principal */}
                  {isAuthLoading ? (
                     <Button size="lg" disabled={true} className="w-full sm:w-auto px-8 shadow-md"> <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Cargando... </Button>
                  ) : (
                  <Button size="lg" onClick={mainCtaAction} className={cn( "w-full sm:w-auto px-8 transition-transform duration-150 ease-in-out transform hover:scale-[1.03]", "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus:outline-none shadow-lg" )}> {mainCtaText} <ChevronRight className='ml-1 h-5 w-5'/> </Button>
                 )}
                 {!isAuthenticated && !isAuthLoading && ( <p className="text-xs text-muted-foreground mt-4"> O <Link href="/contact" className="font-medium text-primary hover:underline underline-offset-4"> contacta con ventas </Link> para una demo personalizada. </p> )}
            </div>
         </section>
         {/* --- FIN CTA Final --- */}

      </main>
      {/* --- FIN Contenido Principal --- */}


      {/* --- Footer --- */}
      <footer className="bg-muted/20 border-t border-border/60 py-6 mt-auto">
         {/* FLAG_LLM: Añadido container y mx-auto al div interior para centrar el footer */}
        <div className="container mx-auto text-center text-muted-foreground text-xs sm:text-sm flex flex-col sm:flex-row justify-between items-center gap-2">
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
      {/* --- FIN Footer --- */}
    </div>
  );
}

// --- Componentes Auxiliares ---

// LinkButton (sin cambios)
function LinkButton({ href, children, Icon, isActive = false }: { href: string; children: React.ReactNode; Icon?: React.ComponentType<{ className?: string }>; isActive?: boolean }) {
  return ( <Link href={href} className={cn( buttonVariants({ variant: 'ghost' }), "text-sm px-2 sm:px-3 py-1 h-8 rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring", isActive ? "text-primary font-semibold bg-primary/10" : "text-muted-foreground" )}> {Icon && <Icon className="h-4 w-4 mr-1.5 hidden sm:inline-block flex-shrink-0" />} {children} </Link> );
}

// FeatureCard (sin cambios estructurales, texto refinado arriba)
function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
   const IconComponent = iconMap[icon] || Info;
  return ( <div className={cn( "p-6 rounded-xl bg-card/60 backdrop-blur-sm border border-border/60", "hover:bg-card/90 hover:shadow-lg hover:-translate-y-1", "transition-all duration-200 ease-in-out text-left" )}> <IconComponent className="w-8 h-8 mb-4 text-primary" /> <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3> <p className="text-sm text-muted-foreground leading-relaxed">{description}</p> </div> );
}

// UseCaseCard (NUEVO)
function UseCaseCard({ title, description, icon: Icon }: { title: string; description: string; icon: React.ComponentType<{ className?: string }> }) {
    return (
      <div className="p-6 rounded-lg border bg-card/80 text-left h-full flex flex-col shadow-sm hover:shadow-md transition-shadow">
        <Icon className="w-7 h-7 mb-3 text-primary flex-shrink-0" />
        <h3 className="text-md font-semibold text-foreground mb-1.5">{title}</h3>
        <p className="text-sm text-muted-foreground leading-snug flex-grow">{description}</p>
      </div>
    );
}