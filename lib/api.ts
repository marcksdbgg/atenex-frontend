// File: lib/api.ts
import { getApiGatewayUrl } from './utils';
import type { Message } from '@/components/chat/chat-message';
import { AUTH_TOKEN_KEY } from './constants';

// --- Tipos de Error ---
interface ApiErrorDataDetail { msg: string; type: string; loc?: (string | number)[]; }
interface ApiErrorData { detail?: string | ApiErrorDataDetail[] | any; message?: string; }
export class ApiError extends Error {
    status: number; data?: ApiErrorData;
    constructor(message: string, status: number, data?: ApiErrorData) {
        super(message); this.name = 'ApiError'; this.status = status; this.data = data;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

// --- Función Genérica de Request ---
export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
     if (!cleanEndpoint.startsWith('/api/v1/') && cleanEndpoint !== '/api/v1/docs' && cleanEndpoint !== '/openapi.json') {
        console.error(`Invalid API endpoint format: ${cleanEndpoint}. Must start with /api/v1/`);
        throw new ApiError(`Invalid API endpoint format: ${cleanEndpoint}.`, 400);
    }
    let apiUrl: string;
    try { apiUrl = `${getApiGatewayUrl()}${cleanEndpoint}`; } catch (err) {
        const message = err instanceof Error ? err.message : "API Gateway URL configuration error.";
        console.error("API Request failed: Could not get API Gateway URL.", err); throw new ApiError(message, 500);
    }
    let token: string | null = null; if (typeof window !== 'undefined') { token = localStorage.getItem(AUTH_TOKEN_KEY); }
    const headers = new Headers(options.headers || {}); headers.set('Accept', 'application/json');
    if (apiUrl.includes("ngrok-free.app")) { headers.set('ngrok-skip-browser-warning', 'true'); }
    if (!(options.body instanceof FormData)) { if (!headers.has('Content-Type')) { headers.set('Content-Type', 'application/json'); } } else { headers.delete('Content-Type'); }
    if (token) { headers.set('Authorization', `Bearer ${token}`); }
    else if (!cleanEndpoint.includes('/api/v1/users/login') && cleanEndpoint !== '/api/v1/docs' && cleanEndpoint !== '/openapi.json') {
         if (!cleanEndpoint.startsWith('/api/v1/admin')) {
             console.warn(`API Request: Making request to protected endpoint ${cleanEndpoint} without Authorization header.`);
         }
    }
    const config: RequestInit = { ...options, headers };
    console.log(`API Request: ${options.method || 'GET'} ${apiUrl}`);
    try {
        const response = await fetch(apiUrl, config);
        if (!response.ok) {
            let errorData: ApiErrorData | null = null; let errorText = ''; const contentType = response.headers.get('content-type');
            try { if (contentType && contentType.includes('application/json')) { errorData = await response.json(); } else { errorText = await response.text(); } }
            catch (parseError) { console.warn(`API Request: Could not parse error response body for ${response.status} ${response.statusText} from ${apiUrl}`, parseError); try { errorText = await response.text(); } catch {}}
            let errorMessage = `API Error (${response.status})`;
            if (errorData) {
                if (typeof errorData.detail === 'string') { errorMessage = errorData.detail; }
                else if (Array.isArray(errorData.detail) && errorData.detail.length > 0 && typeof errorData.detail[0].msg === 'string') { errorMessage = errorData.detail.map(d => `${d.loc ? d.loc.join('.')+': ' : ''}${d.msg}`).join('; '); }
                else if (typeof errorData.message === 'string') { errorMessage = errorData.message; }
                else { errorMessage = JSON.stringify(errorData.detail).substring(0, 200); }
            } else if (errorText) { errorMessage = errorText.substring(0, 200); }
            else { errorMessage = response.statusText || `Request failed with status ${response.status}`; }
            console.error(`API Error Response: ${response.status} ${response.statusText} from ${apiUrl}`, { data: errorData, text: errorText });
            throw new ApiError(errorMessage, response.status, errorData || undefined);
        }
        if (response.status === 204 || response.headers.get('content-length') === '0') { return null as T; }
        try { const data: T = await response.json(); return data; }
        catch (jsonError) {
            const responseText = await response.text().catch(() => "Could not read response text.");
            console.error(`API Request: Invalid JSON response from ${apiUrl}. Status: ${response.status}. Response Text: ${responseText}`, jsonError);
            throw new ApiError(`Invalid JSON response received from server.`, response.status);
        }
    } catch (error) {
        if (error instanceof ApiError) { throw error; }
        else if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
            const networkErrorMsg = 'Network error or API Gateway unreachable. Check connection and API URL.';
            console.error(`API Request Network Error: ${networkErrorMsg} (URL: ${apiUrl})`, error);
            throw new ApiError(networkErrorMsg, 0);
        } else {
            console.error(`API Request: Unexpected error during fetch to ${apiUrl}`, error);
            const message = error instanceof Error ? error.message : 'An unknown fetch error occurred.';
            throw new ApiError(`Unexpected fetch error: ${message}`, 500);
        }
    }
}

