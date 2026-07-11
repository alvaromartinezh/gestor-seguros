import {
  DIAS_AVISO_DEFECTO,
  normalizarPerfil,
  nuevoPerfilVacio,
  validarPerfil,
  type DatosPerfil,
  type Errores,
  type Perfil,
} from '../../dominio';
import type { RepositorioPerfil } from '../puertos/RepositorioPerfil';

export type ResultadoGuardarPerfil = { ok: true; perfil: Perfil } | { ok: false; errores: Errores<Perfil> };

/** Caso de uso "gestionar el perfil del agente": identidad + compañías + días de aviso. */
export class ServicioPerfil {
  private perfil: Perfil | null = null;

  constructor(
    private readonly repo: RepositorioPerfil,
    private readonly diasAvisoDefecto: number = DIAS_AVISO_DEFECTO,
  ) {}

  async inicializar(): Promise<Perfil | null> {
    this.perfil = await this.repo.cargar();
    return this.perfil;
  }

  existe(): boolean {
    return this.perfil !== null;
  }

  actual(): Perfil {
    return this.perfil ?? (nuevoPerfilVacio(this.diasAvisoDefecto) as Perfil);
  }

  diasAviso(): number {
    return this.perfil?.diasAviso ?? this.diasAvisoDefecto;
  }

  async guardar(datos: DatosPerfil): Promise<ResultadoGuardarPerfil> {
    const errores = validarPerfil(datos);
    if (Object.keys(errores).length) return { ok: false, errores };
    this.perfil = normalizarPerfil(datos, this.diasAvisoDefecto);
    await this.repo.guardar(this.perfil);
    return { ok: true, perfil: this.perfil };
  }

  /** Sustituye el perfil directamente (usado al restaurar una copia de seguridad). */
  async restaurar(perfil: Perfil | null): Promise<void> {
    this.perfil = perfil;
    if (perfil) await this.repo.guardar(perfil);
  }
}
