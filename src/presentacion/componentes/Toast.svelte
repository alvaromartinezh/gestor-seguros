<script lang="ts">
  import { store } from '../estado/store.svelte';

  interface Props {
    titulo: string;
    cuerpo: string;
    onCerrar: () => void;
  }
  const { titulo, cuerpo, onCerrar }: Props = $props();
</script>

<div
  style="position:fixed; top:12px; left:50%; transform:translateX(-50%); width:min(400px, calc(100vw - 24px)); background:#2c2721f0; backdrop-filter:blur(8px); color:var(--color-texto-invertido); border-radius:18px; padding:14px 16px; box-shadow:0 12px 32px rgba(40,30,15,0.35); z-index:60; animation:pushIn 0.4s cubic-bezier(0.2,0.9,0.3,1);"
>
  <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
    <span style="width:16px; height:16px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #ffb54d, #f07f13 70%); display:inline-flex; align-items:center; justify-content:center; color:#c92a12; font-size:7px;">★</span>
    <span style="font-size:11.5px; color:#c9bfa9; font-weight:600;">Gestor de Seguros · ahora</span>
    <button onclick={onCerrar} class="cerrar" style="margin-left:auto; background:none; border:none; color:#c9bfa9; font-size:16px; cursor:pointer; padding:2px 6px;">×</button>
  </div>
  <div style="font-size:14px; font-weight:700; margin-bottom:2px;">{titulo}</div>
  <div style="font-size:13px; color:#ddd5c2; margin-bottom:10px;">{cuerpo}</div>
  <button
    onclick={() => {
      store.cambiarVista('avisos');
      onCerrar();
    }}
    style="background:#ffffff1a; border:1px solid #ffffff2b; color:var(--color-texto-invertido); border-radius:var(--radio-pill); padding:7px 16px; font-size:12.5px; font-weight:600; cursor:pointer;"
  >
    Ver avisos
  </button>
</div>

<style>
  .cerrar:hover {
    color: #fff;
  }
</style>
