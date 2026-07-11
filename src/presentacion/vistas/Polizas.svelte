<script lang="ts">
  import { store } from '../estado/store.svelte';
  import PolizaCard from '../componentes/PolizaCard.svelte';

  const polizas = $derived(store.polizasFiltradas);
  const hayFiltros = $derived(Object.values(store.filtros).some((v) => v));

  const resumenFiltrado = $derived(
    hayFiltros ? `${polizas.length} de ${store.polizas.length}` : `${store.polizas.length} en total`,
  );

  const campoSelect =
    'border:1px solid var(--color-borde-input); border-radius:var(--radio-input); padding:10px; font-size:14px; background:var(--color-superficie); min-height:var(--altura-tactil-min);';
</script>

<div style="max-width:1060px; margin:0 auto; animation:fadeIn 0.25s ease;">
  <div style="display:flex; align-items:center; gap:12px; flex-wrap:wrap; margin-bottom:16px;">
    <h1 style="margin:0; font-family:var(--fuente-titulares); font-size:31px; font-weight:400;">Pólizas</h1>
    <span style="font-size:13px; color:var(--color-texto-tenue);">{resumenFiltrado}</span>
    <button
      onclick={() => store.abrirNueva()}
      class="boton-nueva"
      style="margin-left:auto; background:var(--color-tinta); color:var(--color-texto-invertido); border:none; border-radius:var(--radio-pill); padding:11px 20px; font-size:14px; font-weight:600; cursor:pointer; min-height:var(--altura-tactil-min);"
    >
      + Nueva póliza
    </button>
  </div>

  <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:16px;">
    <input
      value={store.filtros.texto}
      oninput={(e) => store.cambiarFiltro({ texto: e.currentTarget.value })}
      placeholder="Buscar nombre, matrícula, coche…"
      style="flex:1; min-width:180px; border:1px solid var(--color-borde-input); border-radius:var(--radio-input); padding:10px 14px; font-size:14px; background:var(--color-superficie);"
    />
    <select style={campoSelect} value={store.filtros.compania} onchange={(e) => store.cambiarFiltro({ compania: e.currentTarget.value })}>
      <option value="">Compañía: todas</option>
      {#each store.companiasEnCartera as c (c)}<option value={c}>{c}</option>{/each}
    </select>
    <select style={campoSelect} value={store.filtros.tipo} onchange={(e) => store.cambiarFiltro({ tipo: e.currentTarget.value })}>
      <option value="">Tipo: todos</option>
      {#each store.tiposSeguro as t (t)}<option value={t}>{t}</option>{/each}
    </select>
    <select style={campoSelect} value={store.filtros.estado} onchange={(e) => store.cambiarFiltro({ estado: e.currentTarget.value })}>
      <option value="">Estado: todos</option>
      <option value="vigente">Vigente</option>
      <option value="proximo">Vence pronto</option>
      <option value="vencido">Vencida</option>
    </select>
    {#if hayFiltros}
      <button
        onclick={() => store.limpiarFiltros()}
        class="boton-limpiar"
        style="border:1px solid var(--color-borde-input); background:var(--color-superficie); border-radius:var(--radio-input); padding:10px 14px; font-size:13px; font-weight:600; color:var(--color-texto-chip); cursor:pointer;"
      >
        Limpiar
      </button>
    {/if}
  </div>

  {#if !polizas.length}
    <div style="background:var(--color-superficie); border:1px dashed var(--color-borde-input); border-radius:var(--radio-tarjeta); padding:40px 20px; text-align:center; color:var(--color-texto-tenue);">
      <div style="font-size:15px; font-weight:600; margin-bottom:4px; color:var(--color-texto);">Sin resultados</div>
      <div style="font-size:13px;">No hay ninguna póliza que coincida con esos filtros.</div>
    </div>
  {/if}

  <div style="display:flex; flex-direction:column; gap:8px;">
    {#each polizas as poliza (poliza.id)}
      <PolizaCard {poliza} />
    {/each}
  </div>
</div>

<style>
  .boton-nueva:hover {
    background: var(--color-tinta-hover);
  }
  .boton-limpiar:hover {
    background: var(--color-hover-fila);
  }
</style>
