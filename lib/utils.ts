// File: lib/utils.ts (MODIFICADO)
// Purpose: General utility functions, including CN for classnames and API URL retrieval.
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Retrieves the API Gateway URL from environment variables.
 * Throws an error if the environment variable is not set during runtime in production/staging.
 * Provides a default and warning in development.
 * @returns {string} The API Gateway URL without a trailing slash.
 */
export function getApiGatewayUrl(): string {
    const apiUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL;

    console.log(`getApiGatewayUrl: NEXT_PUBLIC_API_GATEWAY_URL = ${apiUrl}`);

    if (!apiUrl) {
        const errorMessage = "CRITICAL: NEXT_PUBLIC_API_GATEWAY_URL environment variable is not set.";
        console.error(errorMessage);

        if (process.env.NODE_ENV === 'production') {
             console.error("API Gateway URL must be set in production environment variables.");
             throw new Error("API Gateway URL is not configured for production.");
        }

        const defaultDevUrl = "https://1942-2001-1388-53a1-a7c9-241c-4a44-2b12-938f.ngrok-free.app";
        console.warn(`⚠️ ${errorMessage} Using default development Ngrok URL: ${defaultDevUrl}. Make sure this matches your current ngrok tunnel!`);
        return defaultDevUrl;
    }

    if (!apiUrl.startsWith('http://') && !apiUrl.startsWith('https://')) {
        console.error(`Invalid API Gateway URL format: ${apiUrl}. Must start with http:// or https://`);
        throw new Error(`Invalid API Gateway URL format: ${apiUrl}`);
    }

    return apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;
}

// --- NUEVO: Helpers para manejo local de queries ---

/**
 * Detecta saludos comunes en español o inglés.
 * @param text - El texto de entrada.
 * @returns `true` si es un saludo, `false` en caso contrario.
 */
export function isGreeting(text: string): boolean {
  const msg = text.trim().toLowerCase();
  // Regex mejorada para cubrir más variaciones y evitar falsos positivos
  return /^\s*(hola|hello|hi|hey|buen(os)?\s+(d[íi]as?|tardes?|noches?))\s*[!¡?.]*\s*$/i.test(msg);
}

/**
 * Detecta preguntas sobre las capacidades o información del asistente.
 * @param text - El texto de entrada.
 * @returns `true` si es una consulta meta, `false` en caso contrario.
 */
export function isMetaQuery(text: string): boolean {
  const msg = text.trim().toLowerCase();
  const patterns = [
    /\b(qu[ée] puedes hacer|cu[áa]les son tus func|capacidades|capabilities)\b/i, // Qué puedes hacer, capacidades
    /\b(qui[ée]n eres|what are you)\b/i, // Quién eres
    /\b(qu[ée] informaci[óo]n (tienes|posees)|what info)\b/i, // Qué información tienes
    /\b(ayuda|help|soporte|support)\b/i, // Ayuda/Soporte
  ];
  return patterns.some(pattern => pattern.test(msg));
}

/**
 * Genera una respuesta estándar para consultas meta.
 * @returns Una cadena con la respuesta predefinida.
 */
export function getMetaResponse(): string {
  // Respuesta más elaborada y útil
  return `Soy Atenex, tu asistente de inteligencia artificial diseñado para ayudarte a explorar y consultar la base de conocimiento de tu organización. Puedo:
- Buscar información específica dentro de los documentos cargados.
- Responder preguntas basadas en el contenido de esos documentos.
- Mostrarte las fuentes de donde extraje la información.

Simplemente hazme una pregunta sobre el contenido que esperas encontrar.`;
}
// --- FIN Helpers ---