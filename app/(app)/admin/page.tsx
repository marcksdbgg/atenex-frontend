// File: app/(app)/admin/page.tsx (CORREGIDO - Añadido padding)
"use client";

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminStats from '@/components/admin/AdminStats';
import AdminManagement from '@/components/admin/AdminManagement';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loader2 } from 'lucide-react';

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const view = searchParams.get('view') || 'stats';

  return (
    // FLAG_LLM: Añadido padding aquí (p-6 lg:p-8)
    <div className="p-6 lg:p-8 space-y-6">
      {view === 'stats' && <AdminStats />}
      {view === 'management' && <AdminManagement />}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return ( <div className="flex items-center justify-center h-full"> <Loader2 className="h-8 w-8 animate-spin text-primary" /> </div> );
  }

  if (!user || !user.isAdmin) {
    React.useEffect(() => { router.replace('/chat'); }, [router]);
    return ( <div className="flex items-center justify-center h-full"> <Loader2 className="h-8 w-8 animate-spin text-primary" /> <p className="ml-2">Redirigiendo...</p> </div> );
  }

  return (
    <Suspense fallback={ <div className="flex items-center justify-center h-full"> <Loader2 className="h-8 w-8 animate-spin text-primary" /> </div> }>
      <AdminDashboardContent />
    </Suspense>
  );
}