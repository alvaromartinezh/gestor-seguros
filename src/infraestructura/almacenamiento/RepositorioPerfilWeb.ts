import type { Perfil } from '../../dominio';
import type { RepositorioPerfil } from '../../aplicacion/puertos/RepositorioPerfil';

export class RepositorioPerfilWeb implements RepositorioPerfil {
  constructor(private readonly clave = 'gestor-seguros/perfil/v1') {}

  async cargar(): Promise<Perfil | null> {
    try {
      const raw = localStorage.getItem(this.clave);
      return raw ? (JSON.parse(raw) as Perfil) : null;
    } catch {
      return null;
    }
  }

  async guardar(perfil: Perfil): Promise<void> {
    localStorage.setItem(this.clave, JSON.stringify(perfil));
  }
}
