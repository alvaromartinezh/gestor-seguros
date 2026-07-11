import { beforeEach, describe, expect, it, vi } from 'vitest';
import { crearClienteSupabaseFalso } from './fakeSupabase';
import { RepositorioPolizasMemoria, RepositorioPerfilMemoria } from './fakes';
import { estadoConexion } from '../src/infraestructura/nube/estadoConexion';
import { filaAPoliza, polizaAFila } from '../src/infraestructura/nube/RepositorioPolizasSupabase';
import type { Poliza } from '../src/dominio';

const holder = vi.hoisted(() => ({ cliente: null as unknown }));

vi.mock('../src/infraestructura/nube/clienteSupabase', () => ({
  get supabase() {
    return holder.cliente;
  },
}));

// Los imports de los adaptadores deben ir DESPUÉS de vi.mock (hoisted por Vitest).
const { RepositorioPolizasSupabase } = await import('../src/infraestructura/nube/RepositorioPolizasSupabase');
const { RepositorioPerfilSupabase } = await import('../src/infraestructura/nube/RepositorioPerfilSupabase');

function poliza(datos: Partial<Poliza>): Poliza {
  return {
    id: 'pol-1',
    nombre: 'Ana García',
    telefono: '',
    email: '',
    dni: '',
    tipo: 'Hogar',
    compania: 'Mapfre',
    coche: '',
    matricula: '',
    fechaContratacion: '',
    fechaVencimiento: '2026-08-01',
    precio: 240,
    notas: '',
    demo: false,
    ...datos,
  };
}

beforeEach(() => {
  estadoConexion.sinConexion = false;
});

describe('mapeo fila <-> póliza', () => {
  it('conserva los datos en un ida y vuelta', () => {
    const p = poliza({});
    const fila = polizaAFila(p, 'user-1');
    expect(filaAPoliza(fila)).toEqual(p);
  });

  it('parsea el precio si Supabase lo devuelve como texto (columna numeric)', () => {
    const fila = polizaAFila(poliza({ precio: 199.5 }), 'user-1');
    expect(filaAPoliza({ ...fila, precio: '199.50' }).precio).toBe(199.5);
  });
});

describe('RepositorioPolizasSupabase', () => {
  it('migra automáticamente los datos locales si la nube está vacía', async () => {
    holder.cliente = crearClienteSupabaseFalso({ userId: 'user-1' });
    const cache = new RepositorioPolizasMemoria();
    await cache.guardar([poliza({ id: 'pol-local' })]);

    const repo = new RepositorioPolizasSupabase(cache);
    const cargadas = await repo.cargar();

    expect(cargadas).toHaveLength(1);
    expect(cargadas[0].id).toBe('pol-local');
    // Segunda carga: la nube ya no está vacía, no se debe volver a migrar.
    await cache.guardar([]); // vaciar la caché local para comprobar que no hace falta
    const segunda = await repo.cargar();
    expect(segunda).toHaveLength(1);
  });

  it('no migra si la nube ya tiene datos propios', async () => {
    const cliente = crearClienteSupabaseFalso({ userId: 'user-1' });
    cliente._tablas.polizas.push({ ...polizaAFilaTest(poliza({ id: 'pol-nube' })), user_id: 'user-1' });
    holder.cliente = cliente;

    const cache = new RepositorioPolizasMemoria();
    await cache.guardar([poliza({ id: 'pol-local-viejo' })]);

    const repo = new RepositorioPolizasSupabase(cache);
    const cargadas = await repo.cargar();

    expect(cargadas.map((p) => p.id)).toEqual(['pol-nube']);
  });

  it('si falla la red, devuelve la caché local y marca sin conexión', async () => {
    holder.cliente = crearClienteSupabaseFalso({ userId: 'user-1', fallaRed: true });
    const cache = new RepositorioPolizasMemoria();
    await cache.guardar([poliza({ id: 'pol-cacheada' })]);

    const repo = new RepositorioPolizasSupabase(cache);
    const cargadas = await repo.cargar();

    expect(cargadas.map((p) => p.id)).toEqual(['pol-cacheada']);
    expect(estadoConexion.sinConexion).toBe(true);
  });

  it('guardar() lanza y marca sin conexión si Supabase falla', async () => {
    holder.cliente = crearClienteSupabaseFalso({ userId: 'user-1', fallaRed: true });
    const repo = new RepositorioPolizasSupabase(new RepositorioPolizasMemoria());

    await expect(repo.guardar([poliza({})])).rejects.toBeTruthy();
    expect(estadoConexion.sinConexion).toBe(true);
  });

  it('guardar() borra en la nube las pólizas que ya no están en la lista', async () => {
    const cliente = crearClienteSupabaseFalso({ userId: 'user-1' });
    holder.cliente = cliente;
    const repo = new RepositorioPolizasSupabase(new RepositorioPolizasMemoria());

    await repo.guardar([poliza({ id: 'a' }), poliza({ id: 'b' })]);
    expect(cliente._tablas.polizas).toHaveLength(2);

    await repo.guardar([poliza({ id: 'a' })]);
    expect(cliente._tablas.polizas.map((f) => f.id)).toEqual(['a']);
  });
});

describe('RepositorioPerfilSupabase', () => {
  it('migra el perfil local si la nube no tiene ninguno', async () => {
    holder.cliente = crearClienteSupabaseFalso({ userId: 'user-1' });
    const cache = new RepositorioPerfilMemoria();
    await cache.guardar({ nombre: 'Antonio', foto: '', companias: ['Mapfre'], diasAviso: 30 });

    const repo = new RepositorioPerfilSupabase(cache);
    const perfil = await repo.cargar();

    expect(perfil?.nombre).toBe('Antonio');
  });
});

// Reutiliza el mapeo real para sembrar la tabla falsa en los tests.
function polizaAFilaTest(p: Poliza) {
  return polizaAFila(p, 'user-1');
}
