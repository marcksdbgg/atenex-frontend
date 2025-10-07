// File: app/(auth)/login/page.tsx (MODIFICADO - Iteración 5.3)
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { APP_NAME } from "@/lib/constants";
import Link from "next/link"; // Importar Link

export default function LoginPage() {
  return (
    // Card con sombra más pronunciada y padding ajustado
    <Card className="w-full max-w-sm shadow-xl border-border/60">
      <CardHeader className="text-center space-y-1 pt-8 pb-6"> {/* Ajuste de padding */}
        <CardTitle className="text-2xl font-semibold tracking-tight">Iniciar Sesión</CardTitle> {/* Ajuste fuente */}
        <CardDescription>Accede a tu cuenta {APP_NAME}</CardDescription> {/* Nombre App */}
      </CardHeader>
      {/* Padding inferior en CardContent */}
      <CardContent className="pb-8 px-6"> {/* Padding horizontal también */}
        <LoginForm />
         {/* Separador y enlace (si se añade registro) */}
         {/* <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                      O continuar con
                  </span>
              </div>
          </div> */}
         {/* Placeholder para botones de SSO si se añaden */}
         {/* <div className="grid gap-2"> ... </div> */}

        {/* Enlace a Registro (si existe) */}
        {/* <p className="mt-6 text-center text-sm text-muted-foreground">
            ¿No tienes cuenta?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline underline-offset-4">
                Regístrate aquí
            </Link>
        </p> */}
      </CardContent>
    </Card>
  );
}