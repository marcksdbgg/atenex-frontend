// File: app/about/tsx (MODIFICADO - Iteración 2: Reestructuración y Contenido)
"use client";

import React from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { APP_NAME } from '@/lib/constants';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Building, Users, Target, Eye, HeartHandshake, Zap, Lightbulb, Linkedin } from 'lucide-react'; // Importar iconos
import Link from 'next/link';
import { cn } from '@/lib/utils';

// Información del Fundador
const founder = {
    name: "Mark Romero",
    alias: "MarkDev",
    role: "Fundador y Desarrollador Principal",
    bio: "Apasionado por la inteligencia artificial y la optimización de procesos empresariales. Con experiencia en desarrollo de software full-stack y soluciones de IA, Mark creó Atenex para resolver el desafío del acceso al conocimiento fragmentado en las organizaciones.",
    imageUrl: null, // Reemplazar con URL si hay foto profesional
    linkedinUrl: null, // Reemplazar con URL de LinkedIn si existe
};

// Valores de la empresa
const coreValues = [
    { icon: HeartHandshake, title: "Integridad", description: "Mantenemos los más altos estándares éticos en todo lo que hacemos." },
    { icon: Lightbulb, title: "Innovación", description: "Buscamos continuamente nuevas y mejores formas de resolver problemas." },
    { icon: Zap, title: "Éxito del Cliente", description: "Estamos dedicados a ayudar a nuestros clientes a alcanzar sus objetivos." },
    { icon: Users, title: "Colaboración", description: "Creemos en el poder de trabajar juntos para lograr resultados excepcionales." },
];

export default function AboutPage() {
    const router = useRouter();

    // Header consistente con otras páginas públicas (Asumiendo que existe /layout.tsx global para estas)
    // Si no, se replicaría aquí como en contact.tsx

  return (
    // Contenedor principal con padding y layout de una columna
    <div className="bg-gradient-to-b from-background via-background to-muted/10 min-h-screen">
        {/* Contenido de la página */}
        <div className="container mx-auto max-w-4xl px-4 py-12 md:py-20 space-y-12 md:space-y-16">
            {/* Botón volver */}
            <Button variant="ghost" onClick={() => router.push('/')} className="text-sm text-muted-foreground hover:text-foreground -ml-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>

             {/* --- Hero Section --- */}
            <section className="text-center border-b pb-12 md:pb-16">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
                    Nuestra Pasión: Conectar Empresas con su Propio Conocimiento
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                    En {APP_NAME}, creemos que el activo más valioso de una organización es su conocimiento colectivo. Nuestra misión es hacerlo accesible, útil e instantáneo para todos.
                </p>
                 {/* Placeholder para imagen hero */}
                 {/* <div className="mt-8 h-48 bg-muted rounded-lg flex items-center justify-center text-muted-foreground italic">
                    [Imagen Representativa: Innovación / Equipo / Conexión]
                 </div> */}
            </section>
            {/* --- FIN Hero Section --- */}


            {/* --- Historia / Origen --- */}
            <section>
                <h2 className="text-3xl font-bold tracking-tight text-center mb-8">El Nacimiento de {APP_NAME}</h2>
                <div className="prose prose-lg dark:prose-invert max-w-none mx-auto text-foreground/90 leading-relaxed text-center">
                    <p>
                        Fundada por <span className='font-semibold'>{founder.name} ({founder.alias})</span>, {APP_NAME} nació de la frustración común en muchas empresas: información vital dispersa en documentos, correos y sistemas inconexos, haciendo casi imposible encontrar respuestas rápidas y fiables.
                    </p>
                    <p>
                        Viendo el potencial transformador de la inteligencia artificial, la visión fue clara: crear una herramienta intuitiva que permitiera a cualquier miembro del equipo 'conversar' con la base de conocimiento de su organización, obteniendo información precisa y contextualizada al instante. Así nació Atenex.
                    </p>
                </div>
            </section>
            {/* --- FIN Historia --- */}

            <Separator className="my-8 md:my-12" />

             {/* --- Misión y Visión --- */}
             <section className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div className="text-center md:text-left">
                    <Target className="h-10 w-10 text-primary mx-auto md:mx-0 mb-3" />
                    <h3 className="text-2xl font-semibold mb-2">Nuestra Misión</h3>
                    <p className="text-muted-foreground">
                        Empoderar a las organizaciones con acceso fluido a su conocimiento colectivo, optimizando la gestión de la información, facilitando decisiones informadas y mejorando la productividad del equipo a través de soluciones innovadoras de IA.
                    </p>
                </div>
                 <div className="text-center md:text-left">
                    <Eye className="h-10 w-10 text-primary mx-auto md:mx-0 mb-3" />
                    <h3 className="text-2xl font-semibold mb-2">Nuestra Visión</h3>
                    <p className="text-muted-foreground">
                        Ser la plataforma líder de consulta de conocimiento inteligente, transformando cómo las empresas aprovechan su experiencia interna y fomentando una cultura de aprendizaje y crecimiento continuos.
                    </p>
                </div>
            </section>
            {/* --- FIN Misión y Visión --- */}

            <Separator className="my-8 md:my-12" />

            {/* --- Valores --- */}
            <section>
                <h2 className="text-3xl font-bold tracking-tight text-center mb-10">Nuestros Valores Fundamentales</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                    {coreValues.map((value) => (
                        <div key={value.title} className="flex flex-col items-center text-center p-4 border rounded-lg bg-card/50 shadow-sm">
                            <value.icon className="h-8 w-8 text-primary mb-3" />
                            <h4 className="text-md font-semibold mb-1">{value.title}</h4>
                            <p className="text-sm text-muted-foreground">{value.description}</p>
                        </div>
                    ))}
                </div>
            </section>
            {/* --- FIN Valores --- */}

             <Separator className="my-8 md:my-12" />

            {/* --- Equipo --- */}
            <section>
                <h2 className="text-3xl font-bold tracking-tight text-center mb-10">Conoce al Fundador</h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 bg-card p-8 rounded-lg border shadow-sm">
                    <Avatar className="h-32 w-32 border-4 border-primary/20">
                        {founder.imageUrl ? (
                            <AvatarImage src={founder.imageUrl} alt={founder.name} />
                        ) : (
                            <AvatarFallback className='text-4xl bg-muted'>{founder.name.charAt(0)}</AvatarFallback>
                        )}
                    </Avatar>
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-semibold text-foreground">{founder.name}</h3>
                        <p className="text-md text-primary font-medium mb-2">{founder.role}</p>
                        <p className="text-muted-foreground mb-4 max-w-xl">{founder.bio}</p>
                        {founder.linkedinUrl && (
                             <a href={founder.linkedinUrl} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), "mt-2")}>
                                <Linkedin className="mr-2 h-4 w-4" /> Conectar en LinkedIn
                             </a>
                        )}
                    </div>
                </div>
                 {/* Placeholder para más miembros / CTA de unirse */}
                {/*
                <div className="mt-12 text-center">
                     <p className="text-muted-foreground">¡Estamos creciendo! Buscamos talento apasionado.</p>
                     <Button variant="link" className="mt-2">Ver Oportunidades</Button>
                </div>
                */}
            </section>
            {/* --- FIN Equipo --- */}

        </div>
        {/* Footer Consistente (Asumiendo que está en el Root Layout) */}
    </div>
  );
}