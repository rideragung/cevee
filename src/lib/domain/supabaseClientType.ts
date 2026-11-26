/**
 * Type-only re-export so the app and the MCP package resolve the same
 * SupabaseClient identity. The MCP package has its own runtime copy of
 * @supabase/supabase-js (declared as a peer dependency), and TypeScript
 * otherwise treats the two class types as incompatible because of protected
 * members.
 */
export type { SupabaseClient } from '@supabase/supabase-js';
