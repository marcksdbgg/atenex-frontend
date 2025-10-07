// File: components/knowledge/document-status-list.tsx (CORREGIDO - Usa document_id consistentemente)
"use client";

import React, { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    AlertCircle, Loader2, RefreshCw, Trash2, Info,
    FileClock, FileCheck2, FileX2, FileQuestion, Download, AlertTriangle // Iconos
} from 'lucide-react';
// FLAG_LLM: Importa la interfaz correcta con document_id
import { DocumentStatusResponse, AuthHeaders, deleteIngestDocument, retryIngestDocument, BulkDeleteResponse } from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Skeleton } from '@/components/ui/skeleton';

// Mapeo de estado (sin cambios)
const statusMap: { [key: string]: { icon: React.ComponentType<{ className?: string }>, text: string, className: string, animate: boolean, description: string } } = {
    uploaded:   { icon: FileClock, text: 'En Cola', className: 'text-blue-600 bg-blue-100 border-blue-200 dark:text-blue-300 dark:bg-blue-900/30 dark:border-blue-700', animate: true, description: "Esperando para ser procesado." },
    processing: { icon: Loader2, text: 'Procesando', className: 'text-orange-600 bg-orange-100 border-orange-200 dark:text-orange-300 dark:bg-orange-900/30 dark:border-orange-700', animate: true, description: "Extrayendo texto y generando vectores..." },
    processed:  { icon: FileCheck2, text: 'Procesado', className: 'text-green-600 bg-green-100 border-green-200 dark:text-green-300 dark:bg-green-900/30 dark:border-green-700', animate: false, description: "Listo para ser consultado." },
    error:      { icon: FileX2, text: 'Error', className: 'text-red-600 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-900/30 dark:border-red-700', animate: false, description: "Hubo un problema durante el procesamiento." },
    default:    { icon: FileQuestion, text: 'Desconocido', className: 'text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-700/30 dark:border-gray-600', animate: false, description: "Estado no reconocido." }
};

// FLAG_LLM: Renombrado para claridad, usa la interfaz de frontend
type DocumentStatus = DocumentStatusResponse;

export interface DocumentStatusListProps {
  documents: DocumentStatus[];
  authHeaders: AuthHeaders;
  onRetrySuccess: (documentId: string) => void;
  fetchMore: () => void;
  hasMore: boolean;
  refreshDocument: (documentId: string) => void;
  onDeleteSuccess: (documentId: string) => void;
  isLoading: boolean;
}

