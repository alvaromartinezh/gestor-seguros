// Comprobación de actualizaciones de escritorio vía electron-updater, que
// lee el feed de Releases de GitHub (configurado en package.json -> build.publish).
// Las comprobaciones/descargas ocurren aquí, en segundo plano; el renderer
// solo pregunta "¿qué sabes ahora mismo?" por IPC (ver comprobar()).
'use strict';

const { autoUpdater } = require('electron-updater');

const SEIS_HORAS_MS = 6 * 60 * 60 * 1000;

function crearGestorActualizaciones() {
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  let estado = { hayNueva: false };

  autoUpdater.on('update-downloaded', (info) => {
    estado = { hayNueva: true, version: info.version, notasVersion: String(info.releaseNotes ?? '') };
  });
  autoUpdater.on('error', (err) => {
    console.error('Error comprobando actualizaciones:', err?.message ?? err);
  });

  const comprobarAhora = () => autoUpdater.checkForUpdates().catch(() => {});
  comprobarAhora();
  const intervalo = setInterval(comprobarAhora, SEIS_HORAS_MS);
  intervalo.unref?.();

  return {
    comprobar: async () => estado,
    instalarAhora: async () => autoUpdater.quitAndInstall(),
  };
}

module.exports = { crearGestorActualizaciones };
