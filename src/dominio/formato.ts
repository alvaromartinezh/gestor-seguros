const fmtEUR = new Intl.NumberFormat('es-ES', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function formatPrecio(n: number | null | undefined): string {
  return typeof n === 'number' && Number.isFinite(n) ? fmtEUR.format(n) : '—';
}
