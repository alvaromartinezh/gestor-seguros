import type { AvisoProgramable, Notificador } from '../../aplicacion/puertos/Notificador';

/** Adaptador nulo: usado en `npm run dev` (navegador) donde no hay notificaciones nativas. */
export class NotificadorNulo implements Notificador {
  async solicitarPermiso(): Promise<boolean> {
    return false;
  }

  async sincronizar(_avisos: AvisoProgramable[]): Promise<void> {
    // sin efecto
  }

  async mostrarInmediata(_titulo: string, _cuerpo: string): Promise<void> {
    // sin efecto
  }
}
