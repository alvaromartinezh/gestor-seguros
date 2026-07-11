<script lang="ts">
  import { store } from '../estado/store.svelte';
  import AvisoCard from '../componentes/AvisoCard.svelte';

  const avisos = $derived(store.avisosRenovacion);
</script>

<div style="max-width:820px; margin:0 auto; animation:fadeIn 0.25s ease;">
  <h1 style="margin:0 0 4px; font-family:var(--fuente-titulares); font-size:31px; font-weight:400;">Avisos de renovación</h1>
  <p style="margin:0 0 20px; font-size:13.5px; color:var(--color-texto-tenue);">
    Pólizas vencidas o que vencen en los próximos {store.diasAviso} días. Recibirás una notificación en el dispositivo
    antes de cada vencimiento (configurable en tu perfil).
  </p>

  {#if !avisos.length}
    <div style="background:var(--color-vigente-bg); border:1px solid var(--color-vigente-borde); border-radius:var(--radio-tarjeta); padding:30px 20px; text-align:center; color:var(--color-vigente); font-size:14.5px; font-weight:600;">
      Todo al día. No hay renovaciones pendientes.
    </div>
  {/if}

  <div style="display:flex; flex-direction:column; gap:8px;">
    {#each avisos as aviso (aviso.poliza.id)}
      <AvisoCard {aviso} />
    {/each}
  </div>
</div>
