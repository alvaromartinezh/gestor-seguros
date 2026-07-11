<script lang="ts">
  import { store } from '../estado/store.svelte';
</script>

<nav style="flex-shrink:0; background:var(--color-superficie); border-top:1px solid var(--color-borde); display:grid; grid-template-columns:repeat(5, 1fr); padding:4px 6px calc(4px + env(safe-area-inset-bottom));">
  {#each store.navItems as it (it.id)}
    <button
      onclick={() => store.cambiarVista(it.id)}
      class="tab"
      class:activo={store.vista === it.id}
      style="background:none; border:none; padding:8px 2px; font-size:11.5px; font-weight:600; cursor:pointer; min-height:var(--altura-tactil-min);"
    >
      <span style="position:relative;">
        {it.etiqueta}
        {#if it.badge}
          <span style="position:absolute; top:-9px; right:-16px; background:var(--color-badge); color:var(--color-texto-invertido); border-radius:var(--radio-pill); font-size:9.5px; font-weight:700; padding:1px 5px;">{it.badge}</span>
        {/if}
      </span>
    </button>
  {/each}
</nav>

<style>
  .tab {
    color: var(--color-texto-tenue);
  }
  .tab.activo {
    color: var(--color-texto);
  }
</style>
