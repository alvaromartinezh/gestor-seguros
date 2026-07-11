<script lang="ts">
  import { store } from '../estado/store.svelte';
  import { esTipoVehiculo, nuevaPolizaVacia, type DatosPoliza, type Errores, type Poliza } from '../../dominio';

  const polizaExistente = store.formPolizaId ? store.servicioPolizas.obtener(store.formPolizaId) : null;
  const formTitulo = polizaExistente ? 'Editar póliza' : 'Nueva póliza';

  let form = $state<DatosPoliza>(polizaExistente ? { ...polizaExistente } : nuevaPolizaVacia());
  let errores = $state<Errores<Poliza>>({});
  let enviando = $state(false);

  const esVehiculo = $derived(esTipoVehiculo(form.tipo ?? ''));

  function cambiarCampo(campo: keyof DatosPoliza, valor: string) {
    form = { ...form, [campo]: valor };
  }

  async function enviar(e: Event) {
    e.preventDefault();
    enviando = true;
    const resultado = await store.guardarPoliza(form);
    enviando = false;
    if (!resultado.ok) {
      errores = resultado.errores;
    }
  }

  const campoInput =
    'border:1px solid var(--color-borde-input); border-radius:var(--radio-input); padding:10px 12px; font-size:14px; background:var(--color-superficie); width:100%;';
  const campoLabel = 'display:flex; flex-direction:column; gap:4px;';
  const campoEtiqueta = 'font-size:12.5px; font-weight:600; color:var(--color-texto-tenue-2);';
  const campoError = 'font-size:12px; color:var(--color-vencido);';
</script>

<div
  role="presentation"
  style="position:fixed; inset:0; background:rgba(35,28,18,0.45); z-index:50; display:flex; align-items:flex-start; justify-content:center; padding:16px; overflow-y:auto; animation:fadeIn 0.2s ease;"
  onclick={(e) => e.target === e.currentTarget && store.cerrarForm()}
