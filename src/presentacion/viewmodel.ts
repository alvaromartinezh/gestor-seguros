/**
 * Mapeos de presentación (color/etiqueta por estado, textos de resumen…).
 * No son reglas de negocio — solo deciden cómo se muestra un dato del
 * dominio, así que viven aquí y no en `dominio/` ni `aplicacion/`.
 */
import { ESTADO, esTipoVehiculo, type Estado, type Poliza } from '../dominio';

export function colorEstado(estado: Estado): string {
  if (estado === ESTADO.VIGENTE) return 'var(--color-vigente)';
  if (estado === ESTADO.PROXIMO) return 'var(--color-proximo)';
  return 'var(--color-vencido)';
}

export function fondoEstado(estado: Estado): string {
  if (estado === ESTADO.VIGENTE) return 'var(--color-vigente-bg)';
  if (estado === ESTADO.PROXIMO) return 'var(--color-proximo-bg)';
  return 'var(--color-vencido-bg)';
}

export function etiquetaEstado(estado: Estado): string {
  if (estado === ESTADO.VIGENTE) return 'Vigente';
  if (estado === ESTADO.PROXIMO) return 'Vence pronto';
  return 'Vencida';
}

export function subtituloPoliza(p: Poliza): string {
  if (esTipoVehiculo(p.tipo) && p.coche) return `${p.tipo} · ${p.coche}`;
  return p.tipo;
}

export function textoDias(dias: number): string {
  if (dias < 0) {
    const n = Math.abs(dias);
    return `Venció hace ${n} día${n === 1 ? '' : 's'}`;
  }
  if (dias === 0) return 'Vence hoy';
  if (dias === 1) return 'Vence mañana';
  return `Vence en ${dias} días`;
}
