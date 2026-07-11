import { beforeEach, describe, expect, it } from 'vitest';
import {
  ServicioBackup,
  ServicioPerfil,
  ServicioPolizas,
  calcularAvisos,
  calcularEstadisticas,
  calcularProgramacionAvisos,
  filtrarPolizas,
} from '../src/aplicacion';
import { sumarDias, type Poliza } from '../src/dominio';
import { AlmacenBackupMemoria, RepositorioPerfilMemoria, RepositorioPolizasMemoria } from './fakes';

function poliza(datos: Partial<Poliza>): Poliza {
  return {
    id: null,
    nombre: 'Cliente',
    telefono: '',
    email: '',
    dni: '',
    tipo: 'Hogar',
    compania: 'Mapfre',
    coche: '',
    matricula: '',
    fechaContratacion: '',
    fechaVencimiento: '2026-08-01',
    precio: 100,
    notas: '',
    demo: false,
    ...datos,
  };
}

describe('ServicioPolizas — CRUD', () => {
  let servicio: ServicioPolizas;

  beforeEach(async () => {
    servicio = new ServicioPolizas(new RepositorioPolizasMemoria());
    await servicio.inicializar({ conDemo: false });
  });

  it('rechaza guardar datos inválidos sin tocar la cartera', async () => {
    const resultado = await servicio.guardarPoliza({ nombre: 'A' });
    expect(resultado.ok).toBe(false);
    expect(servicio.todas()).toHaveLength(0);
  });

  it('genera un id al crear una póliza nueva', async () => {
    const resultado = await servicio.guardarPoliza({
      nombre: 'Ana García',
      tipo: 'Hogar',
      compania: 'Mapfre',
      fechaVencimiento: '2026-08-01',
      precio: 240,
    });
    expect(resultado.ok).toBe(true);
    if (resultado.ok) expect(resultado.poliza.id).toBeTruthy();
    expect(servicio.todas()).toHaveLength(1);
  });

  it('edita una póliza existente en vez de duplicarla', async () => {
    const creada = await servicio.guardarPoliza({
      nombre: 'Ana García',
      tipo: 'Hogar',
      compania: 'Mapfre',
      fechaVencimiento: '2026-08-01',
      precio: 240,
    });
    if (!creada.ok) throw new Error('no debería fallar');
    await servicio.guardarPoliza({ ...creada.poliza, precio: 260 });
    expect(servicio.todas()).toHaveLength(1);
    expect(servicio.obtener(creada.poliza.id!)?.precio).toBe(260);
  });

  it('elimina una póliza por id', async () => {
    const creada = await servicio.guardarPoliza({
      nombre: 'Ana García',
      tipo: 'Hogar',
      compania: 'Mapfre',
      fechaVencimiento: '2026-08-01',
      precio: 240,
    });
    if (!creada.ok) throw new Error('no debería fallar');
    await servicio.eliminarPoliza(creada.poliza.id!);
    expect(servicio.todas()).toHaveLength(0);
  });

  it('renovarUnAnio suma un año a la fecha de vencimiento', async () => {
    const creada = await servicio.guardarPoliza({
      nombre: 'Ana García',
      tipo: 'Hogar',
      compania: 'Mapfre',
      fechaVencimiento: '2026-08-01',
      precio: 240,
    });
    if (!creada.ok) throw new Error('no debería fallar');
    await servicio.renovarUnAnio(creada.poliza.id!);
    expect(servicio.obtener(creada.poliza.id!)?.fechaVencimiento).toBe('2027-08-01');
  });

  it('inicializar siembra datos demo solo la primera vez', async () => {
    const repo = new RepositorioPolizasMemoria();
    const s1 = new ServicioPolizas(repo);
    const primeraCarga = await s1.inicializar({ conDemo: true });
    expect(primeraCarga.length).toBeGreaterThan(0);
    expect(s1.hayDatosDemo()).toBe(true);

    const s2 = new ServicioPolizas(repo);
    const segundaCarga = await s2.inicializar({ conDemo: true });
    expect(segundaCarga).toHaveLength(primeraCarga.length);
  });
});

