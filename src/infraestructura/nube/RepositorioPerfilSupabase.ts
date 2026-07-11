import type { RepositorioPerfil } from '../../aplicacion/puertos/RepositorioPerfil';
import type { Perfil } from '../../dominio';
import { supabase } from './clienteSupabase';
import { estadoConexion } from './estadoConexion';

interface FilaPerfil {
  user_id: string;
  nombre: string;
  foto: string;
  companias: string[];
  dias_aviso: number;
}

function filaAPerfil(f: FilaPerfil): Perfil {
  return { nombre: f.nombre, foto: f.foto, companias: f.companias, diasAviso: f.dias_aviso };
}

function perfilAFila(p: Perfil, userId: string): FilaPerfil {
  return { user_id: userId, nombre: p.nombre, foto: p.foto, companias: p.companias, dias_aviso: p.diasAviso };
}

async function idUsuarioActual(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.user.id ?? null;
}

/** Mismo patrón caché-de-lectura que RepositorioPolizasSupabase. */
export class RepositorioPerfilSupabase implements RepositorioPerfil {
  constructor(private readonly cache: RepositorioPerfil) {}

  async cargar(): Promise<Perfil | null> {
    try {
      const userId = await idUsuarioActual();
      if (!userId) return null;

      const { data, error } = await supabase.from('perfiles').select('*').eq('user_id', userId).maybeSingle();
      if (error) throw error;

      if (!data) {
        // Migración automática: perfil local de antes de la sincronización.
        const local = await this.cache.cargar();
        if (local) {
          await this.guardar(local);
          estadoConexion.sinConexion = false;
          return local;
        }
        estadoConexion.sinConexion = false;
        return null;
      }

      const perfil = filaAPerfil(data as FilaPerfil);
      estadoConexion.sinConexion = false;
      await this.cache.guardar(perfil);
      return perfil;
    } catch {
      estadoConexion.sinConexion = true;
      return this.cache.cargar();
    }
  }

  async guardar(perfil: Perfil): Promise<void> {
    const userId = await idUsuarioActual();
    if (!userId) throw new Error('No hay sesión iniciada.');

    try {
      const { error } = await supabase.from('perfiles').upsert(perfilAFila(perfil, userId));
      if (error) throw error;
    } catch (e) {
      estadoConexion.sinConexion = true;
      throw e;
    }

    estadoConexion.sinConexion = false;
    await this.cache.guardar(perfil);
  }
}
