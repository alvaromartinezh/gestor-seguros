import type { Poliza } from './entidades';
import { diasEntre, hoyISO } from './fechas';

export const ESTADO = {
  VIGENTE: 'vigente',
  PROXIMO: 'proximo', // vence dentro del plazo de aviso configurado en el perfil
  VENCIDO: 'vencido',
} as const;

export type Estado = (typeof ESTADO)[keyof typeof ESTADO];

/**
 * `diasAviso` es siempre un parámetro explícito, nunca una constante fija:
 * el agente lo configura en su Perfil (ver aplicacion/casos-uso/ServicioPerfil).
 */
export function estadoPoliza(poliza: Pick<Poliza, 'fechaVencimiento'>, hoy: string, diasAviso: number): Estado {
  const dias = diasEntre(hoy, poliza.fechaVencimiento);
  if (dias === null) return ESTADO.VIGENTE;
  if (dias < 0) return ESTADO.VENCIDO;
  if (dias <= diasAviso) return ESTADO.PROXIMO;
  return ESTADO.VIGENTE;
}

export function diasHastaVencimiento(poliza: Pick<Poliza, 'fechaVencimiento'>, hoy: string = hoyISO()): number | null {
  return diasEntre(hoy, poliza.fechaVencimiento);
}
