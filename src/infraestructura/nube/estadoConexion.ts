/**
 * Señal compartida de conectividad real con Supabase (no el estado de la
 * interfaz de red del sistema operativo, sino si la última llamada de
 * verdad tuvo éxito). La actualizan los repositorios de
 * infraestructura/nube/*Supabase.ts; la lee el store de presentación para
 * avisar de "necesitas conexión para guardar cambios".
 */
export const estadoConexion = {
  sinConexion: false,
};
