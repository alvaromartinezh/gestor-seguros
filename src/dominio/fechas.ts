/**
 * Utilidades de fecha del dominio. Siempre 'YYYY-MM-DD' como representación
 * canónica (sin hora, sin zona horaria) para evitar bugs de huso horario al
 * comparar vencimientos.
 */

const MESES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGO = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];
const DIAS_SEMANA = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

export function parseFecha(str: string | null | undefined): Date | null {
  if (!str || !/^\d{4}-\d{2}-\d{2}$/.test(str)) return null;
  const [a, m, d] = str.split('-').map(Number);
  const fecha = new Date(a, m - 1, d);
  // `Date` normaliza valores fuera de rango (p.ej. día 40) en vez de
  // rechazarlos: si al reconstruir la fecha no obtenemos los mismos
  // componentes, es que no era una fecha real.
  if (fecha.getFullYear() !== a || fecha.getMonth() !== m - 1 || fecha.getDate() !== d) return null;
  return fecha;
}

export function hoyISO(hoy: Date = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${hoy.getFullYear()}-${p(hoy.getMonth() + 1)}-${p(hoy.getDate())}`;
}

export function diasEntre(desdeISO: string, hastaISO: string): number | null {
  const a = parseFecha(desdeISO);
  const b = parseFecha(hastaISO);
  if (!a || !b) return null;
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function formatFecha(iso: string | null | undefined): string {
  const f = parseFecha(iso);
  if (!f) return '—';
  return `${f.getDate()} ${MESES_CORTO[f.getMonth()]} ${f.getFullYear()}`;
}

export function nombreMes(anio: number, mes: number): string {
  const n = MESES_LARGO[mes];
  return n.charAt(0).toUpperCase() + n.slice(1) + ' ' + anio;
}

export function diaSemana(iso: string): string {
  const f = parseFecha(iso);
  return f ? DIAS_SEMANA[f.getDay()] : '';
}

export const NOMBRES_DIA_SEMANA = DIAS_SEMANA;

export function sumarUnAnio(iso: string): string {
  const f = parseFecha(iso);
  if (!f) return iso;
  f.setFullYear(f.getFullYear() + 1);
  return hoyISO(f);
}

export function sumarDias(iso: string, dias: number): string {
  const f = parseFecha(iso);
  if (!f) return iso;
  f.setDate(f.getDate() + dias);
  return hoyISO(f);
}
