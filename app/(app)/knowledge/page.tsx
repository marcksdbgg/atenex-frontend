// File: app/(app)/knowledge/page.tsx (CONFIRMADO CON PADDING)
'use client';
import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, AlertTriangle, UploadCloud, FileText, List } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { useDocumentStatuses } from '@/lib/hooks/useDocumentStatuses';
import { useUploadDocument } from '@/lib/hooks/useUploadDocument';
import { DocumentStatusList } from '@/components/knowledge/document-status-list';
import { FileUploader } from '@/components/knowledge/file-uploader';
import { AuthHeaders, getDocumentStats, DocumentStatsResponse } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

export default function KnowledgePage() {
  const { user, isLoading: isAuthLoading } = useAuth();

  const {
    documents,
    isLoading: isLoadingDocuments,
    error: documentsError,
    fetchDocuments,
    fetchMore,
    hasMore,
    retryLocalUpdate,
    refreshDocument,
    deleteLocalDocument,
  } = useDocumentStatuses();

  const {
    isUploading,
    uploadError,
    uploadResponse,
    uploadFile,
    clearUploadStatus
  } = useUploadDocument();

  const [stats, setStats] = useState<DocumentStatsResponse | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  const authHeadersForChildren: AuthHeaders | null = useMemo(() => {
    if (user?.userId && user?.companyId) {
      return {
        'X-User-ID': user.userId,
        'X-Company-ID': user.companyId,
      };
    }
    return null;
  }, [user?.userId, user?.companyId]);

  // Fetch stats from backend
  useEffect(() => {
    if (!authHeadersForChildren) return;
    setIsLoadingStats(true);
    setStatsError(null);
    getDocumentStats(authHeadersForChildren)
      .then(setStats)
      .catch((err) => {
        setStatsError(err?.message || 'Error al obtener estadísticas');
        setStats(null);
      })
      .finally(() => setIsLoadingStats(false));
  }, [authHeadersForChildren]);

  // Mantener fetchDocuments para la lista de documentos
  useEffect(() => {
    if (uploadResponse?.document_id) {
       const refreshDelay = 1500;
       const timer = setTimeout(() => { fetchDocuments(true); }, refreshDelay);
       return () => clearTimeout(timer);
    }
  }, [uploadResponse, fetchDocuments]);

  const handleRetrySuccess = useCallback((documentId: string) => {
    retryLocalUpdate(documentId);
    refreshDocument(documentId);
  }, [retryLocalUpdate, refreshDocument]);

  const handleDeleteSuccess = useCallback((documentId: string) => {
    deleteLocalDocument(documentId);
  }, [deleteLocalDocument]);

  if (isAuthLoading) {
    return (
      <div className="p-6 lg:p-8 space-y-8">
        <Skeleton className="h-10 w-1/3 mb-6" />
        <Skeleton className="h-64 rounded-xl mb-8" />
        <Skeleton className="h-10 w-1/4 mb-4" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  // --- Estadísticas del backend o fallback local ---
  const totalDocs = stats?.total_documents ?? documents.length;
  const totalChunks = stats?.total_chunks ?? documents.reduce((acc, doc) => acc + (doc.milvus_chunk_count ?? doc.chunk_count ?? 0), 0);
  const statusCounts = stats?.by_status ?? documents.reduce((acc, doc) => {
    acc[doc.status] = (acc[doc.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col gap-6 min-h-[80vh]">
      {/* Grid principal: estadísticas y subida a la izquierda, resumen y uploader a la derecha */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        {/* Columna izquierda: estadísticas y resumen */}
        <div className="flex flex-col gap-4 justify-between">
          {/* Estadísticas visuales */}
          <div className="flex flex-wrap gap-4 items-center justify-start">
            {/* Tarjeta de total documentos */}
            <div className="flex flex-col items-center justify-center bg-card border rounded-lg shadow-sm px-4 py-3 min-w-[120px]">
              {isLoadingStats ? <Skeleton className="h-8 w-16" /> : <span className="text-2xl font-bold text-primary">{totalDocs}</span>}
              <span className="text-xs text-muted-foreground font-medium">Documentos</span>
            </div>
            {/* Tarjeta de chunks */}
            <div className="flex flex-col items-center justify-center bg-card border rounded-lg shadow-sm px-4 py-3 min-w-[120px]">
              {isLoadingStats ? <Skeleton className="h-6 w-12" /> : <span className="text-xl font-semibold text-foreground">{totalChunks}</span>}
              <span className="text-xs text-muted-foreground font-medium">Chunks</span>
            </div>
            {/* Tarjeta de procesados */}
            <div className="flex flex-col items-center justify-center bg-card border rounded-lg shadow-sm px-4 py-3 min-w-[120px]">
              {isLoadingStats ? <Skeleton className="h-6 w-10" /> : <span className="text-xl font-semibold text-green-600">{statusCounts['processed'] || 0}</span>}
              <span className="text-xs text-green-700 font-medium">Procesados</span>
            </div>
            {/* Tarjeta de en cola */}
            <div className="flex flex-col items-center justify-center bg-card border rounded-lg shadow-sm px-4 py-3 min-w-[120px]">
              {isLoadingStats ? <Skeleton className="h-6 w-10" /> : <span className="text-xl font-semibold text-blue-600">{statusCounts['uploaded'] || 0}</span>}
              <span className="text-xs text-blue-700 font-medium">En Cola</span>
            </div>
            {/* Tarjeta de procesando */}
            <div className="flex flex-col items-center justify-center bg-card border rounded-lg shadow-sm px-4 py-3 min-w-[120px]">
              {isLoadingStats ? <Skeleton className="h-6 w-10" /> : <span className="text-xl font-semibold text-orange-600">{statusCounts['processing'] || 0}</span>}
              <span className="text-xs text-orange-700 font-medium">Procesando</span>
            </div>
            {/* Tarjeta de error */}
            <div className="flex flex-col items-center justify-center bg-card border rounded-lg shadow-sm px-4 py-3 min-w-[120px]">
              {isLoadingStats ? <Skeleton className="h-6 w-10" /> : <span className="text-xl font-semibold text-red-600">{statusCounts['error'] || 0}</span>}
              <span className="text-xs text-red-700 font-medium">Error</span>
            </div>
          </div>
        </div>
        {/* Mostrar error de stats si ocurre */}
        {statsError && (
          <Alert variant="destructive" className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error al obtener estadísticas</AlertTitle>
            <AlertDescription>{statsError}</AlertDescription>
          </Alert>
        )}
        {/* Columna derecha: uploader en caja flotante */}
        <div className="flex flex-col items-center justify-center h-full">
          <div className="w-full max-w-md bg-card border rounded-xl shadow-lg p-6 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 mb-2">
              <UploadCloud className="h-6 w-6 text-primary" />
              <span className="font-semibold text-lg">Subir Nuevo Documento</span>
            </div>
            <span className="text-xs text-muted-foreground mb-2">(Arrastra, selecciona o pega archivos)</span>
            {authHeadersForChildren ? (
              <FileUploader
                authHeaders={authHeadersForChildren}
                onUploadFile={uploadFile}
                isUploading={isUploading}
                uploadError={uploadError}
                clearUploadStatus={clearUploadStatus}
              />
            ) : (
              <Alert variant="default" className="bg-muted/50 mt-2 w-full">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <AlertTitle className="text-sm font-medium">Autenticación Requerida</AlertTitle>
                <AlertDescription className="text-xs text-muted-foreground">
                  Inicia sesión para poder subir nuevos documentos.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* Documentos gestionados */}
      <div className="flex-1 min-h-0 w-full max-w-none flex flex-col gap-4">
        <h2 className="text-xl md:text-2xl font-semibold tracking-tight text-foreground flex items-center gap-2">
          <List className="h-6 w-6" /> Documentos Gestionados
        </h2>
        {documentsError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error al Cargar Documentos</AlertTitle>
            <AlertDescription>
              {documentsError}
              <Button variant="link" size="sm" onClick={() => fetchDocuments(true)} className="p-0 h-auto ml-2 text-destructive underline">Reintentar</Button>
            </AlertDescription>
          </Alert>
        )}
        {isLoadingDocuments && documents.length === 0 && !documentsError && (
          <div className="space-y-2 pt-2 border rounded-lg p-4">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
          </div>
        )}
        {/* Scroll para la tabla de documentos, sticky header y bulk bar */}
        {!isLoadingDocuments && documentsError == null && authHeadersForChildren && (
          <div className="h-full min-h-0 flex-1 flex flex-col">
            <div className="flex-1 min-h-0">
              <DocumentStatusList
                documents={documents}
                authHeaders={authHeadersForChildren}
                onRetrySuccess={handleRetrySuccess}
                fetchMore={fetchMore}
                hasMore={hasMore}
                refreshDocument={refreshDocument}
                onDeleteSuccess={handleDeleteSuccess}
                isLoading={isLoadingDocuments}
              />
            </div>
          </div>
        )}
        {!isLoadingDocuments && !authHeadersForChildren && !documentsError && (
          <Alert variant="default" className="bg-muted/50 mt-2">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <AlertTitle className="text-sm font-medium">Autenticación Requerida</AlertTitle>
            <AlertDescription className="text-xs text-muted-foreground">
              Inicia sesión para ver y administrar tus documentos.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}