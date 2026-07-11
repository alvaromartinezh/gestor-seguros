import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import type { Poliza } from '../../dominio';
import type { RepositorioPolizas } from '../../aplicacion/puertos/RepositorioPolizas';

const RUTA = 'gestor-seguros/polizas.json';

/** Adaptador Android: fichero JSON en el almacenamiento privado de la app. */
export class RepositorioPolizasCapacitor implements RepositorioPolizas {
  async existe(): Promise<boolean> {
    try {
      await Filesystem.stat({ path: RUTA, directory: Directory.Data });
      return true;
    } catch {
      return false;
    }
  }

  async cargar(): Promise<Poliza[]> {
    try {
      const res = await Filesystem.readFile({ path: RUTA, directory: Directory.Data, encoding: Encoding.UTF8 });
      return JSON.parse(res.data as string) as Poliza[];
    } catch {
      return [];
    }
  }

  async guardar(polizas: Poliza[]): Promise<void> {
    await Filesystem.mkdir({ path: 'gestor-seguros', directory: Directory.Data, recursive: true }).catch(() => {});
    await Filesystem.writeFile({
      path: RUTA,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
      data: JSON.stringify(polizas),
    });
  }
}
