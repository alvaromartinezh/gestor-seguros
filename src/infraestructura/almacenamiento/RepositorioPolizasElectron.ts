import type { Poliza } from '../../dominio';
import type { RepositorioPolizas } from '../../aplicacion/puertos/RepositorioPolizas';

function puente() {
  if (!window.gestorSeguros) throw new Error('El puente de Electron no está disponible en este proceso.');
  return window.gestorSeguros;
}

/** Adaptador de escritorio: persiste en un fichero JSON en userData vía IPC (ver electron/main.ts). */
export class RepositorioPolizasElectron implements RepositorioPolizas {
  async existe(): Promise<boolean> {
    return puente().storage.polizasExiste();
  }

  async cargar(): Promise<Poliza[]> {
    return puente().storage.polizasCargar();
  }

  async guardar(polizas: Poliza[]): Promise<void> {
    return puente().storage.polizasGuardar(polizas);
  }
}
