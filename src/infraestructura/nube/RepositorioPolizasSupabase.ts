import type { RepositorioPolizas } from '../../aplicacion/puertos/RepositorioPolizas';
import type { Poliza } from '../../dominio';
import { supabase } from './clienteSupabase';
import { estadoConexion } from './estadoConexion';

export interface FilaPoliza {
  id: string;
  user_id: string;
  nombre: string;
  telefono: string;
  email: string;
  dni: string;
  tipo: string;
  compania: string;
  coche: string;
  matricula: string;
  fecha_contratacion: string;
  fecha_vencimiento: string;
  precio: number | string;
  notas: string;
  demo: boolean;
}

export function filaAPoliza(f: FilaPoliza): Poliza {
  return {
    id: f.id,
    nombre: f.nombre,
    telefono: f.telefono,
    email: f.email,
    dni: f.dni,
    tipo: f.tipo,
    compania: f.compania,
    coche: f.coche,
    matricula: f.matricula,
    fechaContratacion: f.fecha_contratacion,
    fechaVencimiento: f.fecha_vencimiento,
    precio: typeof f.precio === 'string' ? parseFloat(f.precio) : f.precio,
    notas: f.notas,
    demo: f.demo,
  };
}

export function polizaAFila(p: Poliza, userId: string): FilaPoliza {
  return {
    id: p.id as string,
    user_id: userId,
    nombre: p.nombre,
    telefono: p.telefono,
    email: p.email,
    dni: p.dni,
    tipo: p.tipo,
    compania: p.compania,
    coche: p.coche,
    matricula: p.matricula,
    fecha_contratacion: p.fechaContratacion,
    fecha_vencimiento: p.fechaVencimiento,
    precio: p.precio,
    notas: p.notas,
    demo: p.demo,
  };
}

async function idUsuarioActual(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/**
 * Adaptador de nube: Supabase es la fuente de verdad; `cache` (el
 * repositorio local ya existente de esta plataforma) guarda la última
 * carga válida para poder leer sin conexión. Guardar siempre exige
 * conexión — sin fusión de cambios offline, ver plan de "sincronización
 * simple".
 */
export class RepositorioPolizasSupabase implements RepositorioPolizas {
  constructor(private readonly cache: RepositorioPolizas) {}

  async existe(): Promise<boolean> {
    return true; // una sesión iniciada siempre "tiene" cartera en la nube, aunque esté vacía
  }

  async cargar(): Promise<Poliza[]> {
    try {
      const userId = await idUsuarioActual();
      if (!userId) return [];

      const { data, error } = await supabase.from('polizas').select('*').eq('user_id', userId);
      if (error) throw error;

      let polizas = (data as FilaPoliza[]).map(filaAPoliza);

      // Migración automática: si la nube está vacía pero el dispositivo ya
      // tenía datos locales de antes de existir la sincronización, se suben
      // una vez — idempotente, la próxima carga ya no entra aquí.
      if (polizas.length === 0) {
        const locales = await this.cache.cargar();
        if (locales.length > 0) {
          await this.guardar(locales);
          polizas = locales;
        }
      }

      estadoConexion.sinConexion = false;
      await this.cache.guardar(polizas);
      return polizas;
    } catch {
      estadoConexion.sinConexion = true;
      return this.cache.cargar();
    }
  }

  async guardar(polizas: Poliza[]): Promise<void> {
    const userId = await idUsuarioActual();
    if (!userId) throw new Error('No hay sesión iniciada.');

    const filas = polizas.map((p) => polizaAFila(p, userId));
    try {
      if (filas.length > 0) {
        const { error } = await supabase.from('polizas').upsert(filas);
        if (error) throw error;
      }
      const ids = polizas.map((p) => p.id).filter((id): id is string => !!id);
      let borrado = supabase.from('polizas').delete().eq('user_id', userId);
      if (ids.length > 0) {
        borrado = borrado.not('id', 'in', `(${ids.map((id) => `"${id}"`).join(',')})`);
      }
      const { error: errorBorrar } = await borrado;
      if (errorBorrar) throw errorBorrar;
    } catch (e) {
      estadoConexion.sinConexion = true;
      throw e;
    }

    estadoConexion.sinConexion = false;
    await this.cache.guardar(polizas);
  }
}
