import { LocalNotifications } from '@capacitor/local-notifications';
import type { AvisoProgramable, Notificador } from '../../aplicacion/puertos/Notificador';

/** Convierte el id textual de una póliza en un entero estable de 32 bits (requisito de la API nativa). */
function idNumerico(idTexto: string): number {
  let h = 0;
  for (let i = 0; i < idTexto.length; i++) {
    h = (Math.imul(31, h) + idTexto.charCodeAt(i)) | 0;
  }
  return Math.abs(h) || 1;
}

const HORA_AVISO = { horas: 9, minutos: 0 };

/**
 * Adaptador Android: notificación local real programada por el sistema
 * (AlarmManager), funciona con la app cerrada. `sincronizar` reemplaza todo
 * el conjunto pendiente: cancela lo programado y reprograma desde cero, así
 * nunca queda un aviso obsoleto de una póliza borrada o ya renovada.
 */
export class NotificadorCapacitor implements Notificador {
  async solicitarPermiso(): Promise<boolean> {
    const estado = await LocalNotifications.requestPermissions();
    return estado.display === 'granted';
  }

  async sincronizar(avisos: AvisoProgramable[]): Promise<void> {
    const pendientes = await LocalNotifications.getPending();
    if (pendientes.notifications.length) {
      await LocalNotifications.cancel(pendientes);
    }
    if (!avisos.length) return;

    await LocalNotifications.schedule({
      notifications: avisos.map((a) => {
        const [y, m, d] = a.fechaISO.split('-').map(Number);
        const fecha = new Date(y, m - 1, d, HORA_AVISO.horas, HORA_AVISO.minutos, 0);
        return {
          id: idNumerico(a.id),
          title: a.titulo,
          body: a.cuerpo,
          schedule: { at: fecha, allowWhileIdle: true },
        };
      }),
    });
  }

  async mostrarInmediata(titulo: string, cuerpo: string): Promise<void> {
    await LocalNotifications.schedule({
      notifications: [
        {
          id: idNumerico('inmediata-' + Date.now()),
          title: titulo,
          body: cuerpo,
          schedule: { at: new Date(Date.now() + 500) },
        },
      ],
    });
  }
}