>
  <div style="background:var(--color-superficie); border-radius:var(--radio-modal); width:min(680px, 100%); margin:auto 0; padding:26px; box-shadow:0 20px 50px rgba(35,25,10,0.3);">
    <div style="display:flex; align-items:center; margin-bottom:18px;">
      <h2 style="margin:0; font-family:var(--fuente-titulares); font-size:25px; font-weight:400;">{formTitulo}</h2>
      <button
        onclick={() => store.cerrarForm()}
        class="cerrar"
        style="margin-left:auto; background:none; border:none; font-size:22px; color:var(--color-texto-tenue); cursor:pointer; padding:4px 8px;"
      >
        ×
      </button>
    </div>

    <form onsubmit={enviar}>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:12px 14px;">
        <label style="{campoLabel} grid-column:1 / -1;">
          <span style={campoEtiqueta}>Nombre del cliente *</span>
          <input style={campoInput} value={form.nombre} oninput={(e) => cambiarCampo('nombre', e.currentTarget.value)} placeholder="Nombre y apellidos" />
          {#if errores.nombre}<span style={campoError}>{errores.nombre}</span>{/if}
        </label>

        <label style={campoLabel}>
          <span style={campoEtiqueta}>Teléfono</span>
          <input style={campoInput} value={form.telefono} oninput={(e) => cambiarCampo('telefono', e.currentTarget.value)} placeholder="600 000 000" />
          {#if errores.telefono}<span style={campoError}>{errores.telefono}</span>{/if}
        </label>

        <label style={campoLabel}>
          <span style={campoEtiqueta}>Email</span>
          <input style={campoInput} value={form.email} oninput={(e) => cambiarCampo('email', e.currentTarget.value)} placeholder="cliente@correo.com" />
          {#if errores.email}<span style={campoError}>{errores.email}</span>{/if}
        </label>

        <label style={campoLabel}>
          <span style={campoEtiqueta}>DNI / NIE</span>
          <input style={campoInput} value={form.dni} oninput={(e) => cambiarCampo('dni', e.currentTarget.value)} placeholder="00000000A" />
          {#if errores.dni}<span style={campoError}>{errores.dni}</span>{/if}
        </label>

        <label style={campoLabel}>
          <span style={campoEtiqueta}>Tipo de seguro *</span>
          <select style={campoInput} value={form.tipo} onchange={(e) => cambiarCampo('tipo', e.currentTarget.value)}>
            <option value="">Selecciona…</option>
            {#each store.tiposSeguro as t (t)}<option value={t}>{t}</option>{/each}
          </select>
          {#if errores.tipo}<span style={campoError}>{errores.tipo}</span>{/if}
        </label>

        <label style={campoLabel}>
          <span style={campoEtiqueta}>Compañía *</span>
          <select style={campoInput} value={form.compania} onchange={(e) => cambiarCampo('compania', e.currentTarget.value)}>
            <option value="">Selecciona…</option>
            {#each store.companiasDisponibles as c (c)}<option value={c}>{c}</option>{/each}
          </select>
          {#if errores.compania}<span style={campoError}>{errores.compania}</span>{/if}
        </label>

        {#if esVehiculo}
          <label style={campoLabel}>
            <span style={campoEtiqueta}>Vehículo (marca y modelo) *</span>
            <input style={campoInput} value={form.coche} oninput={(e) => cambiarCampo('coche', e.currentTarget.value)} placeholder="Ej: Seat León" />
            {#if errores.coche}<span style={campoError}>{errores.coche}</span>{/if}
          </label>

          <label style={campoLabel}>
            <span style={campoEtiqueta}>Matrícula *</span>
            <input style={campoInput} value={form.matricula} oninput={(e) => cambiarCampo('matricula', e.currentTarget.value)} placeholder="1234 BCD" />
            {#if errores.matricula}<span style={campoError}>{errores.matricula}</span>{/if}
          </label>
        {/if}

        <label style={campoLabel}>
          <span style={campoEtiqueta}>Fecha de contratación</span>
          <input type="date" style={campoInput} value={form.fechaContratacion} oninput={(e) => cambiarCampo('fechaContratacion', e.currentTarget.value)} />
          {#if errores.fechaContratacion}<span style={campoError}>{errores.fechaContratacion}</span>{/if}
        </label>

        <label style={campoLabel}>
          <span style={campoEtiqueta}>Fecha de vencimiento *</span>
          <input type="date" style={campoInput} value={form.fechaVencimiento} oninput={(e) => cambiarCampo('fechaVencimiento', e.currentTarget.value)} />
          {#if errores.fechaVencimiento}<span style={campoError}>{errores.fechaVencimiento}</span>{/if}
        </label>

        <label style={campoLabel}>
          <span style={campoEtiqueta}>Prima anual (€) *</span>
          <input
            type="number"
            step="0.01"
            style={campoInput}
            value={form.precio}
            oninput={(e) => cambiarCampo('precio', e.currentTarget.value)}
            placeholder="380"
          />
          {#if errores.precio}<span style={campoError}>{errores.precio}</span>{/if}
        </label>

        <label style="{campoLabel} grid-column:1 / -1;">
          <span style={campoEtiqueta}>Notas</span>
          <textarea
            style="{campoInput} min-height:70px; resize:vertical;"
            value={form.notas}
            oninput={(e) => cambiarCampo('notas', e.currentTarget.value)}
            placeholder="Observaciones internas…"
          ></textarea>
        </label>
      </div>

      <div style="display:flex; gap:8px; margin-top:22px; justify-content:flex-end;">
        <button
          type="button"
          onclick={() => store.cerrarForm()}
          style="border:1px solid var(--color-borde-input); background:var(--color-superficie); border-radius:var(--radio-pill); padding:11px 20px; font-size:14px; font-weight:600; color:var(--color-texto-chip); cursor:pointer; min-height:var(--altura-tactil-min);"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={enviando}
          style="border:none; background:var(--color-tinta); color:var(--color-texto-invertido); border-radius:var(--radio-pill); padding:11px 22px; font-size:14px; font-weight:600; cursor:pointer; min-height:var(--altura-tactil-min);"
        >
          {enviando ? 'Guardando…' : 'Guardar póliza'}
        </button>
      </div>
    </form>
  </div>
</div>

<style>
  .cerrar:hover {
    color: var(--color-texto);
  }
</style>