export function DocumentStatusList({
    documents,
    authHeaders,
    onRetrySuccess,
    fetchMore,
    hasMore,
    refreshDocument,
    onDeleteSuccess,
    isLoading
}: DocumentStatusListProps) {
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const allIds = useMemo(() => documents.map(d => d.document_id), [documents]);
  const isAllSelected = selectedIds.length > 0 && selectedIds.length === allIds.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < allIds.length;

  const handleSelectAll = () => {
    if (isAllSelected) setSelectedIds([]);
    else setSelectedIds(allIds);
  };
  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };
  const clearSelection = () => setSelectedIds([]);
  const [deletingDocId, setDeletingDocId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isRetrying, setIsRetrying] = React.useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = React.useState<string | null>(null);

  // --- Handlers (con validaciones, usan document_id) ---
  const handleRetry = async (documentId: string, fileName?: string | null) => {
    if (!documentId || typeof documentId !== 'string') { console.error("Error: ID de documento inválido para reintento:", documentId); toast.error("Error Interno", { description: "ID de documento faltante." }); return; }
    if (!authHeaders || isRetrying) return;
    const displayId = fileName || documentId.substring(0, 8) + "..."; setIsRetrying(documentId);
    const toastId = toast.loading(`Reintentando ingesta para "${displayId}"...`);
    try { await retryIngestDocument(documentId, authHeaders); toast.success("Reintento Iniciado", { id: toastId, description: `El documento "${displayId}" se está procesando de nuevo.` }); onRetrySuccess(documentId); }
    catch (error: any) { const errorMsg = error instanceof Error ? error.message : 'Error desconocido'; toast.error("Error al Reintentar", { id: toastId, description: `No se pudo reintentar la ingesta para "${displayId}": ${errorMsg}` }); }
    finally { setIsRetrying(null); }
  };

  const handleRefresh = async (documentId: string, fileName?: string | null) => {
    if (!documentId || typeof documentId !== 'string') { console.error("Error: ID de documento inválido para refrescar:", documentId); toast.error("Error Interno", { description: "ID de documento faltante." }); return; }
    if (isRefreshing) return;
    const displayId = fileName || documentId.substring(0, 8) + "..."; setIsRefreshing(documentId);
    const toastId = toast.info(`Actualizando estado de "${displayId}"...`); // Usar toastId para actualizar
    try { await refreshDocument(documentId); toast.success("Estado Actualizado", { id: toastId, description: `Se actualizó el estado de "${displayId}".` }); } // Actualizar toast
    catch (error) { toast.error("Error al Actualizar", { id: toastId, description: `No se pudo actualizar el estado de "${displayId}".` }); } // Actualizar toast en error
    finally { setIsRefreshing(null); }
  };

    const handleDownload = (doc: DocumentStatus) => {
        if (!doc || !doc.document_id) { console.error("Error: datos de documento inválidos para descarga:", doc); toast.error("Error Interno", { description: "Información del documento incompleta." }); return; }
        toast.info("Descarga No Implementada", { description: `La funcionalidad para descargar "${doc.file_name || doc.document_id}" aún no está disponible.` });
        console.log("Download requested for:", doc.document_id);
    };

  const openDeleteConfirmation = (docId: string) => {
       if (!docId || typeof docId !== 'string') { console.error("Error: ID inválido para confirmación de eliminación:", docId); toast.error("Error Interno", { description: "ID de documento faltante." }); return; }
       setDeletingDocId(docId);
    };
  const closeDeleteConfirmation = () => { if (!isDeleting) setDeletingDocId(null); };

  const handleDeleteConfirmed = async () => {
    if (!deletingDocId || !authHeaders || isDeleting) return;
    // FLAG_LLM: Buscar usando document_id
    const docToDelete = documents.find(d => d.document_id === deletingDocId);
    const display = docToDelete?.file_name || deletingDocId.substring(0, 8) + '...';
    // --- LOG DETALLADO DE ORIGEN DE BORRADO ---
    const now = new Date().toISOString();
    let userInfo = '';
    try {
      // Si tienes acceso a usuario en contexto/props, inclúyelo aquí
      if (authHeaders && (authHeaders['X-User-ID'] || authHeaders['X-Company-ID'])) {
        userInfo = `UserID: ${authHeaders['X-User-ID'] || ''}, CompanyID: ${authHeaders['X-Company-ID'] || ''}`;
      }
    } catch {}
    // Stack trace
    const stack = (new Error('StackTrace (origen handleDeleteConfirmed)')).stack;
    // Log en consola
    console.error('[AUDIT][DELETE_DOCUMENT]', {
      timestamp: now,
      user: userInfo,
      document_id: deletingDocId,
      file_name: docToDelete?.file_name,
      status: docToDelete?.status,
      location: 'components/knowledge/document-status-list.tsx:handleDeleteConfirmed',
      stack,
      context: {
        docToDelete,
        authHeaders,
      }
    });
    setIsDeleting(true);
    const toastId = toast.loading(`Eliminando "${display}"...`);
    try {
      await deleteIngestDocument(deletingDocId, authHeaders);
      onDeleteSuccess(deletingDocId);
      toast.success('Documento Eliminado', { id: toastId, description: `"${display}" ha sido eliminado.` });
      closeDeleteConfirmation();
    } catch (e: any) {
      const errorMsg = e instanceof Error ? e.message : 'Error desconocido';
      toast.error('Error al Eliminar', { id: toastId, description: `No se pudo eliminar "${display}": ${errorMsg}` });
    } finally {
      setIsDeleting(false);
    }
  };


  // --- Renderizado ---
  if (!isLoading && documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-10 px-4 border-2 border-dashed rounded-lg bg-muted/30 mt-4 min-h-[150px]">
        <Info className="h-8 w-8 mb-3 opacity-50"/>
        <p className="text-sm font-medium mb-1">Sin Documentos</p>
        <p className="text-xs">Aún no se han subido documentos.</p>
      </div>
    );
  }

  // Bulk actions bar
  const selectedDocs = documents.filter(d => selectedIds.includes(d.document_id));
  const canBulkRetry = selectedDocs.some(d => d.status === 'error');
  const canBulkRefresh = selectedDocs.length > 0;
  const canBulkDelete = selectedDocs.length > 0;

  // --- Bulk Delete Handler ---
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [bulkDeleteResult, setBulkDeleteResult] = useState<BulkDeleteResponse | null>(null);

  // Fix for implicit any in map
  type BulkDeleteFail = { id: string; error: string };

  const handleBulkDelete = async () => {
    if (!authHeaders || selectedIds.length === 0 || isBulkDeleting) return;
    setIsBulkDeleting(true);
    setBulkDeleteResult(null);
    const toastId = toast.loading(`Eliminando ${selectedIds.length} documentos...`);
    try {
      // Llama al nuevo endpoint bulk
      const { deleteIngestDocumentsBulk } = await import('@/lib/api');
      const result = await deleteIngestDocumentsBulk(selectedIds, authHeaders);
      setBulkDeleteResult(result);
      // Elimina de la UI los eliminados
      for (const id of result.deleted) {
        onDeleteSuccess(id);
      }
      toast.success('Borrado masivo completado', { id: toastId, description: `${result.deleted.length} eliminados, ${result.failed.length} fallidos.` });
      setBulkDeleteOpen(false);
      clearSelection();
    } catch (e: any) {
      toast.error('Error en borrado masivo', { id: toastId, description: e?.message || 'Error desconocido' });
    } finally {
      setIsBulkDeleting(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="border rounded-lg overflow-hidden shadow-sm bg-card relative h-full min-h-0 flex flex-col w-full max-w-none">
        {/* Bulk actions toolbar - Mejorado para no sobreponerse y ser sticky */}
        {selectedIds.length > 0 && (
          <div
            className="sticky z-[50] top-0 left-0 right-0 bg-white dark:bg-zinc-900 border-b-2 border-primary px-2 md:px-4 py-2 flex flex-row flex-wrap items-center gap-1 md:gap-2 animate-in fade-in shadow-2xl"
            style={{ minHeight: 44, maxWidth: '100vw', overflowX: 'auto' }}
          >
            <span className="font-medium text-xs md:text-sm mr-2">
              {selectedIds.length} seleccionado{selectedIds.length > 1 ? 's' : ''}
            </span>
            {canBulkRetry && (
              <Button variant="outline" size="sm" onClick={async () => {
                for (const doc of selectedDocs.filter(d => d.status === 'error')) {
                  await handleRetry(doc.document_id, doc.file_name);
                }
                clearSelection();
              }} className="min-w-[80px] md:min-w-[100px]">
                <RefreshCw className="h-4 w-4 mr-1" /> Reintentar
              </Button>
            )}
            {canBulkRefresh && (
              <Button variant="outline" size="sm" onClick={async () => {
                for (const doc of selectedDocs) {
                  await handleRefresh(doc.document_id, doc.file_name);
                }
                clearSelection();
              }} className="min-w-[100px] md:min-w-[120px]">
                <Loader2 className="h-4 w-4 mr-1" /> Actualizar
              </Button>
            )}
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBulkDeleteOpen(true)}
              className="min-w-[80px] md:min-w-[100px]"
              style={{ display: canBulkDelete ? 'inline-flex' : 'none' }}
            >
              <Trash2 className="h-4 w-4 mr-1" /> Eliminar
            </Button>
            <Button variant="ghost" size="sm" onClick={clearSelection} className="min-w-[60px] md:min-w-[80px]">Cancelar</Button>
          </div>
        )}

        {/* Bulk delete confirmation dialog */}
        <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive"/> ¿Eliminar {selectedIds.length} documento{selectedIds.length > 1 ? 's' : ''}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Se eliminarán permanentemente los documentos seleccionados y todos sus datos asociados.
                <ul className="mt-2 text-xs max-h-32 overflow-y-auto list-disc pl-5">
                  {selectedDocs.map(doc => (
                    <li key={doc.document_id} className="break-all">{doc.file_name || doc.document_id}</li>
                  ))}
                </ul>
                {bulkDeleteResult && (
                  <div className="mt-3">
                    <div className="text-green-700 dark:text-green-400 text-xs font-medium mb-1">{bulkDeleteResult.deleted.length} eliminados correctamente.</div>
                    {bulkDeleteResult.failed.length > 0 && (
                      <div className="text-red-700 dark:text-red-400 text-xs font-medium">
                        {bulkDeleteResult.failed.length} fallidos:
                        <ul className="list-disc pl-5">
                          {bulkDeleteResult.failed.map(f => (
                            <li key={f.id}>{f.id}: {f.error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setBulkDeleteOpen(false)} disabled={isBulkDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBulkDelete}
                disabled={isBulkDeleting}
                className={cn(buttonVariants({ variant: "destructive" }), "min-w-[150px]")}
              >
                {isBulkDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}Eliminar Permanentemente
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex-1 min-h-0 overflow-y-auto w-full max-w-none">
          {/* Forzar tabla a ancho mínimo para evitar colapso en pantallas pequeñas */}
          <Table className='w-full text-sm'>
            <TableHeader className="sticky top-0 z-30 bg-muted/70 backdrop-blur-md">
              <TableRow className="border-b bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-8 pl-2 pr-1 py-2">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todos"
                    checked={isAllSelected}
                    ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                    onChange={handleSelectAll}
                    className="accent-primary h-4 w-4 rounded border-muted-foreground/40"
                  />
                </TableHead>
                <TableHead className="w-[40%] pl-1 pr-2 py-2">Nombre Archivo</TableHead>
                <TableHead className="w-[15%] px-2 py-2">Estado</TableHead>
                <TableHead className="w-[10%] text-center px-2 py-2 hidden sm:table-cell">Chunks</TableHead>
                <TableHead className="w-[15%] px-2 py-2 hidden md:table-cell">Actualización</TableHead>
                <TableHead className="w-[20%] text-right pr-3 pl-2 py-2">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
            {documents.map((doc) => {
              if (!doc || !doc.document_id) {
                if (process.env.NODE_ENV === 'development') {
                  console.warn("Documento inválido (sin document_id) omitido:", doc);
                }
                return null;
              }
              const statusInfo = statusMap[doc.status] || statusMap.default;
              const Icon = statusInfo.icon;
              const isCurrentlyRetrying = isRetrying === doc.document_id;
              const isCurrentlyRefreshing = isRefreshing === doc.document_id;
              const isActionDisabled = isCurrentlyRetrying || isCurrentlyRefreshing;
              const dateToShow = doc.last_updated;
              const displayDate = dateToShow ? new Date(dateToShow).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short'}) : 'N/D';
              const displayFileName = doc.file_name || `ID: ${doc.document_id.substring(0, 12)}...`;
              const displayChunks = doc.milvus_chunk_count ?? doc.chunk_count ?? '-';
              const isChecked = selectedIds.includes(doc.document_id);
              return (
                <TableRow key={doc.document_id} className={cn("group hover:bg-accent/30 data-[state=selected]:bg-accent", isChecked && "bg-accent/40") }>
                  <TableCell className="pl-2 pr-1 py-1.5">
                    <input
                      type="checkbox"
                      aria-label={`Seleccionar ${displayFileName}`}
                      checked={isChecked}
                      onChange={() => handleSelectOne(doc.document_id)}
                      className="accent-primary h-4 w-4 rounded border-muted-foreground/40"
                    />
                  </TableCell>
                  <TableCell className="font-medium text-foreground/90 max-w-[150px] sm:max-w-xs lg:max-w-sm xl:max-w-md truncate pl-1 pr-2 py-1.5" title={displayFileName}>{displayFileName}</TableCell>
                  <TableCell className="px-2 py-1.5">
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Badge variant='outline' className={cn("border text-[11px] font-medium whitespace-nowrap py-0.5 px-1.5 cursor-default", statusInfo.className)}>
                          <Icon className={cn("h-3 w-3 mr-1", statusInfo.animate && "animate-spin")} />
                          {statusInfo.text}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={5} className="max-w-xs break-words p-2 text-xs shadow-lg">
                        <p>{statusInfo.description}</p>
                        {doc.status === 'error' && doc.error_message && <p className='mt-1 pt-1 border-t text-destructive'>Error: {doc.error_message}</p>}
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-center text-muted-foreground text-xs px-2 py-1.5 hidden sm:table-cell">{displayChunks}</TableCell>
                  <TableCell className="text-muted-foreground text-xs px-2 py-1.5 hidden md:table-cell">{displayDate}</TableCell>
                  <TableCell className="text-right space-x-1 pr-3 pl-2 py-1">
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-accent" onClick={() => handleDownload(doc)} aria-label="Descargar documento original" disabled={isActionDisabled || !doc.minio_exists}> <Download className="h-4 w-4" /> </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={6}><p>Descargar (N/D)</p></TooltipContent>
                    </Tooltip>
                    {doc.status === 'error' && (
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30" onClick={() => handleRetry(doc.document_id, doc.file_name)} aria-label="Reintentar ingesta" disabled={isActionDisabled}> {isCurrentlyRetrying ? <Loader2 className="h-4 w-4 animate-spin"/> : <RefreshCw className="h-4 w-4" />} </Button>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={6}><p>Reintentar</p></TooltipContent>
                      </Tooltip>
                    )}
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:bg-accent" onClick={() => handleRefresh(doc.document_id, doc.file_name)} aria-label="Actualizar estado" disabled={isActionDisabled}> {isCurrentlyRefreshing ? <Loader2 className="h-4 w-4 animate-spin"/> : <RefreshCw className="h-4 w-4" />} </Button>
                      </TooltipTrigger>
                      <TooltipContent side="top" sideOffset={6}><p>Actualizar Estado</p></TooltipContent>
                    </Tooltip>
                    <AlertDialog open={deletingDocId === doc.document_id} onOpenChange={(open) => !open && closeDeleteConfirmation()}>
                      <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive/80 hover:text-destructive hover:bg-destructive/10" onClick={(e) => { e.stopPropagation(); openDeleteConfirmation(doc.document_id); }} aria-label="Eliminar documento" disabled={isActionDisabled}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="top" sideOffset={6}><p>Eliminar</p></TooltipContent>
                      </Tooltip>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-destructive"/> ¿Confirmar Eliminación?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente el documento y todos sus datos asociados: <br />
                            <span className="font-semibold text-foreground mt-2 block break-all">"{doc.file_name || doc.document_id}"</span>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={closeDeleteConfirmation} disabled={isDeleting}>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleDeleteConfirmed} disabled={isDeleting} className={cn(buttonVariants({ variant: "destructive" }), "min-w-[150px]")}>
                            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                            Eliminar Permanentemente
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </div>
      {hasMore && (
        <div className="pt-6 text-center">
          <Button variant="outline" size="sm" onClick={fetchMore} disabled={isLoading || isDeleting}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Cargar más documentos
          </Button>
        </div>
      )}
      </div>
    </TooltipProvider>
  );
}