// --- Tipos Específicos de Servicio ---
export interface IngestResponse { document_id: string; task_id: string; status: string; message: string; }
export interface AuthHeaders { 'X-Company-ID': string; 'X-User-ID': string; }
export interface DocumentStatusApiResponse { id: string; status: string; file_name?: string | null; file_type?: string | null; file_path?: string | null; company_id?: string; chunk_count?: number | null; error_message?: string | null; created_at?: string; uploaded_at?: string; last_updated?: string; minio_exists?: boolean; milvus_chunk_count?: number; message?: string; }
export interface DocumentStatusResponse { document_id: string; status: string; file_name?: string | null; file_type?: string | null; chunk_count?: number | null; error_message?: string | null; created_at?: string; last_updated?: string | null; minio_exists?: boolean; milvus_chunk_count?: number; }
export interface DetailedDocumentStatusResponse extends DocumentStatusResponse { minio_exists: boolean; milvus_chunk_count: number; message?: string; }

// Estructura de un documento/fragmento recuperado por la API de /ask
export interface RetrievedDocApi {
  id: string; // ID del chunk/fragmento
  document_id: string | null; // ID del documento padre, PUEDE SER NULL
  file_name: string | null;
  content: string; // Contenido completo del chunk
  content_preview: string; // Vista previa del chunk
  metadata: Record<string, any> | null;
  score: number;
  cita_tag?: string; // Opcional, si el backend lo empieza a enviar para /ask
}

// Estructura de una fuente tal como viene en el historial de mensajes del backend
interface ChatMessageSourceFromHistory {
    score: number;
    pagina?: string;
    cita_tag: string;
    id_documento: string; 
    nombre_archivo: string; 
}

// Estructura de un mensaje de chat de la API (para historial)
export interface ChatMessageApi {
    id: string;
    chat_id: string;
    role: 'user' | 'assistant';
    content: string;
    sources: ChatMessageSourceFromHistory[] | null;
    created_at: string;
}

// Interfaz unificada para el frontend (usada en panel de fuentes, etc.)
export type RetrievedDoc = {
  id: string; 
  document_id: string | null; // Puede ser null
  file_name: string | null;
  content?: string; // Contenido completo (puede no estar disponible para historial)
  content_preview?: string; // Vista previa (puede no estar disponible para historial)
  metadata: Record<string, any> | null;
  score: number;
  cita_tag?: string; 
};

export interface ChatSummary { id: string; title: string | null; created_at: string; updated_at: string; message_count: number; }
export interface QueryPayload { query: string; retriever_top_k?: number; chat_id?: string | null; }
export interface QueryApiResponse { answer: string; retrieved_documents: RetrievedDocApi[]; query_log_id: string | null; chat_id: string; }
export interface LoginResponse { access_token: string; token_type: string; user_id: string; email: string; full_name: string | null; role: string; company_id: string | null; }
export interface AdminStatsResponse { company_count: number; users_per_company: Array<{ company_id: string; name: string | null; user_count: number; }>; }
export interface CompanySelectItem { id: string; name: string; }
export interface CreateCompanyPayload { name: string; }
export interface CompanyResponse { id: string; name: string; created_at?: string; }
export interface CreateUserPayload { email: string; password: string; name: string; company_id: string; roles?: string[]; }
export interface UserResponse { id: string; email: string; name: string | null; company_id: string | null; is_active?: boolean; created_at?: string; }
export interface UserAdminResponse { 
  id: string; 
  email: string; 
  name: string | null; 
  company_id: string | null; 
  is_active?: boolean; 
  created_at?: string;
  roles?: string[];
}
export interface BulkDeleteResponse { deleted: string[]; failed: { id: string; error: string }[]; }
export interface DocumentStatsResponse { total_documents: number; total_chunks: number; by_status: Record<string, number>; by_type: Record<string, number>; by_user: Array<{ user_id: string; name: string; count: number }>; recent_activity: Array<{ date: string; uploaded: number; processed: number; error: number }>; oldest_document_date: string | null; newest_document_date: string | null; }


