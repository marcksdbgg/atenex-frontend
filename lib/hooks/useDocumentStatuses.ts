// File: lib/hooks/useDocumentStatuses.ts (OPTIMIZADO - Soporta 1k+ documentos)
// Cambios principales:
// - PAGE_SIZE aumentado de 30 a 2000 (máximo soportado por el backend)
// - Implementa skip_live_checks=true en carga inicial para mayor velocidad
// - fetchDocuments(force?) controla si hacer checks en vivo (MinIO/Milvus)

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getDocumentStatusList,
    DocumentStatusResponse, // <-- Usa la interfaz mapeada del frontend
    DetailedDocumentStatusResponse,
    AuthHeaders,
    ApiError,
    getDocumentStatus,
    request,
    DocumentStatusApiResponse
} from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';

const PAGE_SIZE = 2000; // Máximo soportado por el backend

// Helper: mapear respuesta API a frontend (si usas request directo)
const mapApiResponseToFrontend = (apiDoc: DocumentStatusApiResponse): DocumentStatusResponse => {
  return {
    document_id: apiDoc.id,
    status: apiDoc.status,
    file_name: apiDoc.file_name,
    file_type: apiDoc.file_type,
    chunk_count: apiDoc.chunk_count,
    error_message: apiDoc.error_message,
    created_at: apiDoc.created_at || apiDoc.uploaded_at,
    last_updated: apiDoc.last_updated,
    minio_exists: apiDoc.minio_exists ?? false,
    milvus_chunk_count: apiDoc.milvus_chunk_count ?? 0,
  };
};

interface UseDocumentStatusesReturn {
  documents: DocumentStatusResponse[]; // Lista de documentos con 'document_id'
  isLoading: boolean;
  error: string | null;
  fetchDocuments: (force?: boolean) => Promise<void>;
  fetchMore: (opts?: { force?: boolean }) => Promise<void>;
  hasMore: boolean;
  retryLocalUpdate: (documentId: string) => void;
  refreshDocument: (documentId: string) => Promise<void>;
  deleteLocalDocument: (documentId: string) => void;
}

