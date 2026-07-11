import type { AlmacenBackup, ResultadoExportar, ResultadoImportar } from '../../aplicacion/puertos/AlmacenBackup';

function puente() {
  if (!window.gestorSeguros) throw new Error('El puente de Electron no está disponible en este proceso.');
  return window.gestorSeguros;
}

/** Adaptador de escritorio: diálogos nativos de guardar/abrir archivo (ver electron/main.ts). */
export class AlmacenBackupElectron implements AlmacenBackup {
  async exportarArchivo(nombreSugerido: string, contenido: string): Promise<ResultadoExportar> {
    return puente().backup.exportarArchivo(nombreSugerido, contenido);
  }

  async importarArchivo(): Promise<ResultadoImportar> {
    return puente().backup.importarArchivo();
  }
}