describe('consultas puras sobre pólizas', () => {
  const cartera = [
    poliza({ id: '1', nombre: 'Ana García', compania: 'Mapfre', tipo: 'Hogar', fechaVencimiento: '2026-06-01' }),
    poliza({ id: '2', nombre: 'Luis Pérez', compania: 'AXA', tipo: 'Coche', fechaVencimiento: '2026-07-15' }),
    poliza({ id: '3', nombre: 'Marta Ruiz', compania: 'Mapfre', tipo: 'Vida', fechaVencimiento: '2026-12-01' }),
  ];
  const hoy = '2026-07-01';

  it('filtrarPolizas combina texto, compañía, tipo y estado', () => {
    expect(filtrarPolizas(cartera, { compania: 'Mapfre' }, hoy, 30)).toHaveLength(2);
    expect(filtrarPolizas(cartera, { texto: 'luis' }, hoy, 30)).toHaveLength(1);
    expect(filtrarPolizas(cartera, { estado: 'vencido' }, hoy, 30)).toHaveLength(1);
  });

  it('calcularEstadisticas agrega totales, prima y agrupaciones', () => {
    const stats = calcularEstadisticas(cartera, hoy, 30);
    expect(stats.total).toBe(3);
    expect(stats.vencidos).toBe(1);
    expect(stats.proximos).toBe(1);
    expect(stats.porCompania.find((c) => c.nombre === 'Mapfre')?.n).toBe(2);
  });

  it('calcularAvisos ordena por urgencia (más vencido primero)', () => {
    const avisos = calcularAvisos(cartera, hoy, 30);
    expect(avisos.map((a) => a.poliza.id)).toEqual(['1', '2']);
  });

  it('calcularProgramacionAvisos programa en (vencimiento - diasAviso), o mañana si ya pasó', () => {
    const programados = calcularProgramacionAvisos(cartera, 30, hoy);
    const manana = sumarDias(hoy, 1);
    // póliza '1' vence 2026-06-01: vencimiento-30 ya pasó respecto a hoy -> se clampa a mañana
    const paraUno = programados.find((p) => p.id === '1');
    expect(paraUno).toBeUndefined(); // ya vencida: no se programa recordatorio futuro
    const paraDos = programados.find((p) => p.id === '2'); // vence 2026-07-15, -30 días = 2026-06-15 (pasado) -> mañana
    expect(paraDos?.fechaISO).toBe(manana);
    const paraTres = programados.find((p) => p.id === '3'); // vence 2026-12-01, -30 días = 2026-11-01 (futuro)
    expect(paraTres?.fechaISO).toBe('2026-11-01');
  });
});

describe('ServicioPerfil', () => {
  it('usa el valor por defecto de días de aviso hasta que se guarda un perfil', async () => {
    const servicio = new ServicioPerfil(new RepositorioPerfilMemoria(), 30);
    await servicio.inicializar();
    expect(servicio.diasAviso()).toBe(30);
  });

  it('guarda y valida el perfil', async () => {
    const servicio = new ServicioPerfil(new RepositorioPerfilMemoria(), 30);
    const invalido = await servicio.guardar({ nombre: 'A' });
    expect(invalido.ok).toBe(false);

    const valido = await servicio.guardar({ nombre: 'Antonio Ruiz', companias: ['Mapfre'], diasAviso: 45 });
    expect(valido.ok).toBe(true);
    expect(servicio.diasAviso()).toBe(45);
  });
});

describe('ServicioBackup', () => {
  it('exporta e importa un snapshot completo (round-trip)', async () => {
    const repoPolizas = new RepositorioPolizasMemoria();
    const polizasSvc = new ServicioPolizas(repoPolizas);
    await polizasSvc.inicializar({ conDemo: false });
    await polizasSvc.guardarPoliza({
      nombre: 'Ana García',
      tipo: 'Hogar',
      compania: 'Mapfre',
      fechaVencimiento: '2026-08-01',
      precio: 240,
    });

    const perfilSvc = new ServicioPerfil(new RepositorioPerfilMemoria(), 30);
    await perfilSvc.guardar({ nombre: 'Antonio Ruiz', companias: ['Mapfre'], diasAviso: 20 });

    const almacen = new AlmacenBackupMemoria();
    const backup = new ServicioBackup(polizasSvc, perfilSvc, almacen);

    const exportado = await backup.exportar();
    expect(exportado.ok).toBe(true);

    // Simula pérdida de datos y restauración en un servicio nuevo.
    const polizasSvc2 = new ServicioPolizas(new RepositorioPolizasMemoria());
    await polizasSvc2.inicializar({ conDemo: false });
    const perfilSvc2 = new ServicioPerfil(new RepositorioPerfilMemoria(), 30);
    const backup2 = new ServicioBackup(polizasSvc2, perfilSvc2, almacen);

    const importado = await backup2.importar();
    expect(importado.ok).toBe(true);
    expect(polizasSvc2.todas()).toHaveLength(1);
    expect(polizasSvc2.todas()[0].nombre).toBe('Ana García');
  });

  it('rechaza un archivo con formato inválido', async () => {
    const almacen = new AlmacenBackupMemoria();
    almacen.archivo = '{"esto":"no es un backup"}';
    const polizasSvc = new ServicioPolizas(new RepositorioPolizasMemoria());
    await polizasSvc.inicializar({ conDemo: false });
    const perfilSvc = new ServicioPerfil(new RepositorioPerfilMemoria(), 30);
    const backup = new ServicioBackup(polizasSvc, perfilSvc, almacen);

    const resultado = await backup.importar();
    expect(resultado.ok).toBe(false);
  });
});
