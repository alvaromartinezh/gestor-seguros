<script lang="ts">
  import { store } from '../estado/store.svelte';
</script>

<header style="background:var(--color-fondo); border-bottom:1px solid var(--color-borde); padding:14px 16px; display:flex; align-items:center; gap:10px; flex-shrink:0;">
  <div style="width:26px; height:26px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #ffb54d, #f07f13 70%); display:flex; align-items:center; justify-content:center; color:#c92a12; font-size:10px;">★</div>
  <div style="font-family:var(--fuente-titulares); font-size:19px;">Gestor de Seguros</div>
  <button
    onclick={() => store.cambiarVista('avisos')}
    style="margin-left:auto; background:none; border:none; color:var(--color-texto); font-size:14px; font-weight:600; cursor:pointer; position:relative; padding:6px 10px; min-height:var(--altura-tactil-min);"
  >
    Avisos
    {#if store.avisosCount}
      <span style="position:absolute; top:2px; right:-2px; background:var(--color-badge); color:var(--color-texto-invertido); border-radius:var(--radio-pill); font-size:10px; font-weight:700; padding:1px 6px;">{store.avisosCount}</span>
    {/if}
  </button>
</header>
