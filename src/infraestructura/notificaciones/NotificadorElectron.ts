import type { AvisoProgramable, Notificador } from '../../aplicacion/puertos/Notificador';

function puente() {
  if (!window.gestorSeguros) throw new Error('El puente de Electron no está disponible en este proceso.');
  return window.gestorSeguros;
}

/**
 * Adaptador de escritorio. La comprobación diaria y el disparo real de la
 * notificación nativa de Windows ocurren en el proceso principal
 * (electron/main.ts), que es quien sigue vivo aunque la ventana esté
 * minimizada a la bandeja del sistema; aquí solo le pasamos el estado
 * actualizado de avisos.
 */
export class NotificadorElectron implements Notificador {
  async solicitarPermiso(): Promise<boolean> {
    return puente().notificaciones.solicitarPermiso();
  }

  async sincronizar(avisos: AvisoProgramable[]): Promise<void> {
    return puente().notificaciones.sincronizar(avisos);
  }

  async mostrarInmediata(titulo: string, cuerpo: string): Promise<void> {
    return puente().notificaciones.mostrarInmediata(titulo, cuerpo);
  }
}
