<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { store } from './estado/store.svelte';
  import { COMPANIAS_SUGERIDAS, type Errores, type Perfil } from '../dominio';

  let paso = $state(0);
  let nombre = $state('');
  let companias = $state<string[]>([]);
  let nuevaCompania = $state('');
  let errores = $state<Errores<Perfil>>({});
  let enviando = $state(false);

  function enfocar(nodo: HTMLElement) {
    nodo.focus();
  }

  const nombreValido = $derived(nombre.trim().length >= 3);
  const companiasValidas = $derived(companias.length > 0);

  const chipsCompanias = $derived.by(() => {
    const todas = [...new Set([...COMPANIAS_SUGERIDAS, ...companias])];
    return todas.map((c) => ({ nombre: c, activa: companias.includes(c) }));
  });

  function avanzar() {
    paso += 1;
  }

  function toggleCompania(c: string) {
    companias = companias.includes(c) ? companias.filter((x) => x !== c) : [...companias, c];
  }

  function anadirCompania() {
    const c = nuevaCompania.trim();
    if (!c) return;
    if (!companias.includes(c)) companias = [...companias, c];
    nuevaCompania = '';
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

      <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center; margin-bottom:14px;">
        {#each chipsCompanias as ch (ch.nombre)}
          <button
            onclick={() => toggleCompania(ch.nombre)}
            class="chip-compania"
            class:activa={ch.activa}
            style="border-radius:var(--radio-pill); padding:8px 15px; font-size:13px; font-weight:600; cursor:pointer;"
          >
            {ch.nombre}
          </button>
        {/each}
      </div>

      <div style="display:flex; gap:8px;">
        <input
          value={nuevaCompania}
          oninput={(e) => (nuevaCompania = e.currentTarget.value)}
          onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), anadirCompania())}
          placeholder="Añadir otra compañía…"
          style="flex:1; border:1px solid var(--color-borde-input); border-radius:var(--radio-input); padding:10px 14px; font-size:14px; background:var(--color-superficie);"
        />
        <button
          onclick={anadirCompania}
          style="border:1px solid var(--color-acento); background:var(--color-superficie); color:var(--color-acento); border-radius:var(--radio-pill); padding:10px 18px; font-size:13.5px; font-weight:600; cursor:pointer;"
        >
          Añadir
        </button>
      </div>
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
  .chip-compania {
    background: var(--color-superficie);
    border: 1px solid var(--color-borde-input);
    color: var(--color-texto-chip);
  }
  .chip-compania.activa {
    background: var(--color-tinta);
    border-color: var(--color-tinta);
    color: var(--color-texto-invertido);
  }
  input:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--color-acento-alpha);
  }
</style>
