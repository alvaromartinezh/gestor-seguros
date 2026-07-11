import { App } from '@capacitor/app';
import type { ComprobadorActualizaciones, EstadoActualizacion } from '../../aplicacion/puertos/ComprobadorActualizaciones';
import { REPO_NAME, REPO_OWNER } from './config';

interface ReleaseGitHub {
  tag_name: string;
  body: string;
  assets: { name: string; browser_download_url: string }[];
}

const SIN_ACTUALIZACION: EstadoActualizacion = { hayNueva: false };

/** 'v1.2.3' -> [1,2,3]; ignora prefijos no numéricos. */
function parseSemver(v: string): [number, number, number] | null {
  const m = /(\d+)\.(\d+)\.(\d+)/.exec(v);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

function esMasNueva(remota: string, actual: string): boolean {
  const r = parseSemver(remota);
  const a = parseSemver(actual);
  if (!r || !a) return false;
  for (let i = 0; i < 3; i++) {
    if (r[i] !== a[i]) return r[i] > a[i];
  }
  return false;
}

/**
 * Adaptador Android: no hay autoactualización silenciosa posible fuera de la
 * Play Store, así que solo comprueba y, si hay una nueva, ofrece abrir la
 * descarga del .apk en el navegador — el resto del flujo (descargar,
 * confirmar instalar) lo lleva el propio Android.
 */
export class ComprobadorActualizacionesCapacitor implements ComprobadorActualizaciones {
  async comprobar(): Promise<EstadoActualizacion> {
    try {
      const [info, respuesta] = await Promise.all([
        App.getInfo(),
        fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest`),
      ]);
      if (!respuesta.ok) return SIN_ACTUALIZACION;
      const release = (await respuesta.json()) as ReleaseGitHub;
      if (!esMasNueva(release.tag_name, info.version)) return SIN_ACTUALIZACION;

      const apk = release.assets.find((a) => a.name.endsWith('.apk'));
      if (!apk) return SIN_ACTUALIZACION;

      return {
        hayNueva: true,
        version: release.tag_name.replace(/^v/, ''),
        notasVersion: release.body,
        urlDescarga: apk.browser_download_url,
      };
    } catch {
      return SIN_ACTUALIZACION;
    }
  }

  async instalarAhora(estado: EstadoActualizacion): Promise<void> {
    if (estado.urlDescarga) window.open(estado.urlDescarga, '_system');
  }
}
