// File: lib/hooks/useUploadDocument.ts (NUEVO)
import { useState, useCallback } from 'react';
import { uploadDocument, IngestResponse, AuthHeaders, ApiError } from '@/lib/api';
import { toast } from 'sonner'; // Para notificaciones

interface UseUploadDocumentReturn {
  isUploading: boolean;
  uploadError: string | null;
  uploadResponse: IngestResponse | null;
  uploadFile: (file: File, authHeaders: AuthHeaders) => Promise<boolean>; // Devuelve boolean indicando éxito
  clearUploadStatus: () => void; // Para limpiar el estado después de mostrar error/éxito
}

/**
 * Hook personalizado para manejar la subida de documentos.
 * Encapsula la lógica de llamada API, estado de carga, errores (incluido 409) y notificaciones.
 * @param onSuccess - Callback opcional a ejecutar tras una subida exitosa.
 * @returns Objeto con el estado y la función de subida.
 */
export function useUploadDocument(onSuccess?: (response: IngestResponse) => void): UseUploadDocumentReturn {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadResponse, setUploadResponse] = useState<IngestResponse | null>(null);

  const uploadFile = useCallback(async (file: File, authHeaders: AuthHeaders): Promise<boolean> => {
    setIsUploading(true);
    setUploadError(null);
    setUploadResponse(null);
    const toastId = toast.loading(`Subiendo archivo "${file.name}"...`); // Notificación de carga

    try {
      const response = await uploadDocument(file, authHeaders);
      setUploadResponse(response);
      toast.success("Archivo Subido", {
        id: toastId,
        description: `"${file.name}" ha sido puesto en cola para procesamiento. Estado: ${response.status || 'recibido'}.`,
      });
      if (onSuccess) {
        onSuccess(response);
      }
      setIsUploading(false);
      return true; // Indica éxito
    } catch (err: any) {
      let errorMessage = 'Error al subir el documento.';
      let errorTitle = "Error al Subir";

      if (err instanceof ApiError) {
        // Manejo específico del error 409 (duplicado)
        if (err.status === 409) {
          errorTitle = "Archivo Duplicado";
          errorMessage = err.message || `Ya existe un documento llamado "${file.name}". No se ha subido de nuevo.`;
        } else {
          // Otros errores de API
          errorMessage = err.message || `Error API (${err.status})`;
        }
      } else if (err.message) {
        // Errores genéricos
        errorMessage = err.message;
      }

      setUploadError(errorMessage);
      setUploadResponse(null);
      toast.error(errorTitle, {
        id: toastId,
        description: errorMessage,
      });
      setIsUploading(false);
      return false; // Indica fallo
    }
    // No necesitamos finally porque isUploading se setea en try/catch
  }, [onSuccess]);

  // Función para limpiar el estado de error/respuesta (útil después de mostrar el error)
  const clearUploadStatus = useCallback(() => {
    setUploadError(null);
    setUploadResponse(null);
  }, []);

  return { isUploading, uploadError, uploadResponse, uploadFile, clearUploadStatus };
}