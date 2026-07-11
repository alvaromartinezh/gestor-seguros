import type { ComprobadorActualizaciones, EstadoActualizacion } from '../../aplicacion/puertos/ComprobadorActualizaciones';

function puente() {
  if (!window.gestorSeguros) throw new Error('El puente de Electron no está disponible en este proceso.');
  return window.gestorSeguros;
}

/**
 * Adaptador de escritorio: electron-updater vigila el feed de Releases de
 * GitHub y descarga en segundo plano dentro del proceso principal (ver
 * electron/actualizaciones.cjs); aquí solo se pregunta por el último estado
 * conocido y, si ya hay una descargada, se dispara la instalación.
 */
export class ComprobadorActualizacionesElectron implements ComprobadorActualizaciones {
  async comprobar(): Promise<EstadoActualizacion> {
    return puente().actualizaciones.comprobar();
  }

  async instalarAhora(): Promise<void> {
    return puente().actualizaciones.instalarAhora();
  }
}
