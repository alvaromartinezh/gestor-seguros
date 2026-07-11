<script lang="ts">
  import { store } from '../estado/store.svelte';
</script>

<nav style="width:var(--ancho-sidebar); flex-shrink:0; background:var(--color-superficie-sidebar); border-right:1px solid var(--color-borde-sidebar); display:flex; flex-direction:column; padding:26px 16px 18px;">
  <div style="display:flex; align-items:center; gap:11px; padding:0 8px 26px;">
    <div style="width:30px; height:30px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #ffb54d, #f07f13 70%); display:flex; align-items:center; justify-content:center; color:#c92a12; font-size:12px; flex-shrink:0; box-shadow:0 2px 6px rgba(150,90,20,0.3);">★</div>
    <div>
      <div style="font-family:var(--fuente-titulares); font-size:19px; letter-spacing:0.01em; line-height:1.1;">Gestor de Seguros</div>
      <div style="font-size:11px; color:var(--color-texto-tenue); letter-spacing:0.04em;">Cartera de clientes</div>
    </div>
  </div>

  {#each store.navItems as it (it.id)}
    <button
      onclick={() => store.cambiarVista(it.id)}
      class="item-nav"
      class:activo={store.vista === it.id}
      style="display:flex; align-items:center; gap:10px; width:100%; background:none; border:none; padding:10px 10px; margin-bottom:2px; border-radius:10px; cursor:pointer; text-align:left; font-size:14px; font-weight:600; min-height:var(--altura-tactil-min);"
    >
      <span>{it.etiqueta}</span>
      {#if it.badge}
        <span style="background:var(--color-badge); color:var(--color-texto-invertido); border-radius:var(--radio-pill); font-size:11px; font-weight:700; padding:1px 7px; margin-left:auto;">{it.badge}</span>
      {/if}
    </button>
  {/each}

  <div style="margin-top:auto; padding:0 6px;">
    {#if store.perfil?.nombre}
      <button
        onclick={() => store.cambiarVista('perfil')}
        class="fila-perfil"
        style="display:flex; align-items:center; gap:10px; width:100%; background:none; border:none; padding:8px 4px; cursor:pointer; text-align:left; border-radius:10px; margin-bottom:8px;"
      >
        {#if store.perfil.foto}
          <img src={store.perfil.foto} alt="" style="width:34px; height:34px; border-radius:50%; object-fit:cover; flex-shrink:0; border:1.5px solid var(--color-borde-input);" />
        {:else}
          <span style="width:34px; height:34px; border-radius:50%; background:var(--color-tinta); color:#f0e9db; display:inline-flex; align-items:center; justify-content:center; font-size:14px; font-weight:600; flex-shrink:0;">
            {store.perfil.nombre.charAt(0).toUpperCase()}
          </span>
        {/if}
        <span style="min-width:0;">
          <span style="display:block; font-size:13.5px; font-weight:600; color:var(--color-texto); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">{store.perfil.nombre}</span>
          <span style="display:block; font-size:11px; color:var(--color-texto-tenue);">Ver perfil</span>
        </span>
      </button>
    {/if}
    <div style="font-size:10.5px; color:#aca287; padding:0 4px;">Datos guardados en este dispositivo</div>
  </div>
</nav>

<style>
  .item-nav:hover {
    background: var(--color-hover-fila);
  }
  .item-nav.activo {
    background: var(--color-tinta);
    color: var(--color-texto-invertido);
  }
  .fila-perfil:hover {
    background: var(--color-hover-fila);
  }
</style>
