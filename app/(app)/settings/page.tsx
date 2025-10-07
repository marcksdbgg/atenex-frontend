// File: app/(app)/settings/page.tsx (CORREGIDO - Añadido padding)
"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/useAuth';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsPage() {
    const { user, isLoading: isAuthLoading } = useAuth();
    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [hasChanged, setHasChanged] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || '');
            setHasChanged(false);
            setSaveSuccess(false);
        }
    }, [user]);

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newName = event.target.value;
        setName(newName);
        setHasChanged(newName !== (user?.name || ''));
        setSaveSuccess(false);
    };

    const handleSave = async () => {
        if (!hasChanged || !user) return;
        setIsSaving(true);
        setSaveSuccess(false);
        console.log('Guardando cambios (simulado):', { name });
        try {
          await new Promise(resolve => setTimeout(resolve, 1200));
          toast.success("Perfil Actualizado", { description: "Tu nombre ha sido guardado." });
          setHasChanged(false); setSaveSuccess(true);
          // TODO: Actualizar user en AuthContext
        } catch (error) {
          console.error("Error al guardar perfil:", error);
          toast.error("Error al Guardar", { description: "No se pudo actualizar el perfil." });
          setSaveSuccess(false);
        } finally {
           setIsSaving(false);
        }
    };

    if (isAuthLoading) {
        return (
            // FLAG_LLM: Añadir padding también al skeleton wrapper
            <div className="p-6 lg:p-8 space-y-8 max-w-3xl mx-auto">
                 <Skeleton className="h-10 w-1/4 mb-6" />
                 <Skeleton className="h-64 w-full rounded-xl" />
                 <Skeleton className="h-48 w-full rounded-xl" />
            </div>
        )
    }

  return (
    // FLAG_LLM: Añadido padding al contenedor principal (p-6 lg:p-8)
    <div className="p-6 lg:p-8 space-y-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>

      {/* Card para Perfil */}
      <Card>
        <CardHeader>
          <CardTitle>Perfil de Usuario</CardTitle>
          <CardDescription>Administra la información de tu cuenta personal.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid sm:grid-cols-3 items-center gap-4">
                 <Label htmlFor="name" className="sm:text-right sm:mt-2">Nombre</Label>
                 <Input id="name" value={name} onChange={handleNameChange} disabled={isSaving} className="sm:col-span-2" placeholder="Tu nombre completo" />
            </div>
             <div className="grid sm:grid-cols-3 items-start gap-4">
                 <Label htmlFor="email" className="sm:text-right sm:mt-2">Correo electrónico</Label>
                 <div className="sm:col-span-2 space-y-1">
                     <Input id="email" type="email" value={user?.email || ''} disabled />
                     <p className="text-xs text-muted-foreground">El correo electrónico no se puede cambiar.</p>
                 </div>
            </div>
        </CardContent>
        <CardFooter className="border-t pt-6 justify-end">
            <Button onClick={handleSave} disabled={isSaving || !hasChanged || saveSuccess}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {saveSuccess && <Check className="mr-2 h-4 w-4" />}
                {isSaving ? "Guardando..." : saveSuccess ? "Guardado" : "Guardar Cambios"}
             </Button>
        </CardFooter>
      </Card>

      {/* Card para Configuración de Empresa */}
       <Card>
        <CardHeader>
          <CardTitle>Configuración de la Empresa</CardTitle>
          <CardDescription>Información relacionada con tu organización.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            {user?.companyId ? (
                 <div className="grid sm:grid-cols-3 items-center gap-4">
                    <Label htmlFor="companyId" className="sm:text-right">ID de Empresa</Label>
                    <Input id="companyId" value={user.companyId} readOnly disabled className="sm:col-span-2 font-mono text-xs"/>
                 </div>
             ) : (
                <p className="text-sm text-muted-foreground italic">No hay información de empresa asociada a tu cuenta.</p>
             )}
             <p className="text-sm text-muted-foreground pt-4 border-t">
                Otras configuraciones de la empresa aparecerán aquí en futuras versiones.
             </p>
        </CardContent>
      </Card>

    </div>
  );
}