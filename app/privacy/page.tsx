// File: app/privacy/page.tsx (MODIFICADO - Iteración 5.2)
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Añadido CardDescription
import { APP_NAME } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react'; // Icono volver

export default function PrivacyPage() {
    const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto max-w-4xl p-4 md:p-8 space-y-6">
            {/* Botón volver */}
            <Button variant="ghost" onClick={() => router.push('/')} className="text-sm text-muted-foreground hover:text-foreground mb-4 -ml-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Inicio
            </Button>
            {/* Card principal */}
            <Card className="shadow-sm border">
                <CardHeader>
                <CardTitle className="text-2xl md:text-3xl font-bold">Política de Privacidad</CardTitle>
                <CardDescription>Última Actualización: [Insertar Fecha]</CardDescription> {/* Fecha aquí */}
                </CardHeader>
                <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none pt-0"> {/* prose para estilos de texto */}
                <p>
                    {APP_NAME} ("nosotros", "nos", o "nuestro") opera la aplicación {APP_NAME} (el "Servicio"). Esta página le informa de nuestras políticas relativas a la recopilación, uso y divulgación de datos personales cuando utiliza nuestro Servicio y las opciones que tiene asociadas a esos datos.
                </p>

                <h2>1. Recopilación y Uso de Información</h2>
                <p>
                    Recopilamos diferentes tipos de información para diversos fines para proporcionar y mejorar nuestro Servicio para usted.
                </p>
                <ul>
                    <li><strong>Datos Personales:</strong> Al utilizar nuestro Servicio, podemos pedirle que nos proporcione cierta información de identificación personal que puede utilizarse para contactarle o identificarle ("Datos Personales"). La información de identificación personal puede incluir, entre otros: Dirección de correo electrónico, Nombre, Información de la empresa (si aplica).</li>
                    <li><strong>Datos de Uso:</strong> También podemos recopilar información sobre cómo se accede y utiliza el Servicio ("Datos de Uso"). Estos Datos de Uso pueden incluir información como la dirección de Protocolo de Internet de su ordenador (por ejemplo, dirección IP), tipo de navegador, versión del navegador, las páginas de nuestro Servicio que visita, la hora y fecha de su visita, el tiempo dedicado a esas páginas, identificadores únicos de dispositivos y otros datos de diagnóstico.</li>
                    <li><strong>Contenido del Usuario:</strong> Procesamos los documentos y datos que usted carga ("Contenido del Usuario") únicamente con el fin de proporcionar las funciones del Servicio, como la indexación y la consulta. Tratamos su Contenido de Usuario como confidencial.</li>
                </ul>

                <h2>2. Uso de Datos</h2>
                <p>{APP_NAME} utiliza los datos recopilados para diversos fines:</p>
                 <ul>
                    <li>Para proporcionar y mantener el Servicio</li>
                    <li>Para notificarle cambios en nuestro Servicio</li>
                    <li>Para permitirle participar en funciones interactivas de nuestro Servicio cuando decida hacerlo</li>
                    <li>Para proporcionar atención y soporte al cliente</li>
                    <li>Para proporcionar análisis o información valiosa para que podamos mejorar el Servicio</li>
                    <li>Para supervisar el uso del Servicio</li>
                    <li>Para detectar, prevenir y abordar problemas técnicos</li>
                 </ul>

                <h2>3. Almacenamiento y Seguridad de los Datos</h2>
                <p>
                    El Contenido del Usuario se almacena de forma segura utilizando proveedores de almacenamiento en la nube estándar de la industria [Especificar si es posible, ej., AWS S3, Google Cloud Storage, MinIO]. Implementamos medidas de seguridad diseñadas para proteger su información contra el acceso, divulgación, alteración y destrucción no autorizados. Sin embargo, ninguna transmisión por Internet o almacenamiento electrónico es 100% seguro.
                </p>

                 <h2>4. Proveedores de Servicios</h2>
                 <p>
                    Podemos emplear a empresas e individuos terceros para facilitar nuestro Servicio ("Proveedores de Servicios"), para proporcionar el Servicio en nuestro nombre, para realizar servicios relacionados con el Servicio o para ayudarnos a analizar cómo se utiliza nuestro Servicio. Estos terceros tienen acceso a sus Datos Personales sólo para realizar estas tareas en nuestro nombre y están obligados a no divulgarlos ni utilizarlos para ningún otro fin. Ejemplos incluyen: [Listar categorías, ej., Alojamiento en la nube (AWS/GCP/Azure), Proveedores LLM (OpenAI/Google), Autenticación (Supabase)].
                 </p>

                 <h2>5. Sus Derechos sobre los Datos</h2>
                 <p>
                    Dependiendo de su jurisdicción, puede tener ciertos derechos con respecto a sus Datos Personales, como el derecho a acceder, corregir, eliminar o restringir su procesamiento. Póngase en contacto con nosotros para ejercer estos derechos.
                 </p>

                 <h2>6. Privacidad de los Niños</h2>
                 <p>
                    Nuestro Servicio no se dirige a menores de 18 años ("Niños"). No recopilamos conscientemente información de identificación personal de menores de 18 años.
                 </p>

                 <h2>7. Cambios a esta Política de Privacidad</h2>
                 <p>
                    Podemos actualizar nuestra Política de Privacidad de vez en cuando. Le notificaremos cualquier cambio publicando la nueva Política de Privacidad en esta página. Se le aconseja revisar esta Política de Privacidad periódicamente para cualquier cambio.
                 </p>

                 <h2>8. Contáctenos</h2>
                 <p>
                    Si tiene alguna pregunta sobre esta Política de Privacidad, por favor contáctenos: [Su Correo/Enlace de Contacto]
                 </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}