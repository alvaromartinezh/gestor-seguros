<script lang="ts">
  import { onMount } from 'svelte';
  import { store } from './estado/store.svelte';
  import Login from './Login.svelte';
  import Onboarding from './Onboarding.svelte';
  import Sidebar from './componentes/Sidebar.svelte';
  import CabeceraMovil from './componentes/CabeceraMovil.svelte';
  import BarraInferiorMovil from './componentes/BarraInferiorMovil.svelte';
  import BannerDemo from './componentes/BannerDemo.svelte';
  import BannerActualizacion from './componentes/BannerActualizacion.svelte';
  import PolizaForm from './componentes/PolizaForm.svelte';
  import ConfirmDialog from './componentes/ConfirmDialog.svelte';
  import Toast from './componentes/Toast.svelte';
  import Inicio from './vistas/Inicio.svelte';
  import Polizas from './vistas/Polizas.svelte';
  import Calendario from './vistas/Calendario.svelte';
  import Avisos from './vistas/Avisos.svelte';
  import Perfil from './vistas/Perfil.svelte';

  const CONSULTA_MOVIL = '(max-width: 860px)';

  onMount(() => {
    const mq = window.matchMedia(CONSULTA_MOVIL);
    const actualizar = () => (store.esMovil = mq.matches);
    actualizar();
    mq.addEventListener('change', actualizar);
    return () => mq.removeEventListener('change', actualizar);
  });
</script>

{#if !store.listo}
  <div style="height:100vh; display:flex; align-items:center; justify-content:center; background:var(--color-fondo); color:var(--color-texto-tenue); font-size:14px;">
    Cargando cartera…
  </div>
{:else if !store.sesion}
  <Login />
{:else if !store.perfil}
  <Onboarding />
{:else}
  <div style="display:flex; height:100vh; overflow:hidden; background:var(--color-fondo);">
    {#if !store.esMovil}
      <Sidebar />
    {/if}

    <div style="flex:1; display:flex; flex-direction:column; min-width:0;">
      {#if store.esMovil}
        <CabeceraMovil />
      {/if}

      {#if store.actualizacion.hayNueva}
        <BannerActualizacion />
      {/if}

      {#if store.hayDemo}
        <BannerDemo />
      {/if}

      <main style="flex:1; overflow-y:auto; padding:{store.esMovil ? '18px 16px 90px' : '30px 34px'};">
        {#if store.vista === 'inicio'}
          <Inicio />
        {:else if store.vista === 'polizas'}
          <Polizas />
        {:else if store.vista === 'calendario'}
          <Calendario />
        {:else if store.vista === 'avisos'}
          <Avisos />
        {:else if store.vista === 'perfil'}
          <Perfil />
        {/if}
      </main>

      {#if store.esMovil}
        <BarraInferiorMovil />
      {/if}
    </div>
  </div>

  {#if store.formVisible}
    <PolizaForm />
  {/if}

  {#if store.confirmarBorradoId}
    <ConfirmDialog
      titulo="Borrar póliza"
      mensaje="¿Seguro que quieres borrar esta póliza? Esta acción no se puede deshacer."
      textoConfirmar="Borrar"
      onConfirmar={() => store.confirmarBorrado()}
      onCancelar={() => store.cancelarBorrado()}
    />
  {/if}

  {#if store.toast}
    <Toast titulo={store.toast.titulo} cuerpo={store.toast.cuerpo} onCerrar={() => store.cerrarToast()} />
  {/if}
{/if}
