import { describe, expect, it } from 'vitest';
import {
  ESTADO,
  diasEntre,
  estadoPoliza,
  formatPrecio,
  normalizarPoliza,
  parseFecha,
  sumarDias,
  sumarUnAnio,
  validarPerfil,
  validarPoliza,
} from '../src/dominio';

const polizaBase = {
  nombre: 'Ana García',
  tipo: 'Hogar',
  compania: 'Mapfre',
  fechaVencimiento: '2027-01-01',
  precio: 240,
};

describe('validarPoliza', () => {
  it('exige nombre, tipo, compañía y vencimiento', () => {
    const errores = validarPoliza({});
    expect(errores.nombre).toBeDefined();
    expect(errores.tipo).toBeDefined();
    expect(errores.compania).toBeDefined();
    expect(errores.fechaVencimiento).toBeDefined();
  });

  it('exige coche y matrícula solo para tipos de vehículo', () => {
    expect(validarPoliza({ ...polizaBase, tipo: 'Hogar' }).coche).toBeUndefined();
    const errores = validarPoliza({ ...polizaBase, tipo: 'Coche' });
    expect(errores.coche).toBeDefined();
    expect(errores.matricula).toBeDefined();
  });

  it('valida el formato de la matrícula', () => {
    const datos = { ...polizaBase, tipo: 'Coche', coche: 'Seat León', matricula: 'no-valida' };
    expect(validarPoliza(datos).matricula).toBeDefined();
    expect(validarPoliza({ ...datos, matricula: '1234 BCD' }).matricula).toBeUndefined();
  });

  it('exige que el vencimiento sea posterior a la contratación', () => {
    const errores = validarPoliza({
      ...polizaBase,
      fechaContratacion: '2027-01-01',
      fechaVencimiento: '2026-01-01',
    });
    expect(errores.fechaVencimiento).toBeDefined();
  });

  it('rechaza precios no positivos', () => {
    expect(validarPoliza({ ...polizaBase, precio: 0 }).precio).toBeDefined();
    expect(validarPoliza({ ...polizaBase, precio: -5 }).precio).toBeDefined();
    expect(validarPoliza({ ...polizaBase, precio: 100 }).precio).toBeUndefined();
  });

  it('valida email, teléfono y dni solo si se rellenan', () => {
    expect(validarPoliza({ ...polizaBase, email: 'no-es-un-email' }).email).toBeDefined();
    expect(validarPoliza({ ...polizaBase, email: 'cliente@correo.com' }).email).toBeUndefined();
    expect(validarPoliza({ ...polizaBase, dni: '12345678Z' }).dni).toBeUndefined();
    expect(validarPoliza({ ...polizaBase, dni: '1234' }).dni).toBeDefined();
  });
});

describe('normalizarPoliza', () => {
  it('limpia coche/matrícula si el tipo no es de vehículo', () => {
    const p = normalizarPoliza({ ...polizaBase, tipo: 'Hogar', coche: 'Seat León', matricula: '1234 bcd' });
    expect(p.coche).toBe('');
    expect(p.matricula).toBe('');
  });

  it('pone la matrícula y el dni en mayúsculas', () => {
    const p = normalizarPoliza({ ...polizaBase, tipo: 'Coche', coche: 'Seat León', matricula: '1234 bcd', dni: '12345678z' });
    expect(p.matricula).toBe('1234 BCD');
    expect(p.dni).toBe('12345678Z');
  });

  it('redondea el precio a dos decimales', () => {
    expect(normalizarPoliza({ ...polizaBase, precio: '199,999' }).precio).toBe(200);
  });
});

describe('validarPerfil', () => {
  it('exige nombre y al menos una compañía', () => {
    const errores = validarPerfil({});
    expect(errores.nombre).toBeDefined();
    expect(errores.companias).toBeDefined();
  });

  it('valida el rango de días de aviso', () => {
    expect(validarPerfil({ nombre: 'Ana', companias: ['Mapfre'], diasAviso: 0 }).diasAviso).toBeDefined();
    expect(validarPerfil({ nombre: 'Ana', companias: ['Mapfre'], diasAviso: 400 }).diasAviso).toBeDefined();
    expect(validarPerfil({ nombre: 'Ana', companias: ['Mapfre'], diasAviso: 45 }).diasAviso).toBeUndefined();
  });
});

describe('estadoPoliza', () => {
  it('clasifica vigente / próximo / vencido según diasAviso', () => {
    expect(estadoPoliza({ fechaVencimiento: '2026-08-01' }, '2026-07-01', 30)).toBe(ESTADO.VIGENTE);
    expect(estadoPoliza({ fechaVencimiento: '2026-07-20' }, '2026-07-01', 30)).toBe(ESTADO.PROXIMO);
    expect(estadoPoliza({ fechaVencimiento: '2026-06-01' }, '2026-07-01', 30)).toBe(ESTADO.VENCIDO);
  });

  it('respeta el límite exacto del plazo de aviso', () => {
    expect(estadoPoliza({ fechaVencimiento: '2026-07-31' }, '2026-07-01', 30)).toBe(ESTADO.PROXIMO);
    expect(estadoPoliza({ fechaVencimiento: '2026-08-01' }, '2026-07-01', 30)).toBe(ESTADO.VIGENTE);
  });
});

describe('utilidades de fecha', () => {
  it('parseFecha rechaza formatos inválidos', () => {
    expect(parseFecha('no-es-fecha')).toBeNull();
    expect(parseFecha('2026-13-40')).toBeNull();
    expect(parseFecha('2026-07-11')).not.toBeNull();
  });

  it('diasEntre calcula la diferencia en días naturales', () => {
    expect(diasEntre('2026-07-01', '2026-07-11')).toBe(10);
    expect(diasEntre('2026-07-11', '2026-07-01')).toBe(-10);
  });

  it('sumarUnAnio conserva mes y día', () => {
    expect(sumarUnAnio('2026-07-11')).toBe('2027-07-11');
  });

  it('sumarDias admite valores negativos', () => {
    expect(sumarDias('2026-07-11', -30)).toBe('2026-06-11');
    expect(sumarDias('2026-07-11', 30)).toBe('2026-08-10');
  });
});

describe('formatPrecio', () => {
  it('formatea en euros y usa un guion para valores no numéricos', () => {
    expect(formatPrecio(380)).toContain('380');
    expect(formatPrecio(NaN)).toBe('—');
    expect(formatPrecio(undefined)).toBe('—');
  });
});
