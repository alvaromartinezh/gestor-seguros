/**
 * Doble mínimo del cliente de Supabase: solo implementa la forma exacta de
 * las llamadas que usan los adaptadores de infraestructura/nube (select con
 * eq/not/maybeSingle, upsert, delete, y auth.getSession). Suficiente para
 * probar la migración automática y el fallback sin conexión sin depender de
 * una red real.
 */
export function crearClienteSupabaseFalso(opts: { userId: string | null; fallaRed?: boolean }) {
  const tablas: Record<string, Record<string, unknown>[]> = { polizas: [], perfiles: [] };

  function builder(tabla: string) {
    let modo: 'select' | 'upsert' | 'delete' = 'select';
    let filtroUserId: string | null = null;
    let excluirIds: string[] | null = null;
    let single = false;
    let payload: Record<string, unknown>[] = [];

    const api = {
      select() {
        modo = 'select';
        return api;
      },
      upsert(filas: Record<string, unknown> | Record<string, unknown>[]) {
        modo = 'upsert';
        payload = Array.isArray(filas) ? filas : [filas];
        return api;
      },
      delete() {
        modo = 'delete';
        return api;
      },
      eq(campo: string, valor: string) {
        if (campo === 'user_id') filtroUserId = valor;
        return api;
      },
      not(_campo: string, _op: string, valor: string) {
        excluirIds = valor
          .replace(/[()"]/g, '')
          .split(',')
          .filter(Boolean);
        return api;
      },
      maybeSingle() {
        single = true;
        return api;
      },
      then(resolve: (r: { data: unknown; error: unknown }) => void) {
        if (opts.fallaRed) {
          resolve({ data: null, error: { message: 'network error' } });
          return;
        }
        if (modo === 'select') {
          const filas = tablas[tabla].filter((f) => f.user_id === filtroUserId);
          resolve({ data: single ? (filas[0] ?? null) : filas, error: null });
        } else if (modo === 'upsert') {
          for (const fila of payload) {
            const i = tablas[tabla].findIndex((f) =>
              tabla === 'perfiles' ? f.user_id === fila.user_id : f.id === fila.id && f.user_id === fila.user_id,
            );
            if (i >= 0) tablas[tabla][i] = fila;
            else tablas[tabla].push(fila);
          }
          resolve({ data: payload, error: null });
        } else {
          tablas[tabla] = tablas[tabla].filter((f) => {
            if (f.user_id !== filtroUserId) return true;
            if (!excluirIds) return false;
            return excluirIds.includes(f.id as string);
          });
          resolve({ data: null, error: null });
        }
      },
    };
    return api;
  }

  return {
    _tablas: tablas,
    auth: {
      getSession: async () => {
        const sesion = opts.userId ? { user: { id: opts.userId, email: 'padre@ejemplo.com' } } : null;
        return { data: { session: sesion } };
      },
    },
    from: builder,
  };
}