export function useDocumentStatuses(): UseDocumentStatusesReturn {
  const { user, isLoading: isAuthLoading } = useAuth();
  // FLAG_LLM: El estado interno usa la interfaz DocumentStatusResponse con 'document_id'
  const [documents, setDocuments] = useState<DocumentStatusResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const offsetRef = useRef<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const isFetchingRef = useRef<boolean>(false);

  const fetchDocuments = useCallback(async (force: boolean = false) => {
    /**
     * CAMBIO PRINCIPAL: 
     * - force=false: usa skip_live_checks=true (rápido, solo DB, para carga inicial de 1k+ docs)
     * - force=true: usa skip_live_checks=false (checks en vivo, más lento pero más preciso)
     */
    if (isFetchingRef.current || isAuthLoading || !user?.userId || !user?.companyId) {
      if (!isAuthLoading && !user?.userId) {
        setDocuments([]); setIsLoading(false); setError(null); setHasMore(false);
      }
      return;
    }
    isFetchingRef.current = true; setIsLoading(true); setError(null);
    const authHeaders: AuthHeaders = { 'X-User-ID': user.userId, 'X-Company-ID': user.companyId };

    try {
      const currentOffset = 0; // Resetear offset en fetchDocuments (carga inicial)
      offsetRef.current = 0;

      // CAMBIO CLAVE: Usar skip_live_checks para la carga inicial
      // Por defecto (force=false o sin parámetro): skip_live_checks=true (RÁPIDO, solo DB)
      // Con force=true: skip_live_checks=false (lento, con checks de MinIO/Milvus)
      const skipLiveChecks = !force; // force=false (o undefined) → skip=true → rápido
      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
        offset: currentOffset.toString(),
        skip_live_checks: skipLiveChecks.toString(),
      });

      const endpoint = `/api/v1/ingest/status?${params.toString()}`;
      const apiResponse = await request<DocumentStatusApiResponse[]>(endpoint, {
        method: 'GET',
        headers: authHeaders as unknown as Record<string, string>,
      });

      const data = (apiResponse || []).map(mapApiResponseToFrontend);
      setHasMore(data.length === PAGE_SIZE);
      offsetRef.current = data.length;
      setDocuments(data);

      console.log(`[useDocumentStatuses] Loaded ${data.length} documents (skip_live_checks=${skipLiveChecks})`);
    } catch (err: any) {
      const errorMessage = err instanceof ApiError ? err.message : (err.message || 'Error al cargar la lista de documentos.');
      setError(errorMessage); setHasMore(false);
    } finally {
      setIsLoading(false); isFetchingRef.current = false;
    }
  }, [user, isAuthLoading]);

  useEffect(() => {
    // Cargar solo si hay usuario, compañía y la lista está vacía o si el usuario/compañía cambia
    if (user?.userId && user?.companyId) {
      fetchDocuments(); // Modo rápido (sin parámetro = force=false = skip_live_checks=true)
    } else if (!isAuthLoading && !user?.userId) {
      setDocuments([]); setIsLoading(false); setError(null); setHasMore(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId, user?.companyId, isAuthLoading]); // Depender de IDs específicos y auth

  const retryLocalUpdate = useCallback((documentId: string) => {
    setDocuments(prevDocs =>
      prevDocs.map(doc =>
        // FLAG_LLM: Comparar con document_id
        doc.document_id === documentId
          ? { ...doc, status: 'processing', error_message: null }
          : doc
      )
    );
  }, []);

  const fetchMore = useCallback(async (opts?: { force?: boolean }) => {
    /**
     * Carga más documentos (paginación con offset)
     * Usa skip_live_checks=true por defecto para mantener velocidad
     */
    if (!isLoading && hasMore && !isFetchingRef.current && user?.userId && user?.companyId) {
      isFetchingRef.current = true;
      const authHeaders: AuthHeaders = { 'X-User-ID': user.userId, 'X-Company-ID': user.companyId };

      try {
        const newOffset = offsetRef.current;
        const skipLiveChecks = !opts?.force; // Si force=true, hacemos checks

        const params = new URLSearchParams({
          limit: PAGE_SIZE.toString(),
          offset: newOffset.toString(),
          skip_live_checks: skipLiveChecks.toString(),
        });

        const endpoint = `/api/v1/ingest/status?${params.toString()}`;
        const apiResponse = await request<DocumentStatusApiResponse[]>(endpoint, {
          method: 'GET',
          headers: authHeaders as unknown as Record<string, string>,
        });

        const moreData = (apiResponse || []).map(mapApiResponseToFrontend);
        setDocuments(prev => [...prev, ...moreData]);
        offsetRef.current = newOffset + moreData.length;
        setHasMore(moreData.length === PAGE_SIZE);

        console.log(`[useDocumentStatuses] Loaded ${moreData.length} more documents from offset ${newOffset}`);
      } catch (err) {
        console.error('[useDocumentStatuses] fetchMore error:', err);
      } finally {
        isFetchingRef.current = false;
      }
    }
  }, [isLoading, hasMore, user]);

  const refreshDocument = useCallback(async (documentId: string) => {
    if (!user?.userId || !user?.companyId) {
        console.error("Cannot refresh document: user or company ID missing.");
        toast.error("Error de autenticación", { description: "No se pudo verificar la sesión." }); return;
    }
    const authHeaders: AuthHeaders = { 'X-User-ID': user.userId, 'X-Company-ID': user.companyId };
    try {
      // FLAG_LLM: getDocumentStatus devuelve DetailedDocumentStatusResponse con document_id
      const updatedDoc = await getDocumentStatus(documentId, authHeaders);
      // FLAG_LLM: Actualizar usando document_id
      setDocuments(prev => prev.map(doc => doc.document_id === documentId ? updatedDoc : doc));
    } catch (error){
      console.error(`Failed to refresh status for document ${documentId}:`, error);
      toast.error("Error al refrescar estado", { description: error instanceof Error ? error.message : "Error desconocido" });
    }
  }, [user]);

  const deleteLocalDocument = useCallback((documentId: string) => {
    // FLAG_LLM: Filtrar usando document_id
    setDocuments(prev => prev.filter(doc => doc.document_id !== documentId));
  }, []);

  return { documents, isLoading, error, fetchDocuments, fetchMore, hasMore, retryLocalUpdate, refreshDocument, deleteLocalDocument };
}