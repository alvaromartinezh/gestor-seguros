<script lang="ts">
  import { COMPANIAS_SUGERIDAS } from '../../dominio';

  interface Props {
    seleccionadas: string[];
    onCambiar: (nuevas: string[]) => void;
  }
  const { seleccionadas, onCambiar }: Props = $props();

  let nuevaCompania = $state('');

  const chips = $derived.by(() => {
    const todas = [...new Set([...COMPANIAS_SUGERIDAS, ...seleccionadas])];
    return todas.map((c) => ({ nombre: c, activa: seleccionadas.includes(c) }));
  });

  function toggle(c: string) {
    onCambiar(seleccionadas.includes(c) ? seleccionadas.filter((x) => x !== c) : [...seleccionadas, c]);
  }

  function anadir() {
    const c = nuevaCompania.trim();
    if (!c) return;
    if (!seleccionadas.includes(c)) onCambiar([...seleccionadas, c]);
    nuevaCompania = '';
  }
</script>

<div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:14px;">
  {#each chips as ch (ch.nombre)}
    <button
      type="button"
      onclick={() => toggle(ch.nombre)}
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
    onkeydown={(e) => e.key === 'Enter' && (e.preventDefault(), anadir())}
    placeholder="Añadir otra compañía…"
    style="flex:1; border:1px solid var(--color-borde-input); border-radius:var(--radio-input); padding:10px 14px; font-size:14px; background:var(--color-superficie);"
  />
  <button
    type="button"
    onclick={anadir}
    class="boton-anadir"
    style="border:1px solid var(--color-acento); background:var(--color-superficie); color:var(--color-acento); border-radius:var(--radio-pill); padding:10px 18px; font-size:13.5px; font-weight:600; cursor:pointer; min-height:var(--altura-tactil-min);"
  >
    Añadir
  </button>
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
  .boton-anadir:hover {
    background: var(--color-hover-fila);
  }
</style>
