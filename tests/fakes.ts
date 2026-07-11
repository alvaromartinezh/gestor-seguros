/**
 * Adaptadores en memoria para tests: implementan los mismos puertos que
 * Electron/Capacitor/Web, así que ejercitan los casos de uso exactamente
 * como en producción, sin tocar disco ni APIs nativas. Esto es justo lo que
 * compra la inversión de dependencias del puerto/adaptador.
 */
import type { AlmacenBackup, Notificador, RepositorioPerfil, RepositorioPolizas } from '../src/aplicacion';
import type { AvisoProgramable } from '../src/aplicacion';
import type { Perfil, Poliza } from '../src/dominio';

export class RepositorioPolizasMemoria implements RepositorioPolizas {
  private datos: Poliza[] | null = null;

  async existe(): Promise<boolean> {
    return this.datos !== null;
  }

  async cargar(): Promise<Poliza[]> {
    return this.datos ?? [];
  }

  async guardar(polizas: Poliza[]): Promise<void> {
    this.datos = polizas;
  }
}

export class RepositorioPerfilMemoria implements RepositorioPerfil {
  private perfil: Perfil | null = null;

  async cargar(): Promise<Perfil | null> {
    return this.perfil;
  }

  async guardar(perfil: Perfil): Promise<void> {
    this.perfil = perfil;
  }
}

export class NotificadorMemoria implements Notificador {
  ultimaSincronizacion: AvisoProgramable[] = [];
  inmediatas: { titulo: string; cuerpo: string }[] = [];

  async solicitarPermiso(): Promise<boolean> {
    return true;
  }

  async sincronizar(avisos: AvisoProgramable[]): Promise<void> {
    this.ultimaSincronizacion = avisos;
  }

  async mostrarInmediata(titulo: string, cuerpo: string): Promise<void> {
    this.inmediatas.push({ titulo, cuerpo });
  }
}

export class AlmacenBackupMemoria implements AlmacenBackup {
  archivo: string | null = null;

  async exportarArchivo(_nombreSugerido: string, contenido: string) {
    this.archivo = contenido;
    return { ok: true as const };
  }

  async importarArchivo() {
    if (this.archivo === null) return { ok: false as const, cancelado: true };
    return { ok: true as const, contenido: this.archivo };
  }
}