// ** INGEST SERVICE **
export async function uploadDocument(file: File, auth: AuthHeaders): Promise<IngestResponse> {
  const formData = new FormData(); formData.append('file', file);
  return request<IngestResponse>('/api/v1/ingest/upload', { method: 'POST', headers: { ...auth } as Record<string, string>, body: formData });
}

const mapApiResponseToFrontend = (apiDoc: DocumentStatusApiResponse): DocumentStatusResponse => {
    return {
        document_id: apiDoc.id, status: apiDoc.status, file_name: apiDoc.file_name,
        file_type: apiDoc.file_type, chunk_count: apiDoc.chunk_count,
        error_message: apiDoc.error_message, created_at: apiDoc.created_at || apiDoc.uploaded_at,
        last_updated: apiDoc.last_updated, minio_exists: apiDoc.minio_exists,
        milvus_chunk_count: apiDoc.milvus_chunk_count,
    };
};

export async function getDocumentStatusList(auth: AuthHeaders, limit: number = 50, offset: number = 0): Promise<DocumentStatusResponse[]> {
  const endpoint = `/api/v1/ingest/status?limit=${limit}&offset=${offset}`;
  const apiResponse = await request<DocumentStatusApiResponse[]>(endpoint, { method: 'GET', headers: { ...auth } as Record<string, string> });
  return (apiResponse || []).map(mapApiResponseToFrontend);
}

export const getDocumentStatus = async (documentId: string, auth: AuthHeaders): Promise<DetailedDocumentStatusResponse> => {
    if (!documentId || typeof documentId !== 'string') { throw new ApiError("Se requiere un ID de documento válido.", 400); }
    const apiDoc = await request<DocumentStatusApiResponse>(`/api/v1/ingest/status/${documentId}`, { method: 'GET', headers: { ...auth } as Record<string, string> });
    const frontendDoc = mapApiResponseToFrontend(apiDoc) as DetailedDocumentStatusResponse;
    frontendDoc.minio_exists = apiDoc.minio_exists ?? false;
    frontendDoc.milvus_chunk_count = apiDoc.milvus_chunk_count ?? -1;
    frontendDoc.message = apiDoc.message;
    return frontendDoc;
};

