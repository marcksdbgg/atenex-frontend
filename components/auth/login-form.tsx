// File: components/auth/login-form.tsx (MODIFICADO - Iteración 5.3, solo estilo)
"use client";

import React, { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { cn } from '@/lib/utils'; // Importar cn
import Link from 'next/link'; // Para enlace "Olvidaste contraseña"

// Esquema Zod (sin cambios)
const loginSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce una dirección de correo válida.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { signIn, isLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
    mode: 'onChange', // Validar al cambiar
  });

  const onSubmit = async (data: LoginFormValues) => {
    setError(null);
    try {
      await signIn(data.email, data.password);
    } catch (err: any) {
      setError(err.message || 'Inicio de sesión fallido. Revisa tus credenciales e inténtalo de nuevo.');
    }
  };

  return (
    // Aumentar espaciado entre elementos del formulario
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Alerta de Error */}
      {error && (
        <Alert variant="destructive" role="alert" aria-live="assertive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Inicio de Sesión</AlertTitle> {/* Título más genérico */}
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {/* Campo Email */}
      <div className="space-y-1.5"> {/* Ajuste espaciado label/input */}
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input
          id="email"
          type="email"
          placeholder="nombre@ejemplo.com"
          autoComplete="email"
          required
          disabled={isLoading}
          aria-required="true"
          {...form.register('email')}
          aria-invalid={form.formState.errors.email ? 'true' : 'false'}
          className={cn(form.formState.errors.email && "border-destructive focus-visible:ring-destructive/50")} // Highlight error
        />
        {form.formState.errors.email && (
          <p className="text-xs text-destructive pt-1" role="alert">{form.formState.errors.email.message}</p> // Texto más pequeño
        )}
      </div>
      {/* Campo Contraseña */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
             <Label htmlFor="password">Contraseña</Label>
             {/* Enlace "¿Olvidaste tu contraseña?" */}
             {/* <Link href="#" className="text-xs text-muted-foreground hover:text-primary underline underline-offset-2">
                 ¿Olvidaste tu contraseña?
             </Link> */}
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={isLoading}
          aria-required="true"
          {...form.register('password')}
          aria-invalid={form.formState.errors.password ? 'true' : 'false'}
           className={cn(form.formState.errors.password && "border-destructive focus-visible:ring-destructive/50")} // Highlight error
        />
        {form.formState.errors.password && (
          <p className="text-xs text-destructive pt-1" role="alert">{form.formState.errors.password.message}</p>
        )}
      </div>
      {/* Botón de Envío */}
      <Button type="submit" className="w-full" disabled={isLoading || !form.formState.isDirty || !form.formState.isValid}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
      </Button>
    </form>
  );
}