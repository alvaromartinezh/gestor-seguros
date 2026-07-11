import type { Poliza } from '../../dominio';

/**
 * Puerto de persistencia de pólizas (DIP). La capa de aplicación solo conoce
 * esta interfaz; cada plataforma aporta su propio adaptador en infraestructura/.
 */
export interface RepositorioPolizas {
  existe(): Promise<boolean>;
  cargar(): Promise<Poliza[]>;
  guardar(polizas: Poliza[]): Promise<void>;
}
