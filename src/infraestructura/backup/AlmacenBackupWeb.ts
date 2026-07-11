import type { AlmacenBackup, ResultadoExportar, ResultadoImportar } from '../../aplicacion/puertos/AlmacenBackup';
import { seleccionarArchivoTexto } from './seleccionarArchivoTexto';

/** Adaptador de respaldo para `npm run dev`: descarga el archivo con el mecanismo estándar del navegador. */
export class AlmacenBackupWeb implements AlmacenBackup {
  async exportarArchivo(nombreSugerido: string, contenido: string): Promise<ResultadoExportar> {
    const blob = new Blob([contenido], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreSugerido;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    return { ok: true };
  }

  async importarArchivo(): Promise<ResultadoImportar> {
    return seleccionarArchivoTexto();
  }
}
