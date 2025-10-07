// File: app/terms/page.tsx (MODIFICADO - Iteración 5.2)
"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Añadido CardDescription
import { APP_NAME } from '@/lib/constants';
import { ArrowLeft } from 'lucide-react'; // Icono volver

export default function TermsPage() {
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
                <CardTitle className="text-2xl md:text-3xl font-bold">Términos de Servicio</CardTitle>
                 <CardDescription>Última Actualización: [Insertar Fecha]</CardDescription> {/* Fecha aquí */}
                </CardHeader>
                <CardContent className="prose prose-sm sm:prose-base dark:prose-invert max-w-none pt-0"> {/* prose para estilos de texto */}
                <h2>1. Aceptación de los Términos</h2>
                <p>
                    Al acceder o utilizar el servicio {APP_NAME} ("Servicio"), usted acepta estar sujeto a estos Términos de Servicio ("Términos"). Si no está de acuerdo con alguna parte de los términos, no podrá acceder al Servicio.
                </p>

                <h2>2. Descripción del Servicio</h2>
                <p>
                    {APP_NAME} proporciona una plataforma para consultar bases de conocimiento empresariales utilizando procesamiento de lenguaje natural. Las características incluyen carga, procesamiento, indexación de documentos y consulta en lenguaje natural.
                </p>

                <h2>3. Cuentas de Usuario</h2>
                <p>
                    Usted es responsable de salvaguardar sus credenciales de cuenta y de cualquier actividad o acción bajo su cuenta. Debe notificarnos inmediatamente al tener conocimiento de cualquier violación de seguridad o uso no autorizado de su cuenta.
                </p>

                <h2>4. Contenido del Usuario</h2>
                <p>
                    Usted conserva la propiedad de cualquier documento o dato que cargue en el Servicio ("Contenido del Usuario"). Al cargar Contenido del Usuario, usted otorga a {APP_NAME} una licencia mundial, no exclusiva y libre de regalías para usar, procesar, almacenar y mostrar su Contenido del Usuario únicamente con el propósito de proporcionarle el Servicio.
                </p>

                <h2>5. Uso Aceptable</h2>
                <p>
                    Usted acepta no hacer un mal uso del Servicio. Las actividades prohibidas incluyen, entre otras: [Listar actividades prohibidas, ej., cargar contenido ilegal, intentar violar la seguridad, sobrecargar el sistema].
                </p>

                <h2>6. Terminación</h2>
                <p>
                    Podemos terminar o suspender su acceso al Servicio inmediatamente, sin previo aviso ni responsabilidad, por cualquier motivo, incluido, entre otros, si incumple los Términos.
                </p>

                <h2>7. Exclusión de Garantías</h2>
                <p>
                    El Servicio se proporciona "TAL CUAL" y "SEGÚN DISPONIBILIDAD". {APP_NAME} no ofrece garantías, expresas o implícitas, y por la presente renuncia a todas las demás garantías, incluidas, entre otras, las garantías implícitas de comerciabilidad, idoneidad para un propósito particular o no infracción.
                </p>

                 <h2>8. Limitación de Responsabilidad</h2>
                 <p>
                    En ningún caso {APP_NAME}, ni sus directores, empleados, socios, agentes, proveedores o afiliados, serán responsables de ningún daño indirecto, incidental, especial, consecuente o punitivo, incluidos, entre otros, la pérdida de beneficios, datos, uso, fondo de comercio u otras pérdidas intangibles, resultantes de su acceso o uso o incapacidad para acceder o usar el Servicio.
                 </p>

                 <h2>9. Ley Aplicable</h2>
                 <p>
                    Estos Términos se regirán e interpretarán de acuerdo con las leyes de [Su Jurisdicción], sin tener en cuenta sus disposiciones sobre conflicto de leyes.
                 </p>

                 <h2>10. Cambios a los Términos</h2>
                 <p>
                    Nos reservamos el derecho, a nuestra entera discreción, de modificar o reemplazar estos Términos en cualquier momento. Le notificaremos cualquier cambio publicando los nuevos Términos en esta página.
                 </p>

                 <h2>11. Contáctenos</h2>
                 <p>
                    Si tiene alguna pregunta sobre estos Términos, contáctenos en [Su Correo/Enlace de Contacto].
                 </p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}