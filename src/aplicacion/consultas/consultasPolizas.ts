/**
 * Consultas puras sobre una lista de pólizas: sin I/O, sin estado propio.
 * Se extraen de `ServicioPolizas` para que tanto el propio servicio (tests,
 * contextos no reactivos) como el store de presentación de Svelte (que
 * necesita leer el array reactivo directamente para que sus `$derived`
 * detecten cambios) compartan una única implementación de cada regla.
 */
import {
  DIAS_AVISO_DEFECTO,
  diasHastaVencimiento,
  estadoPoliza,
  ESTADO,
  formatFecha,
  hoyISO,
  nombreMes,
  parseFecha,
  sumarDias,
  type Poliza,
} from '../../dominio';
import type { AvisoProgramable } from '../puertos/Notificador';

export interface FiltrosPolizas {
  texto?: string;
  compania?: string;
  tipo?: string;
  estado?: string;
}

export interface EstadisticasCartera {
  total: number;
  primaTotal: number;
  proximos: number;
  vencidos: number;
  porCompania: { nombre: string; n: number }[];
  porTipo: { nombre: string; n: number }[];
}

export interface AvisoRenovacion {
  poliza: Poliza;
  dias: number;
}

export interface GrupoAgenda {
  anio: number;
  mes: number;
  titulo: string;
  items: Poliza[];
}

export function filtrarPolizas(
  polizas: Poliza[],
  { texto = '', compania = '', tipo = '', estado = '' }: FiltrosPolizas = {},
  hoy: string = hoyISO(),
  diasAviso: number = DIAS_AVISO_DEFECTO,
): Poliza[] {
  const t = texto.trim().toLowerCase();
  return polizas
    .filter((p) => {
      if (compania && p.compania !== compania) return false;
      if (tipo && p.tipo !== tipo) return false;
      if (estado && estadoPoliza(p, hoy, diasAviso) !== estado) return false;
      if (t) {
        const blob = `${p.nombre} ${p.coche} ${p.matricula} ${p.compania} ${p.tipo} ${p.dni}`.toLowerCase();
        if (!blob.includes(t)) return false;
      }
      return true;
    })
    .sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));
}

export function calcularEstadisticas(
  polizas: Poliza[],
  hoy: string = hoyISO(),
  diasAviso: number = DIAS_AVISO_DEFECTO,
): EstadisticasCartera {
  const total = polizas.length;
  let primaTotal = 0;
  let proximos = 0;
  let vencidos = 0;
  const porCompania = new Map<string, number>();
  const porTipo = new Map<string, number>();
  for (const p of polizas) {
    primaTotal += p.precio || 0;
    const est = estadoPoliza(p, hoy, diasAviso);
    if (est === ESTADO.PROXIMO) proximos++;
    if (est === ESTADO.VENCIDO) vencidos++;
    porCompania.set(p.compania, (porCompania.get(p.compania) ?? 0) + 1);
    porTipo.set(p.tipo, (porTipo.get(p.tipo) ?? 0) + 1);
  }
  const aLista = (m: Map<string, number>) =>
    [...m.entries()].map(([nombre, n]) => ({ nombre, n })).sort((a, b) => b.n - a.n);
  return { total, primaTotal, proximos, vencidos, porCompania: aLista(porCompania), porTipo: aLista(porTipo) };
}

/** Pólizas que vencen dentro del plazo de aviso (o ya vencidas). */
export function calcularAvisos(
  polizas: Poliza[],
  hoy: string = hoyISO(),
  diasAviso: number = DIAS_AVISO_DEFECTO,
): AvisoRenovacion[] {
  return polizas
    .map((p) => ({ poliza: p, dias: diasHastaVencimiento(p, hoy) }))
    .filter((a): a is AvisoRenovacion => a.dias !== null && a.dias <= diasAviso)
    .sort((a, b) => a.dias - b.dias);
}

/** Vencimientos agrupados por mes, próximos `meses` meses. */
export function calcularAgenda(polizas: Poliza[], hoy: string = hoyISO(), meses = 12): GrupoAgenda[] {
  const inicio = parseFecha(hoy);
  if (!inicio) return [];
  const grupos: GrupoAgenda[] = [];
  for (let i = 0; i < meses; i++) {
    const f = new Date(inicio.getFullYear(), inicio.getMonth() + i, 1);
    const anio = f.getFullYear();
    const mes = f.getMonth();
    const items = polizas
      .filter((p) => {
        const v = parseFecha(p.fechaVencimiento);
        return v && v.getFullYear() === anio && v.getMonth() === mes && (i > 0 || v.getDate() >= inicio.getDate() - 31);
      })
      .sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));
    grupos.push({ anio, mes, titulo: nombreMes(anio, mes), items });
  }
  return grupos;
}

export function polizasPorDia(polizas: Poliza[], fechaISO: string): Poliza[] {
  return polizas.filter((p) => p.fechaVencimiento === fechaISO).sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export function companiasEnUso(polizas: Poliza[]): string[] {
  return [...new Set(polizas.map((p) => p.compania).filter(Boolean))];
}

/**
 * Traduce la cartera a avisos programables: uno por póliza no vencida, en
 * (fechaVencimiento - diasAviso), o mañana si esa fecha ya ha pasado — así
 * una póliza que entra en el plazo de aviso siempre genera una notificación
 * futura en vez de disparar una en el pasado (que algunas plataformas
 * ignoran) o reenviarse en bucle cada vez que se sincroniza.
 */
export function calcularProgramacionAvisos(
  polizas: Poliza[],
  diasAviso: number = DIAS_AVISO_DEFECTO,
  hoy: string = hoyISO(),
): AvisoProgramable[] {
  const manana = sumarDias(hoy, 1);
  return polizas
    .map((p) => ({ poliza: p, dias: diasHastaVencimiento(p, hoy) }))
    .filter((a): a is { poliza: Poliza; dias: number } => a.dias !== null && a.dias > 0 && !!a.poliza.id)
    .map((a) => {
      const fechaObjetivo = sumarDias(a.poliza.fechaVencimiento, -diasAviso);
      const fechaISO = fechaObjetivo < manana ? manana : fechaObjetivo;
      return {
        id: a.poliza.id as string,
        titulo: `Renovación: ${a.poliza.nombre}`,
        cuerpo: `${a.poliza.tipo} · ${a.poliza.compania} vence el ${formatFecha(a.poliza.fechaVencimiento)}.`,
        fechaISO,
      };
    });
}
