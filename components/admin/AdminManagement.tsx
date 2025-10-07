// File: components/admin/AdminManagement.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Loader2, Building, UserPlus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { listCompaniesForSelect, createCompany, createUser, CompanySelectItem, ApiError } from '@/lib/api'; // Necesitarás definir esto
import { useAuth } from '@/lib/hooks/useAuth';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

// Esquemas de Validación
const createCompanySchema = z.object({
  companyName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
});
type CreateCompanyValues = z.infer<typeof createCompanySchema>;

const createUserSchema = z.object({
  userName: z.string().min(2, { message: "El nombre debe tener al menos 2 caracteres." }),
  userEmail: z.string().email({ message: "Introduce un correo electrónico válido." }),
  userPassword: z.string().min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
  companyId: z.string().uuid({ message: "Selecciona una empresa válida." }),
});
type CreateUserValues = z.infer<typeof createUserSchema>;

export default function AdminManagement() {
  const { token } = useAuth();
  const [companies, setCompanies] = useState<CompanySelectItem[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [userError, setUserError] = useState<string | null>(null);

  // Formularios
  const companyForm = useForm<CreateCompanyValues>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: { companyName: '' },
  });
  const userForm = useForm<CreateUserValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: { userName: '', userEmail: '', userPassword: '', companyId: '' },
  });

  // Cargar lista de compañías para el selector
  useEffect(() => {
    const fetchCompanies = async () => {
      if (!token) return;
      setIsLoadingCompanies(true);
      try {
        const data = await listCompaniesForSelect(); // Llamada API (usará mock por ahora)
        setCompanies(data);
      } catch (err: any) {
        console.error("Error fetching companies for select:", err);
        toast.error("Error al cargar empresas", { description: err.message || "Error desconocido" });
      } finally {
        setIsLoadingCompanies(false);
      }
    };
    fetchCompanies();
  }, [token]);

  // Handlers de envío
  const onCompanySubmit = async (data: CreateCompanyValues) => {
    setCompanyError(null);
    const toastId = toast.loading("Creando compañía...");
    try {
        const newCompany = await createCompany({ name: data.companyName }); // Llamada API (usará mock por ahora)
        toast.success("Compañía Creada", { id: toastId, description: `"${newCompany.name}" creada con ID: ${newCompany.id.substring(0, 8)}...` });
        companyForm.reset();
        // Actualizar la lista de compañías para el selector
        setCompanies(prev => [...prev, { id: newCompany.id, name: newCompany.name }].sort((a, b) => a.name.localeCompare(b.name))); // Añadir y ordenar
    } catch (err: any) {
        const message = err instanceof ApiError ? err.message : "No se pudo crear la compañía.";
        setCompanyError(message);
        toast.error("Error al crear compañía", { id: toastId, description: message });
    }
  };

  const onUserSubmit = async (data: CreateUserValues) => {
    setUserError(null);
    const toastId = toast.loading("Creando usuario...");
    try {
        await createUser({ // Llamada API (usará mock por ahora)
            name: data.userName,
            email: data.userEmail,
            password: data.userPassword,
            company_id: data.companyId,
            roles: ['user'] // Asignar rol 'user' por defecto
        });
        toast.success("Usuario Creado", { id: toastId, description: `Usuario ${data.userEmail} creado y asociado.` });
        userForm.reset();
    } catch (err: any) {
        const message = err instanceof ApiError ? err.message : "No se pudo crear el usuario.";
        setUserError(message);
        toast.error("Error al crear usuario", { id: toastId, description: message });
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold tracking-tight">Gestión de Entidades</h1>

      {/* Grid para formularios */}
      <div className="grid gap-8 lg:grid-cols-2">

        {/* Crear Compañía */}
        <Card className="flex flex-col"> {/* Flex col para que footer se alinee abajo */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-primary" /> Crear Compañía
            </CardTitle>
            <CardDescription>Añade una nueva organización.</CardDescription>
          </CardHeader>
          <form onSubmit={companyForm.handleSubmit(onCompanySubmit)} className="flex flex-col flex-grow">
            <CardContent className="space-y-4 flex-grow"> {/* flex-grow para empujar footer */}
              {companyError && (
                  <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{companyError}</AlertDescription></Alert>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Nombre de la Compañía</Label>
                <Input
                  id="companyName"
                  placeholder="Ej: Acme Corporation"
                  disabled={companyForm.formState.isSubmitting}
                  {...companyForm.register("companyName")}
                  aria-invalid={!!companyForm.formState.errors.companyName}
                />
                {companyForm.formState.errors.companyName && (
                  <p className="text-xs text-destructive pt-1">{companyForm.formState.errors.companyName.message}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6 mt-auto"> {/* mt-auto para empujar al fondo */}
              <Button type="submit" disabled={companyForm.formState.isSubmitting}>
                {companyForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Compañía
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Crear Usuario */}
        <Card className="flex flex-col"> {/* Flex col */}
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Crear Usuario
            </CardTitle>
            <CardDescription>Añade un usuario a una compañía.</CardDescription>
          </CardHeader>
          <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="flex flex-col flex-grow">
            <CardContent className="space-y-4 flex-grow">
               {userError && (
                  <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{userError}</AlertDescription></Alert>
               )}
               {/* Campos Nombre y Email */}
               <div className="grid sm:grid-cols-2 gap-4">
                 <div className="space-y-1.5">
                   <Label htmlFor="userName">Nombre Completo</Label>
                   <Input id="userName" placeholder="Ej: Juan Pérez" disabled={userForm.formState.isSubmitting} {...userForm.register("userName")} aria-invalid={!!userForm.formState.errors.userName}/>
                   {userForm.formState.errors.userName && <p className="text-xs text-destructive pt-1">{userForm.formState.errors.userName.message}</p>}
                 </div>
                 <div className="space-y-1.5">
                   <Label htmlFor="userEmail">Correo Electrónico</Label>
                   <Input id="userEmail" type="email" placeholder="ej: juan.perez@empresa.com" disabled={userForm.formState.isSubmitting} {...userForm.register("userEmail")} aria-invalid={!!userForm.formState.errors.userEmail}/>
                   {userForm.formState.errors.userEmail && <p className="text-xs text-destructive pt-1">{userForm.formState.errors.userEmail.message}</p>}
                 </div>
               </div>
               {/* Campo Contraseña */}
               <div className="space-y-1.5">
                 <Label htmlFor="userPassword">Contraseña</Label>
                 <Input id="userPassword" type="password" placeholder="Mínimo 8 caracteres" disabled={userForm.formState.isSubmitting} {...userForm.register("userPassword")} aria-invalid={!!userForm.formState.errors.userPassword}/>
                 {userForm.formState.errors.userPassword && <p className="text-xs text-destructive pt-1">{userForm.formState.errors.userPassword.message}</p>}
               </div>
               {/* Selector Compañía */}
               <div className="space-y-1.5">
                 <Label htmlFor="companyId">Asignar a Compañía</Label>
                 <Select
                     disabled={isLoadingCompanies || userForm.formState.isSubmitting}
                     onValueChange={(value) => userForm.setValue('companyId', value, { shouldValidate: true })}
                     value={userForm.watch('companyId')}
                 >
                   <SelectTrigger id="companyId" className="w-full" aria-invalid={!!userForm.formState.errors.companyId}>
                     <SelectValue placeholder={isLoadingCompanies ? "Cargando compañías..." : "Selecciona una compañía..."} />
                   </SelectTrigger>
                   <SelectContent>
                     {isLoadingCompanies ? (
                        <SelectItem value="loading" disabled>Cargando...</SelectItem>
                     ) : companies.length > 0 ? (
                       companies.map((company) => (
                         <SelectItem key={company.id} value={company.id}>
                           {company.name} ({company.id.substring(0, 6)}...)
                         </SelectItem>
                       ))
                     ) : (
                        <SelectItem value="no-companies" disabled>No hay compañías creadas</SelectItem>
                     )}
                   </SelectContent>
                 </Select>
                 {userForm.formState.errors.companyId && <p className="text-xs text-destructive pt-1">{userForm.formState.errors.companyId.message}</p>}
               </div>
            </CardContent>
            <CardFooter className="border-t pt-6 mt-auto">
              <Button type="submit" disabled={userForm.formState.isSubmitting || isLoadingCompanies || !userForm.formState.isValid}>
                {userForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Usuario
              </Button>
            </CardFooter>
          </form>
        </Card>

      </div>
    </div>
  );
}