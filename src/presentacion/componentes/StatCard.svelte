<script lang="ts">
  interface Props {
    etiqueta: string;
    valor: string | number;
    color?: string;
    onclick?: () => void;
  }
  const { etiqueta, valor, color = 'var(--color-texto)', onclick }: Props = $props();
</script>

{#if onclick}
  <button
    {onclick}
    class="tarjeta clicable"
    style="background:var(--color-superficie); border:1px solid var(--color-borde); border-radius:var(--radio-tarjeta); padding:18px; text-align:left; cursor:pointer;"
  >
    <div style="font-size:11.5px; color:{color}; font-weight:600; text-transform:uppercase; letter-spacing:0.07em;">{etiqueta}</div>
    <div style="font-family:var(--fuente-titulares); font-size:34px; margin-top:4px; color:{color};">{valor}</div>
  </button>
{:else}
  <div class="tarjeta" style="background:var(--color-superficie); border:1px solid var(--color-borde); border-radius:var(--radio-tarjeta); padding:18px;">
    <div style="font-size:11.5px; color:var(--color-texto-tenue); font-weight:600; text-transform:uppercase; letter-spacing:0.07em;">{etiqueta}</div>
    <div style="font-family:var(--fuente-titulares); font-size:34px; margin-top:4px;">{valor}</div>
  </div>
{/if}

<style>
  .clicable:hover {
    border-color: #c39a52;
  }
</style>
