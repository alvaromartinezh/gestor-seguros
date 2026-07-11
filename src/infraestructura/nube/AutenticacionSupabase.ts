import type { Autenticacion, ResultadoEnvioCodigo, ResultadoVerificacion, Sesion } from '../../aplicacion/puertos/Autenticacion';
import { supabase } from './clienteSupabase';

function aSesion(userId: string | undefined, email: string | null | undefined): Sesion | null {
  if (!userId || !email) return null;
  return { userId, email };
}

/**
 * Adaptador único para las tres plataformas (Electron/Capacitor/Web): el
 * SDK de Supabase es JS de navegador estándar. Login sin contraseña por
 * código de un solo uso — la plantilla de email en el proyecto Supabase
 * debe mostrar `{{ .Token }}` (código de 6 dígitos), no el enlace mágico.
 */
export class AutenticacionSupabase implements Autenticacion {
  async sesionActual(): Promise<Sesion | null> {
    const { data } = await supabase.auth.getSession();
    return aSesion(data.session?.user.id, data.session?.user.email);
  }

  async enviarCodigo(email: string): Promise<ResultadoEnvioCodigo> {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) return { ok: false, error: 'No se pudo enviar el código. Comprueba el email e inténtalo de nuevo.' };
    return { ok: true };
  }

  async verificarCodigo(email: string, codigo: string): Promise<ResultadoVerificacion> {
    const { data, error } = await supabase.auth.verifyOtp({ email, token: codigo, type: 'email' });
    const sesion = aSesion(data.user?.id, data.user?.email);
    if (error || !sesion) return { ok: false, error: 'Código incorrecto o caducado.' };
    return { ok: true, sesion };
  }

  async cerrarSesion(): Promise<void> {
    await supabase.auth.signOut();
  }
}
