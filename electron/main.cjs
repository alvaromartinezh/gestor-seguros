'use strict';

const { app, BrowserWindow, Tray, Menu, ipcMain, dialog, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const { rutaDatos, leerJSON, escribirJSON } = require('./almacen.cjs');
const { crearGestorNotificaciones } = require('./notificaciones.cjs');
const { crearGestorActualizaciones } = require('./actualizaciones.cjs');

const DEV_SERVER_URL = process.env.ELECTRON_DEV_SERVER_URL;
const ICONO = path.join(__dirname, '..', 'build', 'icon-256.png');
const ICONO_BANDEJA = path.join(__dirname, '..', 'build', 'icon-tray.png');

let ventanaPrincipal = null;
let bandeja = null;
let notificaciones = null;
let actualizaciones = null;

// En Linux el sandbox de Chromium exige un binario setuid (chrome-sandbox);
// en un equipo de desarrollo normal no está configurado así, así que se
// desactiva solo en Linux. Windows y macOS no lo necesitan.
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('no-sandbox');
}

function crearVentana() {
  ventanaPrincipal = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 720,
    minHeight: 560,
    icon: ICONO,
    backgroundColor: '#f4efe7',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (DEV_SERVER_URL) {
    ventanaPrincipal.loadURL(DEV_SERVER_URL);
  } else {
    ventanaPrincipal.loadFile(path.join(__dirname, '..', 'dist', 'index.html'));
  }

  // Minimizar a la bandeja en vez de cerrar: la app necesita seguir viva
  // para poder avisar de renovaciones aunque esté fuera de la vista.
  ventanaPrincipal.on('close', (e) => {
    if (app.isQuitting) return;
    e.preventDefault();
    ventanaPrincipal.hide();
  });
}

function crearBandeja() {
  const icono = nativeImage.createFromPath(ICONO_BANDEJA);
  bandeja = new Tray(icono.isEmpty() ? ICONO : icono);
  bandeja.setToolTip('Gestor de Seguros');
  bandeja.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: 'Abrir Gestor de Seguros',
        click: () => {
          ventanaPrincipal?.show();
        },
      },
      { type: 'separator' },
      {
        label: 'Salir',
        click: () => {
          app.isQuitting = true;
          app.quit();
        },
      },
    ]),
  );
  bandeja.on('click', () => ventanaPrincipal?.show());
}

function registrarIPC() {
  ipcMain.handle('storage:polizas:existe', () => fs.existsSync(rutaDatos(app, 'polizas.json')));
  ipcMain.handle('storage:polizas:cargar', () => leerJSON(rutaDatos(app, 'polizas.json'), []));
  ipcMain.handle('storage:polizas:guardar', (_e, polizas) => escribirJSON(rutaDatos(app, 'polizas.json'), polizas));

  ipcMain.handle('storage:perfil:cargar', () => leerJSON(rutaDatos(app, 'perfil.json'), null));
  ipcMain.handle('storage:perfil:guardar', (_e, perfil) => escribirJSON(rutaDatos(app, 'perfil.json'), perfil));

  ipcMain.handle('notificaciones:solicitarPermiso', () => true);
  ipcMain.handle('notificaciones:sincronizar', (_e, avisos) => notificaciones.sincronizar(avisos));
  ipcMain.handle('notificaciones:mostrarInmediata', (_e, titulo, cuerpo) => notificaciones.mostrarInmediata(titulo, cuerpo));

  ipcMain.handle('backup:exportarArchivo', async (_e, nombreSugerido, contenido) => {
    const resultado = await dialog.showSaveDialog(ventanaPrincipal, {
      title: 'Guardar copia de seguridad',
      defaultPath: nombreSugerido,
      filters: [{ name: 'Copia de seguridad', extensions: ['json'] }],
    });
    if (resultado.canceled || !resultado.filePath) return { ok: false, cancelado: true };
    try {
      fs.writeFileSync(resultado.filePath, contenido, 'utf-8');
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'No se pudo guardar el archivo' };
    }
  });

  ipcMain.handle('backup:importarArchivo', async () => {
    const resultado = await dialog.showOpenDialog(ventanaPrincipal, {
      title: 'Abrir copia de seguridad',
      properties: ['openFile'],
      filters: [{ name: 'Copia de seguridad', extensions: ['json'] }],
    });
    if (resultado.canceled || !resultado.filePaths.length) return { ok: false, cancelado: true };
    try {
      const contenido = fs.readFileSync(resultado.filePaths[0], 'utf-8');
      return { ok: true, contenido };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : 'No se pudo leer el archivo' };
    }
  });

  ipcMain.handle('actualizaciones:comprobar', () => actualizaciones.comprobar());
  ipcMain.handle('actualizaciones:instalarAhora', () => actualizaciones.instalarAhora());
}

app.whenReady().then(() => {
  app.setLoginItemSettings({ openAtLogin: true, openAsHidden: true });
  notificaciones = crearGestorNotificaciones(app);
  actualizaciones = crearGestorActualizaciones();
  registrarIPC();
  crearVentana();
  crearBandeja();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) crearVentana();
    else ventanaPrincipal?.show();
  });
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

// En Windows/Linux, cerrar todas las ventanas no debe matar la app: sigue
// viva en la bandeja para poder notificar renovaciones.
app.on('window-all-closed', () => {});
