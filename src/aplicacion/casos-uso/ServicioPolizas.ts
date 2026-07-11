import {
  DIAS_AVISO_DEFECTO,
  hoyISO,
  normalizarPoliza,
  sumarUnAnio,
  validarPoliza,
  type DatosPoliza,
  type Errores,
  type Poliza,
} from '../../dominio';
import type { RepositorioPolizas } from '../puertos/RepositorioPolizas';
import type { Notificador } from '../puertos/Notificador';
import { generarPolizasDemo } from './datosDemo';
import {
  calcularAgenda,
  calcularAvisos,
  calcularEstadisticas,
  calcularProgramacionAvisos,
  companiasEnUso,
  filtrarPolizas,
  polizasPorDia,
  type AvisoRenovacion,
  type EstadisticasCartera,
  type FiltrosPolizas,
  type GrupoAgenda,
} from '../consultas/consultasPolizas';

export type { FiltrosPolizas, EstadisticasCartera, AvisoRenovacion, GrupoAgenda };
export type ResultadoGuardar = { ok: true; poliza: Poliza } | { ok: false; errores: Errores<Poliza> };

let secuencia = Date.now();
function generarId(): string {
  return 'pol-' + (secuencia++).toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

/**
 * Caso de uso "gestionar cartera de pólizas": CRUD + persistencia. Las
 * consultas de solo lectura (listar, estadísticas, avisos, agenda) delegan
 * en `aplicacion/consultas/consultasPolizas.ts`, funciones puras que también
 * usa directamente el store de presentación para mantener la reactividad de
 * Svelte sin duplicar reglas.
 */
export class ServicioPolizas {
  private polizas: Poliza[] = [];

  constructor(private readonly repo: RepositorioPolizas) {}

  async inicializar({ conDemo = true }: { conDemo?: boolean } = {}): Promise<Poliza[]> {
    if (await this.repo.existe()) {
      this.polizas = await this.repo.cargar();
    } else {
      this.polizas = conDemo ? generarPolizasDemo(50) : [];
      await this.repo.guardar(this.polizas);
    }
    return this.polizas;
  }

  hayDatosDemo(): boolean {
    return this.polizas.some((p) => p.demo);
  }

  async eliminarDatosDemo(): Promise<void> {
    this.polizas = this.polizas.filter((p) => !p.demo);
    await this.repo.guardar(this.polizas);
  }

  // ── Casos de uso CRUD ──

  async guardarPoliza(datos: DatosPoliza): Promise<ResultadoGuardar> {
    const errores = validarPoliza(datos);
    if (Object.keys(errores).length) return { ok: false, errores };
    const poliza = normalizarPoliza(datos);
    if (poliza.id) {
      const i = this.polizas.findIndex((p) => p.id === poliza.id);
      if (i >= 0) this.polizas[i] = poliza;
      else this.polizas.push(poliza);
    } else {
      poliza.id = generarId();
      this.polizas.push(poliza);
    }
    await this.repo.guardar(this.polizas);
    return { ok: true, poliza };
  }

  async eliminarPoliza(id: string): Promise<void> {
    this.polizas = this.polizas.filter((p) => p.id !== id);
    await this.repo.guardar(this.polizas);
  }

  obtener(id: string): Poliza | null {
    return this.polizas.find((p) => p.id === id) ?? null;
  }

  async renovarUnAnio(id: string): Promise<void> {
    const p = this.obtener(id);
    if (!p) return;
    p.fechaVencimiento = sumarUnAnio(p.fechaVencimiento);
    await this.repo.guardar(this.polizas);
  }

  /** Copia de todas las pólizas, sin filtrar ni ordenar — para copias de seguridad. */
  todas(): Poliza[] {
    return [...this.polizas];
  }

  /** Sustituye toda la cartera (usado al restaurar una copia de seguridad). */
  async reemplazarTodo(polizas: Poliza[]): Promise<void> {
    this.polizas = polizas.map((p) => normalizarPoliza(p));
    await this.repo.guardar(this.polizas);
  }

  companiasEnUso(): string[] {
    return companiasEnUso(this.polizas);
  }

  porDia(fechaISO: string): Poliza[] {
    return polizasPorDia(this.polizas, fechaISO);
  }

  // ── Consultas ──

  listar(filtros: FiltrosPolizas = {}, hoy: string = hoyISO(), diasAviso: number = DIAS_AVISO_DEFECTO): Poliza[] {
    return filtrarPolizas(this.polizas, filtros, hoy, diasAviso);
  }

  estadisticas(hoy: string = hoyISO(), diasAviso: number = DIAS_AVISO_DEFECTO): EstadisticasCartera {
    return calcularEstadisticas(this.polizas, hoy, diasAviso);
  }

  avisos(hoy: string = hoyISO(), diasAviso: number = DIAS_AVISO_DEFECTO): AvisoRenovacion[] {
    return calcularAvisos(this.polizas, hoy, diasAviso);
  }

  agenda(hoy: string = hoyISO(), meses = 12): GrupoAgenda[] {
    return calcularAgenda(this.polizas, hoy, meses);
  }

  /**
   * Reprograma las notificaciones nativas de renovación para reflejar el
   * estado actual de la cartera. Se llama tras cualquier CRUD y al cambiar
   * `diasAviso` en el perfil. El puerto se pasa explícito (no inyectado en
   * el constructor) para no acoplar este servicio a que exista notificador.
   */
  async programarNotificaciones(
    notificador: Notificador,
    diasAviso: number = DIAS_AVISO_DEFECTO,
    hoy: string = hoyISO(),
  ): Promise<void> {
    await notificador.sincronizar(calcularProgramacionAvisos(this.polizas, diasAviso, hoy));
  }
}
