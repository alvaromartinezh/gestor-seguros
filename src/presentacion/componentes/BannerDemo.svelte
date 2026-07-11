<script lang="ts">
  import { store } from '../estado/store.svelte';
</script>

<div style="background:var(--color-demo-bg); border-bottom:1px solid var(--color-demo-borde); color:var(--color-demo-texto); font-size:13px; padding:8px 16px; display:flex; align-items:center; gap:12px; flex-wrap:wrap;">
  <span>Estás viendo <strong>clientes de ejemplo</strong> para probar la aplicación.</span>
  <button
    onclick={() => store.quitarDemo()}
    style="background:var(--color-demo-boton); color:#faf6ec; border:none; border-radius:var(--radio-pill); padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer;"
  >
    Eliminar datos de ejemplo
  </button>
</div>
