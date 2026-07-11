<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import { store } from './estado/store.svelte';

  let paso = $state(0);
  let email = $state('');
  let codigo = $state('');
  let error = $state('');
  let enviando = $state(false);

  function enfocar(nodo: HTMLElement) {
    nodo.focus();
  }

  const emailValido = $derived(/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()));
  const codigoValido = $derived(/^\d{6}$/.test(codigo.trim()));

  function avanzar() {
    paso += 1;
  }

  async function enviarCodigo() {
    if (!emailValido || enviando) return;
    enviando = true;
    error = '';
    const resultado = await store.adaptadores.autenticacion.enviarCodigo(email.trim());
    enviando = false;
    if (!resultado.ok) {
      error = resultado.error;
      return;
    }
    paso = 2;
  }

  async function verificarCodigo() {
    if (!codigoValido || enviando) return;
    enviando = true;
    error = '';
    const resultado = await store.adaptadores.autenticacion.verificarCodigo(email.trim(), codigo.trim());
    enviando = false;
    if (!resultado.ok) {
      error = resultado.error;
      return;
    }
    await store.completarLogin(resultado.sesion);
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
    <div in:fly={{ y: 16, duration: 450 }} style="text-align:center; width:100%; max-width:420px;">
      <h1 style="margin:0 0 10px; font-family:var(--fuente-titulares); font-weight:400; font-size:clamp(28px, 5vw, 40px);">
        ¿Cuál es tu correo?
      </h1>
      <p style="margin:0 0 22px; font-size:13px; color:var(--color-texto-tenue);">
        Te enviamos un código para entrar sin contraseña. Con el mismo correo verás tu cartera en cualquier
        dispositivo.
      </p>
      <input
        type="email"
        value={email}
        oninput={(e) => (email = e.currentTarget.value)}
        onkeydown={(e) => e.key === 'Enter' && enviarCodigo()}
        placeholder="tucorreo@ejemplo.com"
        use:enfocar
        style="width:100%; text-align:center; border:1px solid var(--color-borde-input); border-radius:var(--radio-input); padding:14px 16px; font-size:18px; background:var(--color-superficie);"
      />
      {#if error}<p style="color:var(--color-vencido); font-size:12.5px; margin:10px 0 0;">{error}</p>{/if}
      <button
        onclick={enviarCodigo}
        disabled={!emailValido || enviando}
        style="margin-top:26px; border:none; background:var(--color-tinta); color:var(--color-texto-invertido); border-radius:var(--radio-pill); padding:12px 26px; font-size:14px; font-weight:600; cursor:pointer; min-height:var(--altura-tactil-min); opacity:{emailValido ? 1 : 0.4};"
      >
        {enviando ? 'Enviando…' : 'Enviar código'}
      </button>
    </div>
  {:else}
    <div in:fly={{ y: 16, duration: 450 }} style="text-align:center; width:100%; max-width:420px;">
      <h1 style="margin:0 0 10px; font-family:var(--fuente-titulares); font-weight:400; font-size:clamp(28px, 5vw, 40px);">
        Revisa tu correo
      </h1>
      <p style="margin:0 0 22px; font-size:13px; color:var(--color-texto-tenue);">
        Te hemos enviado un código de 6 dígitos a <strong>{email.trim()}</strong>.
      </p>
      <input
        inputmode="numeric"
        maxlength="6"
        value={codigo}
        oninput={(e) => (codigo = e.currentTarget.value.replace(/\D/g, '').slice(0, 6))}
        onkeydown={(e) => e.key === 'Enter' && verificarCodigo()}
        placeholder="000000"
        use:enfocar
        style="width:100%; text-align:center; letter-spacing:0.5em; font-size:24px; border:1px solid var(--color-borde-input); border-radius:var(--radio-input); padding:14px 16px; background:var(--color-superficie);"
      />
      {#if error}<p style="color:var(--color-vencido); font-size:12.5px; margin:10px 0 0;">{error}</p>{/if}
      <button
        onclick={verificarCodigo}
        disabled={!codigoValido || enviando}
        style="margin-top:26px; border:none; background:var(--color-tinta); color:var(--color-texto-invertido); border-radius:var(--radio-pill); padding:12px 26px; font-size:14px; font-weight:600; cursor:pointer; min-height:var(--altura-tactil-min); opacity:{codigoValido ? 1 : 0.4};"
      >
        {enviando ? 'Comprobando…' : 'Entrar'}
      </button>
      <div>
        <button
          onclick={enviarCodigo}
          disabled={enviando}
          class="boton-reenviar"
          style="margin-top:14px; background:none; border:none; color:var(--color-acento); font-size:12.5px; font-weight:600; cursor:pointer; padding:4px;"
        >
          ¿No te llegó? Reenviar código
        </button>
      </div>
    </div>
  {/if}

  <div style="display:flex; gap:6px; margin-top:44px;">
    {#each [0, 1, 2] as i (i)}
      <span style="width:6px; height:6px; border-radius:50%; background:{i === paso ? 'var(--color-acento)' : '#e0d5c0'};"></span>
    {/each}
  </div>
</div>

<style>
  .boton-reenviar:hover {
    text-decoration: underline;
  }
  input:focus-visible,
  button:focus-visible {
    outline: 2px solid var(--color-acento-alpha);
  }
</style>
