export interface EstadoActualizacion {
  hayNueva: boolean;
  version?: string;
  notasVersion?: string;
  /** Solo relevante en el adaptador de Capacitor: URL del .apk a descargar. */
  urlDescarga?: string;
}

/**
 * Puerto de comprobación de actualizaciones (DIP). Cada plataforma decide
 * cómo se entera de que hay versión nueva y cómo la instala:
 * - Electron: electron-updater vigila el feed de Releases de GitHub y
 *   descarga en segundo plano; `instalarAhora()` reinicia la app ya
 *   actualizada.
 * - Capacitor/Android: consulta la API de Releases y, si hay una nueva,
 *   `instalarAhora()` abre el navegador para que el usuario descargue e
 *   instale el .apk (Android no permite autoactualizar apps fuera de la
 *   Play Store en segundo plano).
 */
export interface ComprobadorActualizaciones {
  comprobar(): Promise<EstadoActualizacion>;
  instalarAhora(estado: EstadoActualizacion): Promise<void>;
}
