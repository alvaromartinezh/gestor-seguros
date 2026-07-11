import type { ComprobadorActualizaciones, EstadoActualizacion } from '../../aplicacion/puertos/ComprobadorActualizaciones';

/** Adaptador de respaldo para `npm run dev`: no hay mecanismo de instalación en el navegador. */
export class ComprobadorActualizacionesNulo implements ComprobadorActualizaciones {
  async comprobar(): Promise<EstadoActualizacion> {
    return { hayNueva: false };
  }

  async instalarAhora(): Promise<void> {
    // sin efecto
  }
}
