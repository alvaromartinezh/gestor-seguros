/**
 * Catálogos de negocio: semillas editables, no literales dispersos por la UI.
 * `COMPANIAS_SUGERIDAS` es solo un punto de partida — el agente añade y
 * quita compañías propias desde su Perfil (ver aplicacion/casos-uso/ServicioPerfil).
 */

export const COMPANIAS_SUGERIDAS: readonly string[] = [
  'Mapfre',
  'AXA',
  'Allianz',
  'Mutua Madrileña',
  'Línea Directa',
  'Zurich',
  'Generali',
  'Catalana Occidente',
  'Reale',
  'Pelayo',
  'Soliss',
];

export const TIPOS_SEGURO: readonly string[] = [
  'Coche',
  'Moto',
  'Furgoneta',
  'Hogar',
  'Vida',
  'Salud',
  'Decesos',
  'Comercio',
  'Responsabilidad Civil',
  'Viaje',
];

export const TIPOS_VEHICULO: readonly string[] = ['Coche', 'Moto', 'Furgoneta'];

export const DIAS_AVISO_DEFECTO = 30;

export function esTipoVehiculo(tipo: string): boolean {
  return TIPOS_VEHICULO.includes(tipo);
}
