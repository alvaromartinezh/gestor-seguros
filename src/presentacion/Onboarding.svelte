<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { store } from './estado/store.svelte';
  import { type Errores, type Perfil } from '../dominio';
  import SelectorCompanias from './componentes/SelectorCompanias.svelte';

  let paso = $state(0);
  let nombre = $state('');
  let companias = $state<string[]>([]);
  let errores = $state<Errores<Perfil>>({});
  let enviando = $state(false);

  function enfocar(nodo: HTMLElement) {
    nodo.focus();
  }

  const nombreValido = $derived(nombre.trim().length >= 3);
  const companiasValidas = $derived(companias.length > 0);

  function avanzar() {
    paso += 1;
  }

  async function terminar() {
    enviando = true;
    const resultado = await store.guardarPerfil({ nombre, companias });
    enviando = false;
    if (!resultado.ok) {
      errores = resultado.errores;
      if (errores.nombre) paso = 2;
    }
  }
</script>

<div
  style="position:fixed; inset:0; background:var(--color-fondo); z-index:100; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px; overflow-y:auto;"
>
  <div style="width:34px; height:34px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #ffb54d, #f07f13 70%); display:flex; align-items:center; justify-content:center; color:#c92a12; font-size:13px; margin-bottom:36px; box-shadow:0 4px 14px rgba(150,90,20,0.35);">
    ★
  </div>

  {#if paso === 0}
    <div
      role="button"
      tabindex="0"
      onclick={avanzar}
      onkeydown={(e) => e.key === 'Enter' && avanzar()}
      in:fade={{ duration: 500 }}
      style="cursor:pointer; text-align:center; max-width:520px;"
    >
      <h1 style="margin:0; font-family:var(--fuente-titulares); font-weight:400; font-size:clamp(40px, 8vw, 68px); animation:fadeUp 0.7s ease;">
        Bienvenido
      </h1>
      <p style="margin:22px 0 0; font-size:13px; color:var(--color-texto-tenue); letter-spacing:0.06em; text-transform:uppercase; animation:fadeIn 1.4s ease;">
        Toca para continuar
      </p>
    </div>
  {:else if paso === 1}
    <div
      role="button"
      tabindex="0"
      onclick={avanzar}
      onkeydown={(e) => e.key === 'Enter' && avanzar()}
      in:fade={{ duration: 500 }}
      style="cursor:pointer; text-align:center; max-width:560px;"
    >
      <h1 style="margin:0; font-family:var(--fuente-titulares); font-weight:400; font-size:clamp(30px, 6vw, 46px); line-height:1.25; animation:fadeUp 0.7s ease;">
        Antes de continuar,<br />vamos a conocernos
      </h1>
      <p style="margin:22px 0 0; font-size:13px; color:var(--color-texto-tenue); letter-spacing:0.06em; text-transform:uppercase; animation:fadeIn 1.4s ease;">
        Toca para continuar
      </p>
    </div>
  {:else if paso === 2}
    <div in:fly={{ y: 16, duration: 450 }} style="text-align:center; width:100%; max-width:420px;">
      <h1 style="margin:0 0 26px; font-family:var(--fuente-titulares); font-weight:400; font-size:clamp(28px, 5vw, 40px);">
        ¿Cómo te llamas?
      </h1>
      <input
        value={nombre}
        oninput={(e) => (nombre = e.currentTarget.value)}
        onkeydown={(e) => e.key === 'Enter' && nombreValido && avanzar()}
        placeholder="Tu nombre"
        use:enfocar
        style="width:100%; text-align:center; border:1px solid var(--color-borde-input); border-radius:var(--radio-input); padding:14px 16px; font-size:18px; background:var(--color-superficie);"
      />
      {#if errores.nombre}<p style="color:var(--color-vencido); font-size:12.5px; margin:10px 0 0;">{errores.nombre}</p>{/if}
      <button
        onclick={avanzar}
        disabled={!nombreValido}
        style="margin-top:26px; border:none; background:var(--color-tinta); color:var(--color-texto-invertido); border-radius:var(--radio-pill); padding:12px 26px; font-size:14px; font-weight:600; cursor:pointer; min-height:var(--altura-tactil-min); opacity:{nombreValido ? 1 : 0.4};"
      >
        Siguiente
      </button>
    </div>
  {:else}
    <div in:fly={{ y: 16, duration: 450 }} style="text-align:center; width:100%; max-width:520px;">
      <h1 style="margin:0 0 10px; font-family:var(--fuente-titulares); font-weight:400; font-size:clamp(26px, 5vw, 38px);">
        ¿Para qué compañías trabajas?
      </h1>
      <p style="margin:0 0 22px; font-size:13px; color:var(--color-texto-tenue);">Elige las que quieras, puedes cambiarlo luego en tu perfil.</p>

      <SelectorCompanias seleccionadas={companias} onCambiar={(nuevas) => (companias = nuevas)} />
      {#if errores.companias}<p style="color:var(--color-vencido); font-size:12.5px; margin:10px 0 0;">{errores.companias}</p>{/if}

      <button
        onclick={terminar}
        disabled={!companiasValidas || enviando}
        style="margin-top:26px; border:none; background:var(--color-tinta); color:var(--color-texto-invertido); border-radius:var(--radio-pill); padding:12px 28px; font-size:14px; font-weight:600; cursor:pointer; min-height:var(--altura-tactil-min); opacity:{companiasValidas ? 1 : 0.4};"
      >
        {enviando ? 'Un momento…' : 'Empezar'}
      </button>
    </div>
  {/if}

  <div style="display:flex; gap:6px; margin-top:44px;">
    {#each [0, 1, 2, 3] as i (i)}
      <span style="width:6px; height:6px; border-radius:50%; background:{i === paso ? 'var(--color-acento)' : '#e0d5c0'};"></span>
    {/each}
  </div>
</div>

<style>
  input:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--color-acento-alpha);
  }
</style>
