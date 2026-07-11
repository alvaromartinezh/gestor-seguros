import type { Perfil } from '../../dominio';

export interface RepositorioPerfil {
  cargar(): Promise<Perfil | null>;
  guardar(perfil: Perfil): Promise<void>;
}
