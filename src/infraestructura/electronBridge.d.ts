import type { Perfil, Poliza } from '../dominio';
import type { AvisoProgramable } from '../aplicacion/puertos/Notificador';
import type { ResultadoExportar, ResultadoImportar } from '../aplicacion/puertos/AlmacenBackup';
import type { EstadoActualizacion } from '../aplicacion/puertos/ComprobadorActualizaciones';

/**
 * Forma exacta de la API que `electron/preload.ts` expone vía
 * `contextBridge.exposeInMainWorld('gestorSeguros', ...)`. Vive aquí (y no en
 * electron/) para que los adaptadores de infraestructura tengan un contrato
 * tipado sin depender del paquete `electron`.
 */
export interface PuenteElectron {
  storage: {
    polizasExiste(): Promise<boolean>;
    polizasCargar(): Promise<Poliza[]>;
    polizasGuardar(polizas: Poliza[]): Promise<void>;
    perfilCargar(): Promise<Perfil | null>;
    perfilGuardar(perfil: Perfil): Promise<void>;
  };
  notificaciones: {
    solicitarPermiso(): Promise<boolean>;
    sincronizar(avisos: AvisoProgramable[]): Promise<void>;
    mostrarInmediata(titulo: string, cuerpo: string): Promise<void>;
  };
  backup: {
    exportarArchivo(nombreSugerido: string, contenido: string): Promise<ResultadoExportar>;
    importarArchivo(): Promise<ResultadoImportar>;
  };
  actualizaciones: {
    comprobar(): Promise<EstadoActualizacion>;
    instalarAhora(): Promise<void>;
  };
}

declare global {
  interface Window {
    gestorSeguros?: PuenteElectron;
  }
}
