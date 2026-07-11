<script lang="ts">
  import { store } from '../estado/store.svelte';
  import { estadoPoliza, formatFecha, formatPrecio, hoyISO, type Poliza } from '../../dominio';
  import { colorEstado, fondoEstado, etiquetaEstado, subtituloPoliza } from '../viewmodel';

  interface Props {
    poliza: Poliza;
  }
  const { poliza }: Props = $props();

  const estado = $derived(estadoPoliza(poliza, hoyISO(), store.diasAviso));
</script>

<div style="background:var(--color-superficie); border:1px solid var(--color-borde); border-radius:var(--radio-tarjeta-lista); padding:13px 16px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
  <div style="flex:2; min-width:170px;">
    <div style="font-size:15px; font-weight:600;">{poliza.nombre}</div>
    <div style="font-size:12.5px; color:var(--color-texto-tenue); display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:2px;">
      <span>{subtituloPoliza(poliza)}</span>
      {#if poliza.matricula}
        <span style="font-size:11.5px; font-weight:700; letter-spacing:0.06em; background:var(--color-superficie-chip); border:1px solid var(--color-borde-chip); border-radius:6px; padding:1px 8px; color:var(--color-texto-chip);">{poliza.matricula}</span>
      {/if}
    </div>
  </div>
  <div style="flex:1; min-width:110px; font-size:13px;">
    <div style="font-weight:600;">{poliza.compania}</div>
    <div style="color:var(--color-texto-tenue); font-size:12px;">{poliza.tipo}</div>
  </div>
  <div style="flex:1; min-width:120px; font-size:13px;">
    <div style="font-weight:600;">{formatFecha(poliza.fechaVencimiento)}</div>
    <span style="display:inline-block; font-size:11.5px; font-weight:700; color:{colorEstado(estado)}; background:{fondoEstado(estado)}; border-radius:var(--radio-pill); padding:2px 10px; margin-top:2px;">{etiquetaEstado(estado)}</span>
  </div>
  <div style="font-size:15px; font-weight:700; min-width:74px; text-align:right;">{formatPrecio(poliza.precio)}</div>
  <div style="display:flex; gap:6px;">
    <button
      onclick={() => store.abrirEditar(poliza.id!)}
      class="boton-editar"
      style="border:1px solid var(--color-borde-input); background:var(--color-superficie); border-radius:var(--radio-pill); padding:8px 14px; font-size:12.5px; font-weight:600; color:var(--color-acento); cursor:pointer; min-height:38px;"
    >
      Editar
    </button>
    <button
      onclick={() => store.pedirBorrar(poliza.id!)}
      class="boton-borrar"
      style="border:1px solid var(--color-vencido-borde-input); background:var(--color-superficie); border-radius:var(--radio-pill); padding:8px 14px; font-size:12.5px; font-weight:600; color:var(--color-vencido); cursor:pointer; min-height:38px;"
    >
      Borrar
    </button>
  </div>
</div>

<style>
  .boton-editar:hover {
    background: var(--color-hover-fila);
  }
  .boton-borrar:hover {
    background: var(--color-vencido-bg);
  }
</style>
