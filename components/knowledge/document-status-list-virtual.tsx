'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Loader2,
  RefreshCw,
  Trash2,
  AlertTriangle,
  FileClock,
  FileCheck2,
  FileX2,
  FileQuestion,
  Search as SearchIcon,
} from 'lucide-react';
import {
  DocumentStatusResponse,
  AuthHeaders,
  deleteIngestDocument,
  retryIngestDocument,
  deleteIngestDocumentsBulk,
  BulkDeleteResponse,
} from '@/lib/api';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

// Mapeo de estado
const statusMap: {
  [key: string]: {
    icon: React.ComponentType<{ className?: string }>;
    text: string;
    className: string;
    animate: boolean;
  };
} = {
  uploaded: {
    icon: FileClock,
    text: 'En Cola',
    className:
      'text-blue-600 bg-blue-100 border-blue-200 dark:text-blue-300 dark:bg-blue-900/30 dark:border-blue-700',
    animate: true,
  },
  processing: {
    icon: Loader2,
    text: 'Procesando',
    className:
      'text-orange-600 bg-orange-100 border-orange-200 dark:text-orange-300 dark:bg-orange-900/30 dark:border-orange-700',
    animate: true,
  },
  processed: {
    icon: FileCheck2,
    text: 'Procesado',
    className:
      'text-green-600 bg-green-100 border-green-200 dark:text-green-300 dark:bg-green-900/30 dark:border-green-700',
    animate: false,
  },
  error: {
    icon: FileX2,
    text: 'Error',
    className:
      'text-red-600 bg-red-100 border-red-200 dark:text-red-300 dark:bg-red-900/30 dark:border-red-700',
    animate: false,
  },
  default: {
    icon: FileQuestion,
    text: 'Desconocido',
    className:
      'text-gray-600 bg-gray-100 border-gray-200 dark:text-gray-400 dark:bg-gray-700/30 dark:border-gray-600',
    animate: false,
  },
};

type DocumentStatus = DocumentStatusResponse;

export interface DocumentStatusListVirtualProps {
  documents: DocumentStatus[];
  authHeaders: AuthHeaders;
  onRetrySuccess: (documentId: string) => void;
  fetchMore: (opts?: { force?: boolean }) => Promise<void>;
  hasMore: boolean;
  refreshDocument: (documentId: string) => Promise<void>;
  onDeleteSuccess: (documentId: string) => void;
  isLoading: boolean;
}

const ROW_HEIGHT = 80;

