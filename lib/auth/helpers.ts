// File: lib/auth/helpers.ts
// Purpose: Define shared authentication types/interfaces.

// --- Frontend User Interface ---
// Defines the structure of the user object used within the frontend application.
export interface User {
  userId: string;    // Mapped from Supabase User ID (user.id)
  email?: string;    // Mapped from Supabase User Email (user.email)
  name?: string | null; // Mapped from Supabase User Metadata (user.user_metadata.full_name or name) - Allow null
  companyId?: string | null; // Mapped from Supabase App Metadata (user.app_metadata.company_id) - Allow null
  roles?: string[];  // Mapped from Supabase App Metadata (user.app_metadata.roles)
  isAdmin?: boolean; // NUEVO: Flag para identificar al administrador
}