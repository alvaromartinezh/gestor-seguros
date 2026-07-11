/**
 * Credenciales del proyecto Supabase. La clave "anon" está pensada para ir
 * embebida en el cliente — la seguridad la da RLS (ver
 * supabase/migrations/0001_init.sql), no ocultar esta clave. Mismo patrón
 * que REPO_OWNER/REPO_NAME en infraestructura/actualizaciones/config.ts:
 * un dato de identidad del proyecto, no un secreto de CI que mantener.
 */
export const SUPABASE_URL = 'https://nxdyaoxclywqggwtjbux.supabase.co';
export const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54ZHlhb3hjbHl3cWdnd3RqYnV4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3NTYxNjUsImV4cCI6MjA5OTMzMjE2NX0.i_jW8DWOUuSfEh9o8q-hhr4FqKFVBKeZTCX76idqtE4';
