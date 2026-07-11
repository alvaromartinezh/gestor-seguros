import { hoyISO, type Perfil, type Poliza } from '../../dominio';
import type { AlmacenBackup } from '../puertos/AlmacenBackup';
import type { ServicioPolizas } from './ServicioPolizas';
import type { ServicioPerfil } from './ServicioPerfil';

const VERSION_BACKUP = 1;

interface SnapshotBackup {
  version: number;
  fecha: string;
  perfil: Perfil | null;
  polizas: Poliza[];
}

export type ResultadoExportarBackup = { ok: true } | { ok: false; cancelado?: boolean; error: string };
export type ResultadoImportarBackup = { ok: true; totalPolizas: number } | { ok: false; cancelado?: boolean; error: string };

function esSnapshotValido(x: unknown): x is SnapshotBackup {
  if (!x || typeof x !== 'object') return false;
  const s = x as Record<string, unknown>;
  return typeof s.version === 'number' && Array.isArray(s.polizas);
}

/**
 * Caso de uso "copia de seguridad": exporta un volcado versionado de toda la
 * cartera + perfil, e importa reemplazando los datos actuales por completo
 * (semántica simple y predecible — la UI pide confirmación antes de llamar).
 */
export class ServicioBackup {
  constructor(
    private readonly polizasSvc: ServicioPolizas,
    private readonly perfilSvc: ServicioPerfil,
    private readonly almacen: AlmacenBackup,
  ) {}

  async exportar(): Promise<ResultadoExportarBackup> {
    const snapshot: SnapshotBackup = {
      version: VERSION_BACKUP,
      fecha: hoyISO(),
      perfil: this.perfilSvc.existe() ? this.perfilSvc.actual() : null,
      polizas: this.polizasSvc.todas(),
    };
    const nombre = `gestor-seguros-backup-${snapshot.fecha}.json`;
    const resultado = await this.almacen.exportarArchivo(nombre, JSON.stringify(snapshot, null, 2));
    if (!resultado.ok) {
      if (resultado.cancelado) return { ok: false, cancelado: true, error: '' };
      return { ok: false, error: resultado.error ?? 'No se pudo guardar el archivo' };
    }
    return { ok: true };
  }

  async importar(): Promise<ResultadoImportarBackup> {
    const resultado = await this.almacen.importarArchivo();
    if (!resultado.ok) {
      if (resultado.cancelado) return { ok: false, cancelado: true, error: '' };
      return { ok: false, error: resultado.error ?? 'No se pudo leer el archivo' };
    }
    let datos: unknown;
    try {
      datos = JSON.parse(resultado.contenido ?? '');
    } catch {
      return { ok: false, error: 'El archivo no es una copia de seguridad válida' };
    }
    if (!esSnapshotValido(datos)) {
      return { ok: false, error: 'El archivo no tiene el formato esperado' };
    }
    if (datos.version > VERSION_BACKUP) {
      return { ok: false, error: 'Esta copia se hizo con una versión más nueva de la app' };
    }
    await this.polizasSvc.reemplazarTodo(datos.polizas);
    await this.perfilSvc.restaurar(datos.perfil);
    return { ok: true, totalPolizas: datos.polizas.length };
  }
}
