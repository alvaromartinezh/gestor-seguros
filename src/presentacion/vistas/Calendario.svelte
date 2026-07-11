<script lang="ts">
  import { store } from '../estado/store.svelte';
  import { estadoPoliza, formatPrecio, hoyISO, nombreMes, parseFecha, type Poliza } from '../../dominio';
  import { colorEstado, fondoEstado, subtituloPoliza } from '../viewmodel';

  type Modo = 'mes' | 'semana' | 'dia';
  const MODOS: { id: Modo; etiqueta: string }[] = [
    { id: 'mes', etiqueta: 'Mes' },
    { id: 'semana', etiqueta: 'Semana' },
    { id: 'dia', etiqueta: 'Día' },
  ];
  const DIAS_CABECERA = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

  let modo = $state<Modo>('mes');
  let fechaRef = $state(hoyISO());

  const hoy = hoyISO();

  function aISO(f: Date): string {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${f.getFullYear()}-${p(f.getMonth() + 1)}-${p(f.getDate())}`;
  }

  function inicioSemana(f: Date): Date {
    const offset = (f.getDay() + 6) % 7; // 0 = lunes
    const d = new Date(f);
    d.setDate(d.getDate() - offset);
    return d;
  }

  function anterior() {
    const f = parseFecha(fechaRef)!;
    if (modo === 'mes') f.setMonth(f.getMonth() - 1);
    else if (modo === 'semana') f.setDate(f.getDate() - 7);
    else f.setDate(f.getDate() - 1);
    fechaRef = aISO(f);
  }

  function siguiente() {
    const f = parseFecha(fechaRef)!;
    if (modo === 'mes') f.setMonth(f.getMonth() + 1);
    else if (modo === 'semana') f.setDate(f.getDate() + 7);
    else f.setDate(f.getDate() + 1);
    fechaRef = aISO(f);
  }

  function irAHoy() {
    fechaRef = hoy;
  }

  function abrirDia(fecha: string) {
    fechaRef = fecha;
    modo = 'dia';
  }

  const titulo = $derived.by(() => {
    const f = parseFecha(fechaRef)!;
    if (modo === 'mes') return nombreMes(f.getFullYear(), f.getMonth());
    if (modo === 'dia') return f.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const ini = inicioSemana(f);
    const fin = new Date(ini);
    fin.setDate(fin.getDate() + 6);
    return `${ini.getDate()} ${MES_CORTO(ini)} – ${fin.getDate()} ${MES_CORTO(fin)} ${fin.getFullYear()}`;
  });

  function MES_CORTO(f: Date): string {
    return f.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '');
  }

  // ── Celdas del mes ──
  const celdasMes = $derived.by(() => {
    if (modo !== 'mes') return [];
    const ref = parseFecha(fechaRef)!;
    const primerDia = new Date(ref.getFullYear(), ref.getMonth(), 1);
    const inicio = inicioSemana(primerDia);
    const celdas: {
      fecha: string;
      dia: number;
      esOtroMes: boolean;
      esHoy: boolean;
      chips: { id: string; nombre: string; color: string; bg: string }[];
      mas: number;
    }[] = [];
    for (let i = 0; i < 42; i++) {
      const f = new Date(inicio);
      f.setDate(f.getDate() + i);
      const iso = aISO(f);
      const items = store.polizasPorDia(iso);
      const chips = items.slice(0, 3).map((p) => {
        const est = estadoPoliza(p, hoy, store.diasAviso);
        return { id: p.id!, nombre: p.nombre, color: colorEstado(est), bg: fondoEstado(est) };
      });
      celdas.push({
        fecha: iso,
        dia: f.getDate(),
        esOtroMes: f.getMonth() !== ref.getMonth(),
        esHoy: iso === hoy,
        chips,
        mas: Math.max(0, items.length - 3),
      });
    }
    return celdas;
  });

  // ── Columnas de la semana ──
  const columnasSemana = $derived.by(() => {
    if (modo !== 'semana') return [];
    const ref = parseFecha(fechaRef)!;
    const inicio = inicioSemana(ref);
    const cols: { fecha: string; sem: string; dia: number; esHoy: boolean; items: Poliza[] }[] = [];
    for (let i = 0; i < 7; i++) {
      const f = new Date(inicio);
      f.setDate(f.getDate() + i);
      const iso = aISO(f);
      cols.push({
        fecha: iso,
        sem: DIAS_CABECERA[i],
        dia: f.getDate(),
        esHoy: iso === hoy,
        items: store.polizasPorDia(iso),
      });
    }
    return cols;
  });

  const itemsDia = $derived(modo === 'dia' ? store.polizasPorDia(fechaRef) : []);

  const agenda = $derived(store.agendaMeses);
</script>

<div style="max-width:960px; margin:0 auto; animation:fadeIn 0.25s ease;">
  <div style="display:flex; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:16px;">
    <h1 style="margin:0; font-family:var(--fuente-titulares); font-size:31px; font-weight:400;">Calendario</h1>
    <div style="display:flex; gap:4px; margin-left:auto; background:#e9e1d0; border-radius:999px; padding:3px;">
      {#each MODOS as m (m.id)}
        <button
          onclick={() => (modo = m.id)}
          class="tab-modo"
          class:activo={modo === m.id}
          style="border:none; background:none; border-radius:999px; padding:7px 16px; font-size:13px; font-weight:600; cursor:pointer;"
        >
          {m.etiqueta}
        </button>
      {/each}
    </div>
  </div>

  <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
    <button onclick={anterior} class="boton-nav" style="border:1px solid var(--color-borde-input); background:var(--color-superficie); border-radius:999px; width:40px; min-height:40px; font-size:16px; cursor:pointer; color:var(--color-texto-chip);">‹</button>
    <button onclick={siguiente} class="boton-nav" style="border:1px solid var(--color-borde-input); background:var(--color-superficie); border-radius:999px; width:40px; min-height:40px; font-size:16px; cursor:pointer; color:var(--color-texto-chip);">›</button>
    <button onclick={irAHoy} class="boton-nav" style="border:1px solid var(--color-borde-input); background:var(--color-superficie); border-radius:999px; padding:0 16px; min-height:40px; font-size:13px; font-weight:600; cursor:pointer; color:var(--color-texto-chip);">Hoy</button>
    <h2 style="margin:0 0 0 6px; font-family:var(--fuente-titulares); font-size:21px; font-weight:400; text-transform:capitalize;">{titulo}</h2>
  </div>

  {#if modo === 'mes'}
    <div style="background:var(--color-superficie); border:1px solid var(--color-borde); border-radius:var(--radio-tarjeta); overflow:hidden;">
      <div style="display:grid; grid-template-columns:repeat(7, 1fr); border-bottom:1px solid var(--color-borde);">
        {#each DIAS_CABECERA as d (d)}
          <div style="padding:9px 4px; text-align:center; font-size:11px; font-weight:700; color:var(--color-texto-tenue); text-transform:uppercase; letter-spacing:0.07em;">{d}</div>
        {/each}
      </div>
      <div style="display:grid; grid-template-columns:repeat(7, 1fr);">
        {#each celdasMes as c (c.fecha)}
          <div
            role="button"
            tabindex="0"
            onclick={() => abrirDia(c.fecha)}
            onkeydown={(e) => e.key === 'Enter' && abrirDia(c.fecha)}
            class="celda-mes"
            style="min-height:88px; padding:6px; border-right:1px solid #f0eadd; border-bottom:1px solid #f0eadd; cursor:pointer; opacity:{c.esOtroMes ? 0.45 : 1};"
          >
            <span style="display:inline-flex; align-items:center; justify-content:center; width:22px; height:22px; border-radius:50%; font-size:12.5px; font-weight:600; background:{c.esHoy ? 'var(--color-tinta)' : 'transparent'}; color:{c.esHoy ? 'var(--color-texto-invertido)' : 'var(--color-texto)'};">{c.dia}</span>
            {#each c.chips as ch (ch.id)}
              <button
                onclick={(e) => {
                  e.stopPropagation();
                  store.abrirEditar(ch.id);
                }}
                title={ch.nombre}
                style="display:block; width:100%; text-align:left; border:none; border-radius:6px; padding:2px 6px; margin-top:2px; font-size:10.5px; font-weight:600; cursor:pointer; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; color:{ch.color}; background:{ch.bg};"
              >
                {ch.nombre}
              </button>
            {/each}
            {#if c.mas}
              <span style="display:block; font-size:10px; color:var(--color-texto-tenue); font-weight:600; margin-top:2px; padding-left:6px;">+{c.mas} más</span>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  {:else if modo === 'semana'}
    <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:8px;">
      {#each columnasSemana as col (col.fecha)}
        <button
          onclick={() => abrirDia(col.fecha)}
          class="columna-semana"
          style="background:var(--color-superficie); border:1px solid var(--color-borde); border-radius:12px; padding:10px 8px; text-align:left; cursor:pointer; min-height:140px;"
        >
          <div style="text-align:center; padding-bottom:6px; border-bottom:1px solid #efe8d8; margin-bottom:6px;">
            <div style="font-size:10.5px; font-weight:700; color:var(--color-texto-tenue); text-transform:uppercase; letter-spacing:0.07em;">{col.sem}</div>
            <div style="font-family:var(--fuente-titulares); font-size:21px; color:{col.esHoy ? 'var(--color-acento)' : 'var(--color-texto)'};">{col.dia}</div>
          </div>
          {#each col.items as p (p.id)}
            {@const est = estadoPoliza(p, hoy, store.diasAviso)}
            <div style="border-radius:8px; padding:5px 8px; margin-bottom:4px; font-size:11.5px; font-weight:600; color:{colorEstado(est)}; background:{fondoEstado(est)}; line-height:1.3;">
              {p.nombre}
              <span style="display:block; font-weight:500; font-size:10.5px; opacity:0.8;">{subtituloPoliza(p)}</span>
            </div>
          {/each}
        </button>
      {/each}
    </div>
  {:else}
    <div style="background:var(--color-superficie); border:1px solid var(--color-borde); border-radius:var(--radio-tarjeta); padding:16px 18px;">
      {#if !itemsDia.length}
        <div style="padding:30px 10px; text-align:center; color:var(--color-texto-tenue); font-size:14px;">No vence ningún seguro este día.</div>
      {/if}
      <div style="display:flex; flex-direction:column;">
        {#each itemsDia as p (p.id)}
          {@const est = estadoPoliza(p, hoy, store.diasAviso)}
          <button
            onclick={() => store.abrirEditar(p.id!)}
            class="fila-dia"
            style="display:flex; align-items:center; gap:12px; background:none; border:none; border-bottom:1px solid #f0eadd; padding:11px 4px; cursor:pointer; text-align:left; width:100%;"
          >
            <span style="width:8px; height:8px; border-radius:50%; background:{colorEstado(est)}; flex-shrink:0;"></span>
            <span style="flex:1; min-width:0;">
              <span style="display:block; font-size:15px; font-weight:600;">{p.nombre}</span>
              <span style="display:block; font-size:12.5px; color:var(--color-texto-tenue);">{subtituloPoliza(p)} · {p.compania}</span>
            </span>
            <span style="font-size:14px; font-weight:700;">{formatPrecio(p.precio)}</span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  <h2 style="margin:30px 0 4px; font-family:var(--fuente-titulares); font-size:23px; font-weight:400;">Agenda de vencimientos</h2>
  <p style="margin:0 0 16px; font-size:13px; color:var(--color-texto-tenue);">Próximos 12 meses de un vistazo.</p>

  {#each agenda as mes (mes.anio + '-' + mes.mes)}
    {#if mes.items.length}
      <section style="margin-bottom:22px;">
        <div style="display:flex; align-items:baseline; gap:10px; padding-bottom:6px; border-bottom:2px solid var(--color-tinta); margin-bottom:8px;">
          <h3 style="margin:0; font-family:var(--fuente-titulares); font-size:17px; font-weight:400;">{mes.titulo}</h3>
          <span style="font-size:12.5px; color:var(--color-texto-tenue);">{mes.items.length} póliza{mes.items.length === 1 ? '' : 's'}</span>
        </div>
        <div style="display:flex; flex-direction:column;">
          {#each mes.items as it (it.id)}
            {@const est = estadoPoliza(it, hoy, store.diasAviso)}
            {@const f = parseFecha(it.fechaVencimiento)}
            <button
              onclick={() => store.abrirEditar(it.id!)}
              class="fila-agenda"
              style="display:flex; align-items:center; gap:14px; background:none; border:none; border-bottom:1px solid #ece5d5; padding:10px 4px; cursor:pointer; text-align:left; width:100%;"
            >
              <span style="width:44px; flex-shrink:0; text-align:center;">
                <span style="display:block; font-family:var(--fuente-titulares); font-size:21px; line-height:1; color:{colorEstado(est)};">{f?.getDate() ?? ''}</span>
                <span style="display:block; font-size:10.5px; color:var(--color-texto-tenue); text-transform:uppercase; letter-spacing:0.07em;">{DIAS_CABECERA[((f?.getDay() ?? 1) + 6) % 7]}</span>
              </span>
              <span style="flex:1; min-width:0;">
                <span style="display:block; font-size:14.5px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{it.nombre}</span>
                <span style="display:block; font-size:12.5px; color:var(--color-texto-tenue);">{subtituloPoliza(it)} · {it.compania}</span>
              </span>
              <span style="font-size:13.5px; font-weight:700; white-space:nowrap;">{formatPrecio(it.precio)}</span>
            </button>
          {/each}
        </div>
      </section>
    {/if}
  {/each}
  {#if !agenda.some((m) => m.items.length)}
    <div style="background:var(--color-superficie); border:1px dashed var(--color-borde-input); border-radius:var(--radio-tarjeta); padding:40px 20px; text-align:center; color:var(--color-texto-tenue); font-size:14px;">
      No hay vencimientos en los próximos meses.
    </div>
  {/if}
</div>

<style>
  .tab-modo.activo {
    background: var(--color-superficie);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }
  .boton-nav:hover {
    background: var(--color-hover-fila);
  }
  .celda-mes:hover {
    background: var(--color-hover-fila);
  }
  .columna-semana:hover {
    border-color: var(--color-acento);
  }
  .fila-dia:hover,
  .fila-agenda:hover {
    background: var(--color-hover-fila-2);
  }
</style>
