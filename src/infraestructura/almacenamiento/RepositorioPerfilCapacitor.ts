import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import type { Perfil } from '../../dominio';
import type { RepositorioPerfil } from '../../aplicacion/puertos/RepositorioPerfil';

const RUTA = 'gestor-seguros/perfil.json';

export class RepositorioPerfilCapacitor implements RepositorioPerfil {
  async cargar(): Promise<Perfil | null> {
    try {
      const res = await Filesystem.readFile({ path: RUTA, directory: Directory.Data, encoding: Encoding.UTF8 });
      return JSON.parse(res.data as string) as Perfil;
    } catch {
      return null;
    }
  }

  async guardar(perfil: Perfil): Promise<void> {
    await Filesystem.mkdir({ path: 'gestor-seguros', directory: Directory.Data, recursive: true }).catch(() => {});
    await Filesystem.writeFile({
      path: RUTA,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
      data: JSON.stringify(perfil),
    });
  }
}
