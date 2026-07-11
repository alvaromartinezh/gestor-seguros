<script lang="ts">
  import { store } from '../estado/store.svelte';
  import { formatPrecio } from '../../dominio';
  import { colorEstado, subtituloPoliza, textoDias } from '../viewmodel';
  import { ESTADO, estadoPoliza, hoyISO } from '../../dominio';
  import StatCard from '../componentes/StatCard.svelte';

  const saludo = $derived(store.perfil?.nombre ? `Hola, ${store.perfil.nombre.split(' ')[0]}` : 'Tu cartera de seguros');

  const stats = $derived(store.estadisticasCartera);

  const companiasBars = $derived(
    stats.porCompania.slice(0, 6).map((c) => ({
      ...c,
      pct: stats.porCompania[0]?.n ? `${Math.max(6, Math.round((c.n / stats.porCompania[0].n) * 100))}%` : '0%',
    })),
  );

  const proximos = $derived(store.avisosRenovacion.slice(0, 5));
</script>

<div style="max-width:1060px; margin:0 auto; animation:fadeIn 0.25s ease;">
  <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:22px;">
    <h1 style="margin:0; font-family:var(--fuente-titulares); font-size:31px; font-weight:400;">{saludo}</h1>
    <button
      onclick={() => store.abrirNueva()}
      class="boton-nueva"
      style="margin-left:auto; background:var(--color-tinta); color:var(--color-texto-invertido); border:none; border-radius:var(--radio-pill); padding:11px 20px; font-size:14px; font-weight:600; cursor:pointer; min-height:var(--altura-tactil-min);"
    >
      + Nueva póliza
    </button>
  </div>

  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:12px; margin-bottom:22px;">
    <StatCard etiqueta="Seguros totales" valor={stats.total} />
    <StatCard etiqueta="Prima anual" valor={formatPrecio(stats.primaTotal)} />
    <StatCard
      etiqueta={`Vencen en ${store.diasAviso} días`}
      valor={stats.proximos}
      color="var(--color-proximo)"
      onclick={() => store.irFiltroEstado(ESTADO.PROXIMO)}
    />
    <StatCard etiqueta="Vencidas" valor={stats.vencidos} color="var(--color-vencido)" onclick={() => store.irFiltroEstado(ESTADO.VENCIDO)} />
  </div>

  <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(300px, 1fr)); gap:14px;">
    <section style="background:var(--color-superficie); border:1px solid var(--color-borde); border-radius:var(--radio-tarjeta); padding:20px;">
      <h2 style="margin:0 0 14px; font-family:var(--fuente-titulares); font-size:19px; font-weight:400;">Pólizas por compañía</h2>
      {#if !companiasBars.length}
        <p style="margin:0; font-size:13px; color:var(--color-texto-tenue);">Todavía no hay pólizas.</p>
      {/if}
      <div style="display:flex; flex-direction:column; gap:8px;">
        {#each companiasBars as c (c.nombre)}
          <button
            onclick={() => store.irFiltroCompania(c.nombre)}
            class="fila-compania"
            style="display:grid; grid-template-columns:130px 1fr 28px; align-items:center; gap:10px; background:none; border:none; padding:4px 2px; cursor:pointer; text-align:left; border-radius:8px;"
          >
            <span style="font-size:13px; font-weight:500; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{c.nombre}</span>
            <span style="height:7px; background:#ece5d5; border-radius:99px; overflow:hidden; display:block;">
              <span style="display:block; height:100%; border-radius:99px; background:var(--color-acento); width:{c.pct};"></span>
            </span>
            <span style="font-size:13px; font-weight:700; text-align:right;">{c.n}</span>
          </button>
        {/each}
      </div>
    </section>

    <section style="background:var(--color-superficie); border:1px solid var(--color-borde); border-radius:var(--radio-tarjeta); padding:20px;">
      <div style="display:flex; align-items:baseline; gap:10px; margin-bottom:14px;">
        <h2 style="margin:0; font-family:var(--fuente-titulares); font-size:19px; font-weight:400;">Próximos vencimientos</h2>
        <button
          onclick={() => store.cambiarVista('calendario')}
          class="ver-calendario"
          style="margin-left:auto; background:none; border:none; color:var(--color-acento); font-size:13px; font-weight:600; cursor:pointer; padding:4px;"
        >
          Ver calendario
        </button>
      </div>
      {#if !proximos.length}
        <p style="margin:0; font-size:13px; color:var(--color-texto-tenue);">Todo al día, sin renovaciones pendientes.</p>
      {/if}
      <div style="display:flex; flex-direction:column; gap:2px;">
        {#each proximos as a (a.poliza.id)}
          {@const estado = estadoPoliza(a.poliza, hoyISO(), store.diasAviso)}
          <button
            onclick={() => store.abrirEditar(a.poliza.id!)}
            class="fila-proximo"
            style="display:flex; align-items:center; gap:10px; background:none; border:none; border-bottom:1px solid #f0eadd; padding:9px 2px; cursor:pointer; text-align:left; width:100%;"
          >
            <span style="width:8px; height:8px; border-radius:50%; background:{colorEstado(estado)}; flex-shrink:0;"></span>
            <span style="flex:1; min-width:0;">
              <span style="display:block; font-size:14px; font-weight:600; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{a.poliza.nombre}</span>
              <span style="display:block; font-size:12px; color:var(--color-texto-tenue);">{subtituloPoliza(a.poliza)}</span>
            </span>
            <span style="font-size:12px; font-weight:600; color:{colorEstado(estado)}; white-space:nowrap;">{textoDias(a.dias)}</span>
          </button>
        {/each}
      </div>
    </section>
  </div>
</div>

<style>
  .boton-nueva:hover {
    background: var(--color-tinta-hover);
  }
  .fila-compania:hover,
  .fila-proximo:hover {
    background: var(--color-hover-fila-2);
  }
  .ver-calendario:hover {
    text-decoration: underline;
  }
</style>
