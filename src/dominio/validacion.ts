import type { DatosPerfil, DatosPoliza, Perfil, Poliza } from './entidades';
import { esTipoVehiculo } from './catalogos';
import { diasEntre, parseFecha } from './fechas';

export type Errores<T> = Partial<Record<keyof T, string>>;

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const RE_DNI = /^\d{8}[A-Za-z]$|^[XYZxyz]\d{7}[A-Za-z]$/;
const RE_TEL = /^[+\d][\d\s]{7,14}$/;
const RE_MATRICULA = /^\d{4}\s?[B-DF-HJ-NP-TV-Z]{3}$|^[A-Z]{1,2}\s?\d{4}\s?[A-Z]{1,2}$/i;

export function validarPoliza(d: DatosPoliza): Errores<Poliza> {
  const errores: Errores<Poliza> = {};
  if (!d.nombre || d.nombre.trim().length < 3) errores.nombre = 'Introduce el nombre del cliente';
  if (!d.tipo) errores.tipo = 'Selecciona el tipo de seguro';
  if (!d.compania) errores.compania = 'Selecciona la compañía';

  if (d.tipo && esTipoVehiculo(d.tipo)) {
    if (!d.coche || !d.coche.trim()) errores.coche = 'Indica marca y modelo del vehículo';
    if (!d.matricula || !d.matricula.trim()) errores.matricula = 'Introduce la matrícula';
    else if (!RE_MATRICULA.test(d.matricula.trim())) errores.matricula = 'Matrícula no válida (ej: 1234 BCD)';
  }

  if (!d.fechaVencimiento) errores.fechaVencimiento = 'Indica la fecha de vencimiento';
  else if (!parseFecha(d.fechaVencimiento)) errores.fechaVencimiento = 'Fecha no válida';

  if (d.fechaContratacion) {
    if (!parseFecha(d.fechaContratacion)) {
      errores.fechaContratacion = 'Fecha no válida';
    } else if (d.fechaVencimiento && parseFecha(d.fechaVencimiento)) {
      const dias = diasEntre(d.fechaContratacion, d.fechaVencimiento);
      if (dias !== null && dias <= 0) errores.fechaVencimiento = 'Debe ser posterior a la contratación';
    }
  }

  const precio = typeof d.precio === 'number' ? d.precio : parseFloat(String(d.precio ?? '').replace(',', '.'));
  if (!Number.isFinite(precio) || precio <= 0) errores.precio = 'Introduce un precio anual válido';

  if (d.telefono && !RE_TEL.test(d.telefono.trim())) errores.telefono = 'Teléfono no válido';
  if (d.email && !RE_EMAIL.test(d.email.trim())) errores.email = 'Email no válido';
  if (d.dni && !RE_DNI.test(d.dni.trim())) errores.dni = 'DNI/NIE no válido';

  return errores;
}

export function normalizarPoliza(d: DatosPoliza): Poliza {
  const precio = typeof d.precio === 'number' ? d.precio : parseFloat(String(d.precio ?? '').replace(',', '.'));
  const esVehiculo = !!d.tipo && esTipoVehiculo(d.tipo);
  return {
    id: d.id ?? null,
    nombre: (d.nombre ?? '').trim(),
    telefono: (d.telefono ?? '').trim(),
    email: (d.email ?? '').trim(),
    dni: (d.dni ?? '').trim().toUpperCase(),
    tipo: d.tipo ?? '',
    compania: d.compania ?? '',
    coche: esVehiculo ? (d.coche ?? '').trim() : '',
    matricula: esVehiculo ? (d.matricula ?? '').trim().toUpperCase() : '',
    fechaContratacion: d.fechaContratacion ?? '',
    fechaVencimiento: d.fechaVencimiento ?? '',
    precio: Math.round(precio * 100) / 100,
    notas: (d.notas ?? '').trim(),
    demo: !!d.demo,
  };
}

export function validarPerfil(p: DatosPerfil): Errores<Perfil> {
  const errores: Errores<Perfil> = {};
  if (!p.nombre || p.nombre.trim().length < 3) errores.nombre = 'Introduce tu nombre';
  if (!p.companias || p.companias.length === 0) errores.companias = 'Selecciona al menos una compañía';
  if (p.diasAviso !== undefined && (!Number.isFinite(p.diasAviso) || p.diasAviso < 1 || p.diasAviso > 365)) {
    errores.diasAviso = 'Indica un número de días entre 1 y 365';
  }
  return errores;
}

export function normalizarPerfil(p: DatosPerfil, diasAvisoDefecto: number): Perfil {
  return {
    nombre: (p.nombre ?? '').trim(),
    foto: p.foto ?? '',
    companias: [...new Set((p.companias ?? []).map((c) => c.trim()).filter(Boolean))],
    diasAviso: Number.isFinite(p.diasAviso) ? Number(p.diasAviso) : diasAvisoDefecto,
  };
}
