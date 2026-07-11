<script lang="ts">
  import { store } from '../estado/store.svelte';
  import { estadoPoliza, formatFecha, formatPrecio, hoyISO } from '../../dominio';
  import type { AvisoRenovacion } from '../../aplicacion';
  import { colorEstado, subtituloPoliza, textoDias } from '../viewmodel';

  interface Props {
    aviso: AvisoRenovacion;
  }
  const { aviso }: Props = $props();

  const estado = $derived(estadoPoliza(aviso.poliza, hoyISO(), store.diasAviso));
</script>

<div style="background:var(--color-superficie); border:1px solid var(--color-borde); border-left:4px solid {colorEstado(estado)}; border-radius:var(--radio-tarjeta-lista); padding:14px 16px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
  <div style="flex:1; min-width:180px;">
    <div style="font-size:15px; font-weight:600;">{aviso.poliza.nombre}</div>
    <div style="font-size:12.5px; color:var(--color-texto-tenue); margin-top:2px;">{subtituloPoliza(aviso.poliza)} · {aviso.poliza.compania}</div>
  </div>
  <div style="min-width:130px;">
    <div style="font-size:13px; font-weight:700; color:{colorEstado(estado)};">{textoDias(aviso.dias)}</div>
    <div style="font-size:12px; color:var(--color-texto-tenue);">{formatFecha(aviso.poliza.fechaVencimiento)} · {formatPrecio(aviso.poliza.precio)}</div>
  </div>
  <div style="display:flex; gap:6px;">
    <button
      onclick={() => store.renovar(aviso.poliza.id!)}
      class="boton-renovar"
      style="border:none; background:var(--color-tinta); color:var(--color-texto-invertido); border-radius:var(--radio-pill); padding:9px 16px; font-size:12.5px; font-weight:600; cursor:pointer; min-height:40px;"
    >
      Renovada +1 año
    </button>
    <button
      onclick={() => store.abrirEditar(aviso.poliza.id!)}
      class="boton-ver"
      style="border:1px solid var(--color-borde-input); background:var(--color-superficie); border-radius:var(--radio-pill); padding:9px 16px; font-size:12.5px; font-weight:600; color:var(--color-texto-chip); cursor:pointer; min-height:40px;"
    >
      Ver
    </button>
  </div>
</div>

<style>
  .boton-renovar:hover {
    background: var(--color-tinta-hover);
  }
  .boton-ver:hover {
    background: var(--color-hover-fila);
  }
</style>