export function DocumentStatusListVirtual({
  documents,
  authHeaders,
  onRetrySuccess,
  fetchMore,
  hasMore,
  refreshDocument,
  onDeleteSuccess,
  isLoading,
}: DocumentStatusListVirtualProps) {
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRetrying, setIsRetrying] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<string | null>(null);
  // Search and selection state
  const [query, setQuery] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const isFetchingRef = useRef(false);
  const parentRef = useRef<HTMLDivElement>(null);

  // Filtered list according to query
  const filteredDocs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return documents;
    return documents.filter((d) => {
      const name = (d.file_name || '').toLowerCase();
      const id = d.document_id.toLowerCase();
      const type = (d.file_type || '').toLowerCase();
      const status = (d.status || '').toLowerCase();
      return name.includes(q) || id.includes(q) || type.includes(q) || status.includes(q);
    });
  }, [documents, query]);

  // Keep selection consistent with current docs
  useEffect(() => {
    if (selectedIds.size === 0) return;
    const idsSet = new Set(documents.map((d) => d.document_id));
    setSelectedIds((prev) => {
      if (prev.size === 0) return prev;
      const next = new Set<string>();
      prev.forEach((id) => {
        if (idsSet.has(id)) next.add(id);
      });
      return next;
    });
  }, [documents, selectedIds.size]);

  const itemCount = filteredDocs.length + (hasMore && !query ? 1 : 0);

  const virtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  // Infinite load when near end (disabled while searching)
  useEffect(() => {
    const virtualItems = virtualizer.getVirtualItems();
    if (virtualItems.length === 0) return;
    const lastItem = virtualItems[virtualItems.length - 1];
    if (!query && lastItem && lastItem.index >= filteredDocs.length - 8 && hasMore && !isFetchingRef.current) {
      isFetchingRef.current = true;
      fetchMore({ force: false })
        .catch((err) => console.error('fetchMore error', err))
        .finally(() => {
          isFetchingRef.current = false;
        });
    }
  }, [virtualizer.getVirtualItems(), filteredDocs.length, hasMore, fetchMore, query]);

  const handleRetry = async (documentId: string, fileName?: string | null) => {
    if (!documentId || isRetrying || !authHeaders) return;
    const displayId = fileName || documentId.substring(0, 8) + '...';
    setIsRetrying(documentId);
    const toastId = toast.loading(`Reintentando "${displayId}"...`);
    try {
      await retryIngestDocument(documentId, authHeaders);
      toast.success('Reintento Iniciado', { id: toastId });
      onRetrySuccess(documentId);
    } catch (error: any) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
      toast.error('Error al Reintentar', { id: toastId, description: errorMsg });
    } finally {
      setIsRetrying(null);
    }
  };

  const handleRefresh = async (documentId: string, fileName?: string | null) => {
    if (!documentId || isRefreshing) return;
    const displayId = fileName || documentId.substring(0, 8) + '...';
    setIsRefreshing(documentId);
    const toastId = toast.info(`Actualizando "${displayId}"...`);
    try {
      await refreshDocument(documentId);
      toast.success('Actualizado', { id: toastId });
    } catch (error) {
      toast.error('Error al Actualizar', { id: toastId });
    } finally {
      setIsRefreshing(null);
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!deletingDocId || !authHeaders || isDeleting) return;
    const docToDelete = documents.find((d) => d.document_id === deletingDocId);
    const display = docToDelete?.file_name || deletingDocId.substring(0, 8) + '...';
    setIsDeleting(true);
    const toastId = toast.loading(`Eliminando "${display}"...`);
    try {
      await deleteIngestDocument(deletingDocId, authHeaders);
      onDeleteSuccess(deletingDocId);
      toast.success('Eliminado', { id: toastId });
      setDeletingDocId(null);
    } catch (e: any) {
      const errorMsg = e instanceof Error ? e.message : 'Error desconocido';
      toast.error('Error al Eliminar', { id: toastId, description: errorMsg });
    } finally {
      setIsDeleting(false);
    }
  };

  // Bulk delete handler
  const handleBulkDelete = async () => {
    if (!authHeaders || selectedIds.size === 0 || isBulkDeleting) return;
    const ids = Array.from(selectedIds);
    setIsBulkDeleting(true);
    const toastId = toast.loading(`Eliminando ${ids.length} documentos...`);
    try {
      const res: BulkDeleteResponse = await deleteIngestDocumentsBulk(ids, authHeaders);
      const deleted = res.deleted || [];
      const failed = res.failed || [];
      deleted.forEach((id) => onDeleteSuccess(id));
      setSelectedIds(new Set());
      if (failed.length === 0) {
        toast.success(`Eliminados ${deleted.length} documentos`, { id: toastId });
      } else {
        toast.info(`Eliminados ${deleted.length}, fallidos ${failed.length}`, {
          id: toastId,
          description: failed
            .slice(0, 5)
            .map((f) => `${f.id}: ${f.error}`)
            .join(' | '),
        });
      }
    } catch (e: any) {
      const msg = e instanceof Error ? e.message : 'Error desconocido';
      toast.error('Error en borrado masivo', { id: toastId, description: msg });
    } finally {
      setIsBulkDeleting(false);
      setBulkDialogOpen(false);
    }
  };

  // Selection helpers
  const visibleIds = useMemo(() => filteredDocs.map((d) => d.document_id), [filteredDocs]);
  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => selectedIds.has(id));
  const someVisibleSelected =
    visibleIds.some((id) => selectedIds.has(id)) && !allVisibleSelected;
  const selectAllState: boolean | 'indeterminate' = allVisibleSelected
    ? true
    : someVisibleSelected
    ? 'indeterminate'
    : false;
  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleSelectAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  return (
    <>
      <div
        ref={parentRef}
        className="h-full w-full overflow-auto flex flex-col relative"
        style={{
          contain: 'layout style paint',
        }}
      >
        {/* Sticky toolbar: search + bulk actions */}
        <div className="sticky top-0 z-10 bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-3 py-2 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1 max-w-md">
              <SearchIcon className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre, ID, tipo o estado"
                className="pl-8"
              />
            </div>
            {selectedIds.size > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="whitespace-nowrap">
                  {selectedIds.size} seleccionados
                </Badge>
                <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())}>
                  Limpiar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setBulkDialogOpen(true)}
                  disabled={isBulkDeleting}
                >
                  {isBulkDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1" />Eliminar selección
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Checkbox
              checked={selectAllState}
              onCheckedChange={toggleSelectAllVisible}
              id="select-all-visible"
            />
            <label htmlFor="select-all-visible" className="cursor-pointer">
              Seleccionar todo lo visible
            </label>
            {!query && hasMore && (
              <span className="ml-auto">Cargando por páginas • desplázate para cargar más</span>
            )}
          </div>
        </div>

        {filteredDocs.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <AlertTriangle className="h-6 w-6 mr-2" />
            <span>No hay documentos para mostrar</span>
          </div>
        )}

        {filteredDocs.length > 0 && (
          <div
            style={{
              height: totalSize,
              width: '100%',
              position: 'relative',
            }}
          >
            {virtualItems.map((virtualItem) => {
              const index = virtualItem.index;
              const isLoaderRow = !query && index >= filteredDocs.length;
              const doc = filteredDocs[index];

              if (isLoaderRow) {
                return (
                  <div
                    key={`loader-${index}`}
                    data-index={index}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                    className="flex items-center justify-center border-b"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Cargando más documentos...</span>
                    </div>
                  </div>
                );
              }

              if (!doc) return null;

              const status = statusMap[doc.status] || statusMap.default;
              const StatusIcon = status.icon;
              const iconClass = status.className
                .split(' ')
                .filter((c) => c.startsWith('text-') || c.startsWith('dark:text-'))
                .join(' ');

              return (
                <div
                  key={`doc-${doc.document_id}`}
                  data-index={index}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 border-b bg-background hover:bg-muted/50 transition-colors',
                    selectedIds.has(doc.document_id) && 'bg-muted/40'
                  )}
                >
                  <div className="flex-shrink-0">
                    <Checkbox
                      checked={selectedIds.has(doc.document_id)}
                      onCheckedChange={() => toggleSelectOne(doc.document_id)}
                      aria-label={`Seleccionar ${doc.file_name || doc.document_id}`}
                    />
                  </div>

                  <div className="flex-shrink-0">
                    <StatusIcon className={cn('h-5 w-5', status.animate && 'animate-spin', iconClass)} />
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                    <div className="font-medium text-sm truncate text-foreground">
                      {doc.file_name || 'Documento sin nombre'}
                    </div>
                    <div className="text-xs text-muted-foreground flex gap-2 flex-wrap">
                      <span>{doc.file_type || 'unknown'}</span>
                      <span>•</span>
                      <span>{doc.chunk_count ?? doc.milvus_chunk_count ?? 0} chunks</span>
                      {doc.error_message && (
                        <>
                          <span>•</span>
                          <span className="text-red-600 dark:text-red-400 truncate">{doc.error_message}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    <Badge variant="secondary" className={cn(status.className, 'whitespace-nowrap text-xs')}>
                      {status.text}
                    </Badge>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRefresh(doc.document_id, doc.file_name)}
                            disabled={isRefreshing === doc.document_id}
                            className="h-8 w-8 p-0"
                          >
                            <RefreshCw className={cn('h-4 w-4', isRefreshing === doc.document_id && 'animate-spin')} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Refrescar</TooltipContent>
                      </Tooltip>

                      {doc.status === 'error' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRetry(doc.document_id, doc.file_name)}
                              disabled={isRetrying === doc.document_id}
                              className="h-8 px-2 text-xs"
                            >
                              {isRetrying === doc.document_id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                'Reintentar'
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Reintentar</TooltipContent>
                        </Tooltip>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeletingDocId(doc.document_id)}
                            disabled={isDeleting}
                            className="h-8 w-8 p-0 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Eliminar</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!query && !isLoading && hasMore && filteredDocs.length > 0 && (
          <div className="flex justify-center py-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMore({ force: false })}
              disabled={isFetchingRef.current}
            >
              {isFetchingRef.current ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Cargando...
                </>
              ) : (
                'Cargar más'
              )}
            </Button>
          </div>
        )}
      </div>

      <AlertDialog
        open={deletingDocId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingDocId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Documento</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirmed}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk delete dialog */}
      <AlertDialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar selección</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar {selectedIds.size} documento(s). Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isBulkDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isBulkDeleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Eliminar seleccionados
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default DocumentStatusListVirtual;
