import type { Poliza } from '../../dominio';
import type { RepositorioPolizas } from '../../aplicacion/puertos/RepositorioPolizas';

/**
 * Adaptador de respaldo para `npm run dev` en el navegador puro (sin Electron
 * ni Capacitor). No se usa en la app empaquetada final.
 */
export class RepositorioPolizasWeb implements RepositorioPolizas {
  constructor(private readonly clave = 'gestor-seguros/polizas/v1') {}

  async existe(): Promise<boolean> {
    return localStorage.getItem(this.clave) !== null;
  }

  async cargar(): Promise<Poliza[]> {
    try {
      const raw = localStorage.getItem(this.clave);
      return raw ? (JSON.parse(raw) as Poliza[]) : [];
    } catch {
      return [];
    }
  }

  async guardar(polizas: Poliza[]): Promise<void> {
    localStorage.setItem(this.clave, JSON.stringify(polizas));
  }
}
