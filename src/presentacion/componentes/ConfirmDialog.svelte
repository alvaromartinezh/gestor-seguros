<script lang="ts">
  interface Props {
    titulo: string;
    mensaje: string;
    textoConfirmar?: string;
    onConfirmar: () => void;
    onCancelar: () => void;
  }
  const { titulo, mensaje, textoConfirmar = 'Confirmar', onConfirmar, onCancelar }: Props = $props();
</script>

<div
  role="presentation"
  style="position:fixed; inset:0; background:rgba(35,28,18,0.45); z-index:55; display:flex; align-items:center; justify-content:center; padding:16px; animation:fadeIn 0.2s ease;"
  onclick={(e) => e.target === e.currentTarget && onCancelar()}
>
  <div style="background:var(--color-superficie); border-radius:var(--radio-modal); width:min(400px, 100%); padding:24px; box-shadow:0 20px 50px rgba(35,25,10,0.3);">
    <h2 style="margin:0 0 8px; font-family:var(--fuente-titulares); font-size:22px; font-weight:400;">{titulo}</h2>
    <p style="margin:0 0 20px; font-size:14px; color:var(--color-texto-tenue-2); line-height:1.5;">{mensaje}</p>
    <div style="display:flex; gap:8px; justify-content:flex-end;">
      <button
        onclick={onCancelar}
        style="border:1px solid var(--color-borde-input); background:var(--color-superficie); border-radius:var(--radio-pill); padding:10px 18px; font-size:13.5px; font-weight:600; color:var(--color-texto-chip); cursor:pointer; min-height:var(--altura-tactil-min);"
      >
        Cancelar
      </button>
      <button
        onclick={onConfirmar}
        style="border:none; background:var(--color-vencido); color:var(--color-texto-invertido); border-radius:var(--radio-pill); padding:10px 18px; font-size:13.5px; font-weight:600; cursor:pointer; min-height:var(--altura-tactil-min);"
      >
        {textoConfirmar}
      </button>
    </div>
  </div>
</div>
