<script lang="ts">
  import { store } from '../estado/store.svelte';
  import { DIAS_AVISO_DEFECTO, nuevoPerfilVacio, type DatosPerfil, type Errores, type Perfil } from '../../dominio';
  import SelectorCompanias from '../componentes/SelectorCompanias.svelte';

  let form = $state<DatosPerfil>(store.perfil ? { ...store.perfil } : nuevoPerfilVacio(DIAS_AVISO_DEFECTO));
  let errores = $state<Errores<Perfil>>({});
  let guardando = $state(false);
  let guardado = $state(false);
  let mostrarSelectorCompanias = $state(false);

  let mensajeBackup = $state<{ texto: string; error: boolean } | null>(null);
  let procesandoBackup = $state(false);

  function quitarCompania(nombre: string) {
    form = { ...form, companias: (form.companias ?? []).filter((c) => c !== nombre) };
  }

  function cambiarFoto(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    const archivo = input.files?.[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = () => (form = { ...form, foto: String(lector.result ?? '') });
    lector.readAsDataURL(archivo);
  }

  function quitarFoto() {
    form = { ...form, foto: '' };
  }

  async function guardar(e: Event) {
    e.preventDefault();
    guardando = true;
    guardado = false;
    const resultado = await store.guardarPerfil(form);
    guardando = false;
    if (!resultado.ok) {
      errores = resultado.errores;
      return;
    }
    errores = {};
    guardado = true;
    setTimeout(() => (guardado = false), 2500);
  }

  async function exportar() {
    procesandoBackup = true;
    mensajeBackup = null;
    const resultado = await store.exportarBackup();
    procesandoBackup = false;
    if (resultado.ok) mensajeBackup = { texto: 'Copia de seguridad guardada.', error: false };
    else if (!resultado.cancelado) mensajeBackup = { texto: resultado.error, error: true };
  }

  async function importar() {
    procesandoBackup = true;
    mensajeBackup = null;
    const resultado = await store.importarBackup();
    procesandoBackup = false;
    if (resultado.ok) {
      mensajeBackup = { texto: `Copia restaurada: ${resultado.totalPolizas} pólizas.`, error: false };
      form = store.perfil ? { ...store.perfil } : nuevoPerfilVacio(DIAS_AVISO_DEFECTO);
    } else if (!resultado.cancelado) {
      mensajeBackup = { texto: resultado.error, error: true };
    }
  }

  const campoInput =
    'border:1px solid var(--color-borde-input); border-radius:var(--radio-input); padding:10px 12px; font-size:14px; background:var(--color-superficie); width:100%;';
</script>

<div style="max-width:640px; margin:0 auto; animation:fadeIn 0.25s ease;">
  <h1 style="margin:0 0 4px; font-family:var(--fuente-titulares); font-size:31px; font-weight:400;">Mi perfil</h1>
  <p style="margin:0 0 20px; font-size:13.5px; color:var(--color-texto-tenue);">
    Tu nombre, tu foto, las compañías con las que trabajas y con cuánta antelación quieres que te avisemos.
  </p>

  <form onsubmit={guardar}>
    <section style="background:var(--color-superficie); border:1px solid var(--color-borde); border-radius:var(--radio-tarjeta); padding:20px; margin-bottom:14px;">
      <div style="display:flex; align-items:center; gap:16px; flex-wrap:wrap;">
        {#if form.foto}
          <img src={form.foto} alt="" style="width:72px; height:72px; border-radius:50%; object-fit:cover; border:2px solid var(--color-borde-input);" />
        {:else}
          <span style="width:72px; height:72px; border-radius:50%; background:var(--color-tinta); color:#f0e9db; display:inline-flex; align-items:center; justify-content:center; font-family:var(--fuente-titulares); font-size:30px;">
            {(form.nombre ?? '?').trim().charAt(0).toUpperCase() || '?'}
          </span>
        {/if}
        <div style="flex:1; min-width:200px;">
          <label style="display:flex; flex-direction:column; gap:4px;">
            <span style="font-size:12.5px; font-weight:600; color:var(--color-texto-tenue-2);">Nombre *</span>
            <input style={campoInput} value={form.nombre} oninput={(e) => (form = { ...form, nombre: e.currentTarget.value })} />
            {#if errores.nombre}<span style="font-size:12px; color:var(--color-vencido);">{errores.nombre}</span>{/if}
          </label>
        </div>
      </div>
      <div style="display:flex; gap:8px; margin-top:14px;">
        <label
          class="boton-foto"
          style="border:1px solid var(--color-borde-input); background:var(--color-superficie); border-radius:var(--radio-pill); padding:9px 16px; font-size:12.5px; font-weight:600; color:var(--color-texto-chip); cursor:pointer; display:inline-flex; align-items:center; min-height:40px;"
        >
          Cambiar foto
          <input type="file" accept="image/*" onchange={cambiarFoto} style="display:none;" />
        </label>
        {#if form.foto}
          <button
            type="button"
            onclick={quitarFoto}
            class="boton-quitar-foto"
            style="border:1px solid var(--color-vencido-borde-input); background:var(--color-superficie); border-radius:var(--radio-pill); padding:9px 16px; font-size:12.5px; font-weight:600; color:var(--color-vencido); cursor:pointer; min-height:40px;"
          >
            Quitar foto
          </button>
        {/if}
      </div>
    </section>

    <section style="background:var(--color-superficie); border:1px solid var(--color-borde); border-radius:var(--radio-tarjeta); padding:20px; margin-bottom:14px;">
      <h2 style="margin:0 0 4px; font-family:var(--fuente-titulares); font-size:19px; font-weight:400;">Compañías con las que trabajas *</h2>
      <p style="margin:0 0 14px; font-size:12.5px; color:var(--color-texto-tenue);">Toca una compañía para quitarla de la lista.</p>
      <div style="display:flex; gap:8px; flex-wrap:wrap;">
        {#each form.companias ?? [] as c (c)}
          <button
            type="button"
            onclick={() => quitarCompania(c)}
            class="chip-quitar"
            style="border-radius:var(--radio-pill); padding:8px 14px; font-size:13px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:6px;"
          >
            {c} <span aria-hidden="true">×</span>
          </button>
        {/each}
        <button
          type="button"
          onclick={() => (mostrarSelectorCompanias = true)}
          class="boton-anadir"
          style="border:1px solid var(--color-acento); background:var(--color-superficie); color:var(--color-acento); border-radius:var(--radio-pill); padding:8px 16px; font-size:13px; font-weight:600; cursor:pointer;"
        >
          + Añadir
        </button>
      </div>
      {#if errores.companias}<div style="font-size:12px; color:var(--color-vencido); margin-top:8px;">{errores.companias}</div>{/if}
    </section>

    <section style="background:var(--color-superficie); border:1px solid var(--color-borde); border-radius:var(--radio-tarjeta); padding:20px; margin-bottom:18px;">
      <h2 style="margin:0 0 4px; font-family:var(--fuente-titulares); font-size:19px; font-weight:400;">Aviso de renovación</h2>
      <p style="margin:0 0 14px; font-size:12.5px; color:var(--color-texto-tenue);">Con cuántos días de antelación quieres ver una póliza como "próxima a vencer" y recibir la notificación.</p>
      <label style="display:flex; flex-direction:column; gap:4px; max-width:160px;">
        <span style="font-size:12.5px; font-weight:600; color:var(--color-texto-tenue-2);">Días de antelación</span>
        <input
          type="number"
          min="1"
          max="365"
          style={campoInput}
          value={form.diasAviso}
          oninput={(e) => (form = { ...form, diasAviso: Number(e.currentTarget.value) })}
        />
        {#if errores.diasAviso}<span style="font-size:12px; color:var(--color-vencido);">{errores.diasAviso}</span>{/if}
      </label>
    </section>

    <div style="display:flex; align-items:center; gap:12px; margin-bottom:30px;">
      <button
        type="submit"
        disabled={guardando}
        style="border:none; background:var(--color-tinta); color:var(--color-texto-invertido); border-radius:var(--radio-pill); padding:12px 24px; font-size:14px; font-weight:600; cursor:pointer; min-height:var(--altura-tactil-min);"
      >
        {guardando ? 'Guardando…' : 'Guardar cambios'}
      </button>
      {#if guardado}
        <span style="font-size:13.5px; color:var(--color-vigente); font-weight:600;">Cambios guardados ✓</span>
      {/if}
    </div>
  </form>

  <section style="background:var(--color-superficie); border:1px solid var(--color-borde); border-radius:var(--radio-tarjeta); padding:20px; margin-bottom:24px;">
    <h2 style="margin:0 0 4px; font-family:var(--fuente-titulares); font-size:19px; font-weight:400;">Copia de seguridad</h2>
    <p style="margin:0 0 14px; font-size:12.5px; color:var(--color-texto-tenue);">
      Guarda un archivo con toda tu cartera para no perderla, o para llevarla a otro dispositivo. Importar sustituye
      los datos actuales por los del archivo.
    </p>
    <div style="display:flex; gap:8px; flex-wrap:wrap;">
      <button
        type="button"
        onclick={exportar}
        disabled={procesandoBackup}
        class="boton-backup"
        style="border:1px solid var(--color-acento); background:var(--color-superficie); color:var(--color-acento); border-radius:var(--radio-pill); padding:10px 18px; font-size:13.5px; font-weight:600; cursor:pointer; min-height:var(--altura-tactil-min);"
      >
        Exportar copia
      </button>
      <button
        type="button"
        onclick={importar}
        disabled={procesandoBackup}
        class="boton-backup"
        style="border:1px solid var(--color-borde-input); background:var(--color-superficie); color:var(--color-texto-chip); border-radius:var(--radio-pill); padding:10px 18px; font-size:13.5px; font-weight:600; cursor:pointer; min-height:var(--altura-tactil-min);"
      >
        Importar copia
      </button>
    </div>
    {#if mensajeBackup}
      <div style="font-size:13px; margin-top:10px; color:{mensajeBackup.error ? 'var(--color-vencido)' : 'var(--color-vigente)'}; font-weight:600;">
        {mensajeBackup.texto}
      </div>
    {/if}
  </section>
</div>

{#if mostrarSelectorCompanias}
  <div
    role="presentation"
    style="position:fixed; inset:0; background:rgba(35,28,18,0.45); z-index:55; display:flex; align-items:center; justify-content:center; padding:16px; animation:fadeIn 0.2s ease;"
    onclick={(e) => e.target === e.currentTarget && (mostrarSelectorCompanias = false)}
  >
    <div style="background:var(--color-superficie); border-radius:var(--radio-modal); width:min(480px, 100%); padding:24px; box-shadow:0 20px 50px rgba(35,25,10,0.3);">
      <div style="display:flex; align-items:center; margin-bottom:14px;">
        <h2 style="margin:0; font-family:var(--fuente-titulares); font-size:22px; font-weight:400;">Añadir compañías</h2>
        <button
          onclick={() => (mostrarSelectorCompanias = false)}
          class="cerrar"
          style="margin-left:auto; background:none; border:none; font-size:22px; color:var(--color-texto-tenue); cursor:pointer; padding:4px 8px;"
        >
          ×
        </button>
      </div>
      <SelectorCompanias
        seleccionadas={form.companias ?? []}
        onCambiar={(nuevas) => (form = { ...form, companias: nuevas })}
      />
      <button
        onclick={() => (mostrarSelectorCompanias = false)}
        style="margin-top:16px; border:none; background:var(--color-tinta); color:var(--color-texto-invertido); border-radius:var(--radio-pill); padding:10px 22px; font-size:13.5px; font-weight:600; cursor:pointer; min-height:var(--altura-tactil-min);"
      >
        Hecho
      </button>
    </div>
  </div>
{/if}

<style>
  .boton-foto:hover,
  .boton-anadir:hover,
  .boton-backup:hover {
    background: var(--color-hover-fila);
  }
  .boton-quitar-foto:hover {
    background: var(--color-vencido-bg);
  }
  .chip-quitar {
    background: var(--color-tinta);
    border: 1px solid var(--color-tinta);
    color: var(--color-texto-invertido);
  }
  .chip-quitar:hover {
    background: var(--color-vencido);
    border-color: var(--color-vencido);
  }
  .cerrar:hover {
    color: var(--color-texto);
  }
</style>