export async function retryIngestDocument(documentId: string, auth: AuthHeaders): Promise<IngestResponse> {
  if (!documentId || typeof documentId !== 'string') { throw new ApiError("Se requiere un ID de documento válido para reintentar.", 400); }
  const endpoint = `/api/v1/ingest/retry/${documentId}`;
  return request<IngestResponse>(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', ...auth } as Record<string, string> });
}

export async function deleteIngestDocument(documentId: string, auth: AuthHeaders): Promise<void> {
  if (!documentId || typeof documentId !== 'string') { throw new ApiError("Se requiere un ID de documento válido para eliminar.", 400); }
  await request<null>(`/api/v1/ingest/${documentId}`, { method: 'DELETE', headers: { ...auth } as Record<string, string> });
}

export async function deleteIngestDocumentsBulk(documentIds: string[], auth: AuthHeaders): Promise<BulkDeleteResponse> {
  if (!Array.isArray(documentIds) || documentIds.length === 0) throw new ApiError("Se requiere al menos un ID de documento para borrado masivo.", 400);
  return request<BulkDeleteResponse>( '/api/v1/ingest/bulk', { method: 'DELETE', headers: { ...auth } as Record<string, string>, body: JSON.stringify({ document_ids: documentIds }) } );
}

// ** QUERY SERVICE **
export const getChats = async (limit: number = 100, offset: number = 0): Promise<ChatSummary[]> => {
     const endpoint = `/api/v1/query/chats?limit=${limit}&offset=${offset}`;
     const response = await request<ChatSummary[]>(endpoint); return response || [];
};

export const getChatMessages = async (chatId: string, limit: number = 100, offset: number = 0): Promise<ChatMessageApi[]> => {
     if (!chatId || typeof chatId !== 'string') { throw new ApiError("Se requiere un ID de chat válido.", 400); }
     const endpoint = `/api/v1/query/chats/${chatId}/messages?limit=${limit}&offset=${offset}`;
     const response = await request<ChatMessageApi[]>(endpoint); return response || [];
};

export const postQuery = async (payload: QueryPayload): Promise<QueryApiResponse> => {
     const body = { ...payload, chat_id: payload.chat_id || null };
     return request<QueryApiResponse>('/api/v1/query/ask', { method: 'POST', body: JSON.stringify(body) });
};

export const deleteChat = async (chatId: string): Promise<void> => {
    if (!chatId || typeof chatId !== 'string') { throw new ApiError("Se requiere un ID de chat válido para eliminar.", 400); }
    await request<null>(`/api/v1/query/chats/${chatId}`, { method: 'DELETE' });
};


// ** HELPERS **
export const mapApiSourcesToFrontend = (
    apiSources: Array<RetrievedDocApi | ChatMessageSourceFromHistory> | null | undefined
): RetrievedDoc[] | undefined => {
    if (!apiSources || apiSources.length === 0) return undefined;

    return apiSources.map((source: any) => {
        if ('id_documento' in source && !('document_id' in source)) { 
            const historySource = source as ChatMessageSourceFromHistory;
            const parts = historySource.id_documento.split('_');
            const docId = parts.length > 1 ? parts.slice(0, -1).join('_') : historySource.id_documento;
            
            return {
                id: historySource.id_documento,
                document_id: docId, 
                file_name: historySource.nombre_archivo === "None" ? null : historySource.nombre_archivo,
                content: undefined, 
                content_preview: undefined, 
                metadata: null,
                score: historySource.score,
                cita_tag: historySource.cita_tag
            };
        } else { 
            const askSource = source as RetrievedDocApi;
            return {
                id: askSource.id,
                document_id: askSource.document_id, 
                file_name: askSource.file_name,
                content: askSource.content, 
                content_preview: askSource.content_preview, 
                metadata: askSource.metadata,
                score: askSource.score,
                cita_tag: askSource.cita_tag
            };
        }
    });
};

export const mapApiMessageToFrontend = (apiMessage: ChatMessageApi): Message => {
    const mappedSources = mapApiSourcesToFrontend(apiMessage.sources);
    return { id: apiMessage.id, role: apiMessage.role, content: apiMessage.content, sources: mappedSources, isError: false, created_at: apiMessage.created_at, };
};


// --- Admin API Functions ---
export async function getAdminStats(): Promise<AdminStatsResponse> {
    return request<AdminStatsResponse>('/api/v1/admin/stats', { method: 'GET' });
}
export async function listCompaniesForSelect(): Promise<CompanySelectItem[]> {
    return request<CompanySelectItem[]>('/api/v1/admin/companies/select', { method: 'GET' });
}
export async function createCompany(payload: CreateCompanyPayload): Promise<CompanyResponse> {
    return request<CompanyResponse>('/api/v1/admin/companies', { method: 'POST', body: JSON.stringify(payload) });
}
export async function createUser(payload: CreateUserPayload): Promise<UserResponse> {
     console.log("API Call: Attempting createUser with payload:", payload);
     return request<UserResponse>('/api/v1/admin/users', {
         method: 'POST',
         body: JSON.stringify(payload),
     });
}

// --- Document Stats API ---
export async function getDocumentStats(
  authHeaders: AuthHeaders,
  params?: { from_date?: string; to_date?: string; status?: string; group_by?: string }
): Promise<DocumentStatsResponse> {
  let query = '';
  if (params) {
    const q = Object.entries(params)
      .filter(([_, v]) => v)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v!)}`)
      .join('&');
    if (q) query = `?${q}`;
  }
  return request<DocumentStatsResponse>(
    `/api/v1/documents/stats${query}`,
    { method: 'GET', headers: { ...authHeaders } as Record<string, string> }
  );
}

// --- User API Functions --- 
export async function getUsersByCompany(companyId: string, auth: AuthHeaders, limit: number = 50, offset: number = 0): Promise<UserAdminResponse[]> {
  if (!companyId || typeof companyId !== 'string') { throw new ApiError("Se requiere un ID de empresa válido.", 400); }
  const endpoint = `/api/v1/admin/users/by_company/${companyId}?limit=${limit}&offset=${offset}`;
  return request<UserAdminResponse[]>(endpoint, { method: 'GET', headers: { ...auth } as Record<string, string> });
}