// File: lib/hooks/useDocumentStatuses.ts (CORREGIDO - Usa document_id internamente)
import { useState, useEffect, useCallback, useRef } from 'react';
import {
    getDocumentStatusList,
    DocumentStatusResponse, // <-- Usa la interfaz mapeada del frontend
    DetailedDocumentStatusResponse,
    AuthHeaders,
    ApiError,
    getDocumentStatus
} from '@/lib/api';
import { useAuth } from '@/lib/hooks/useAuth';
import { toast } from 'sonner';

const DEFAULT_LIMIT = 30;

interface UseDocumentStatusesReturn {
  documents: DocumentStatusResponse[]; // Lista de documentos con 'document_id'
  isLoading: boolean;
  error: string | null;
  fetchDocuments: (reset?: boolean) => Promise<void>;
  fetchMore: () => void;
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

  const fetchDocuments = useCallback(async (reset: boolean = false) => {
    if (isFetchingRef.current || isAuthLoading || !user?.userId || !user?.companyId) {
      if (!isAuthLoading && !user?.userId) {
        setDocuments([]); setIsLoading(false); setError(null); setHasMore(false);
      }
      return;
    }
    isFetchingRef.current = true; setIsLoading(true); setError(null);
    const authHeaders: AuthHeaders = { 'X-User-ID': user.userId, 'X-Company-ID': user.companyId };

    try {
      const currentOffset = reset ? 0 : offsetRef.current;
      // FLAG_LLM: getDocumentStatusList ahora devuelve DocumentStatusResponse[] ya mapeado
      const data = await getDocumentStatusList(authHeaders, DEFAULT_LIMIT, currentOffset);
      setHasMore(data.length === DEFAULT_LIMIT);
      offsetRef.current = currentOffset + data.length;
      setDocuments(prev => reset ? data : [...prev, ...data]);
    } catch (err: any) {
      const errorMessage = err instanceof ApiError ? err.message : (err.message || 'Error al cargar la lista de documentos.');
      setError(errorMessage); setHasMore(false);
    } finally {
      setIsLoading(false); isFetchingRef.current = false;
    }
  }, [user, isAuthLoading]); // Dependencia correcta

  useEffect(() => {
    // Cargar solo si hay usuario, compañía y la lista está vacía o si el usuario/compañía cambia
    if (user?.userId && user?.companyId) {
      fetchDocuments(true); // Siempre resetea al cambiar usuario/compañía
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

  const fetchMore = useCallback(() => {
    if (!isLoading && hasMore && !isFetchingRef.current) {
      fetchDocuments(false);
    }
  }, [fetchDocuments, isLoading, hasMore]);

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