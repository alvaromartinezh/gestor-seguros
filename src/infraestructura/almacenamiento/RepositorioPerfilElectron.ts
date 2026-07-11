import type { Perfil } from '../../dominio';
import type { RepositorioPerfil } from '../../aplicacion/puertos/RepositorioPerfil';

function puente() {
  if (!window.gestorSeguros) throw new Error('El puente de Electron no está disponible en este proceso.');
  return window.gestorSeguros;
}

export class RepositorioPerfilElectron implements RepositorioPerfil {
  async cargar(): Promise<Perfil | null> {
    return puente().storage.perfilCargar();
  }

  async guardar(perfil: Perfil): Promise<void> {
    return puente().storage.perfilGuardar(perfil);
  }
}
