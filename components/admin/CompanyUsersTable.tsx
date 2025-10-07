// File: components/admin/CompanyUsersTable.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { getUsersByCompany, UserAdminResponse, AuthHeaders } from '@/lib/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Users } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';

interface CompanyUsersTableProps {
  companyId: string;
}

export default function CompanyUsersTable({ companyId }: CompanyUsersTableProps) {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserAdminResponse[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);
    
    const fetchUsers = async () => {
      if (!user?.userId || !user?.companyId) {
        if (mounted) {
          setError('No se pudo verificar la autenticación');
          setIsLoading(false);
        }
        return;
      }

      const authHeaders: AuthHeaders = {
        'X-User-ID': user.userId,
        'X-Company-ID': user.companyId
      };

      try {
        const data = await getUsersByCompany(companyId, authHeaders);
        if (mounted) setUsers(data);
      } catch (err: any) {
        if (mounted) setError(err.message || 'Error al cargar usuarios.');
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchUsers();
    return () => { mounted = false; };
  }, [companyId, user?.userId, user?.companyId]);

  if (isLoading) {
    return (
      <div className="p-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex space-x-2 mb-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-2">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  if (!users || users.length === 0) {
    return (
      <div className="text-muted-foreground text-sm p-4 text-center border rounded-lg bg-muted/30">
        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No hay usuarios en esta empresa.</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>{users.length} usuario{users.length !== 1 ? 's' : ''} encontrado{users.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-muted">
              <TableHead className="font-semibold">Nombre</TableHead>
              <TableHead className="font-semibold">Email</TableHead>
              <TableHead className="font-semibold">Fecha de creación</TableHead>
              <TableHead className="font-semibold">Roles</TableHead>
              <TableHead className="font-semibold">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="border-muted/50">
                <TableCell className="font-medium">
                  {user.name || <span className="italic text-muted-foreground">Sin nombre</span>}
                </TableCell>
                <TableCell className="font-mono text-xs text-muted-foreground">
                  {user.email}
                </TableCell>
                <TableCell className="text-sm">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : '-'}
                </TableCell>
                <TableCell>
                  {user.roles && user.roles.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((role) => (
                        <Badge 
                          key={role} 
                          variant={role === 'admin' ? 'destructive' : 'secondary'} 
                          className="text-xs"
                        >
                          {role === 'admin' ? 'Administrador' : 'Usuario'}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">Usuario</Badge>
                  )}
                </TableCell>
                <TableCell>
                  {user.is_active ? (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200 hover:bg-green-200 text-xs">
                      Activo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">Inactivo</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
