<script lang="ts">
  import { store } from '../estado/store.svelte';

  const esCapacitor = $derived(store.plataforma === 'capacitor');
</script>

<div style="background:var(--color-vigente-bg); border-bottom:1px solid var(--color-vigente-borde); color:#345a31; font-size:13px; padding:8px 16px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
  <span>
    Hay una versión nueva disponible{store.actualizacion.version ? ` (${store.actualizacion.version})` : ''}.
    {esCapacitor ? 'Toca para descargarla e instalarla.' : 'Se instalará al reiniciar la app.'}
  </span>
  <button
    onclick={() => store.instalarActualizacion()}
    disabled={store.instalandoActualizacion}
    class="boton-actualizar"
    style="background:#345a31; color:#f2f7ef; border:none; border-radius:999px; padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer;"
  >
    {store.instalandoActualizacion ? 'Un momento…' : esCapacitor ? 'Descargar actualización' : 'Actualizar y reiniciar'}
  </button>
</div>

<style>
  .boton-actualizar:hover {
    filter: brightness(0.92);
  }
</style>
