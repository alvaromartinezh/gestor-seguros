export interface Sesion {
  userId: string;
  email: string;
}

export type ResultadoEnvioCodigo = { ok: true } | { ok: false; error: string };
export type ResultadoVerificacion = { ok: true; sesion: Sesion } | { ok: false; error: string };

/**
 * Puerto de autenticación (DIP): login sin contraseña por código de un solo
 * uso enviado por email. A diferencia de Notificador/AlmacenBackup, un único
 * adaptador (Supabase) sirve para las tres plataformas — el cliente es JS de
 * navegador estándar y funciona igual en el renderer de Electron y en el
 * WebView de Capacitor.
 */
export interface Autenticacion {
  sesionActual(): Promise<Sesion | null>;
  enviarCodigo(email: string): Promise<ResultadoEnvioCodigo>;
  verificarCodigo(email: string, codigo: string): Promise<ResultadoVerificacion>;
  cerrarSesion(): Promise<void>;
}
