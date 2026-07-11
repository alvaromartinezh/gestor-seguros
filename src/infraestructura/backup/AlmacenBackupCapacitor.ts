import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import type { AlmacenBackup, ResultadoExportar, ResultadoImportar } from '../../aplicacion/puertos/AlmacenBackup';
import { seleccionarArchivoTexto } from './seleccionarArchivoTexto';

/**
 * Adaptador Android: no hay diálogo "guardar como" en un móvil sin pedir
 * permisos amplios de almacenamiento, así que se escribe el backup en el
 * área privada de la app y se abre la hoja de compartir nativa para que el
 * usuario lo mande donde quiera (Drive, WhatsApp, correo, etc.).
 */
export class AlmacenBackupCapacitor implements AlmacenBackup {
  async exportarArchivo(nombreSugerido: string, contenido: string): Promise<ResultadoExportar> {
    try {
      const escrito = await Filesystem.writeFile({
        path: nombreSugerido,
        directory: Directory.Cache,
        encoding: Encoding.UTF8,
        data: contenido,
      });
      await Share.share({
        title: 'Copia de seguridad — Gestor de Seguros',
        url: escrito.uri,
      });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'No se pudo compartir el archivo' };
    }
  }

  async importarArchivo(): Promise<ResultadoImportar> {
    return seleccionarArchivoTexto();
  }
}
