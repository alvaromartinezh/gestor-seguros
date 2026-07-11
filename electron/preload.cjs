'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Forma exacta del contrato `PuenteElectron` en
// src/infraestructura/electronBridge.d.ts — cualquier cambio debe hacerse en
// ambos sitios a la vez.
contextBridge.exposeInMainWorld('gestorSeguros', {
  storage: {
    polizasExiste: () => ipcRenderer.invoke('storage:polizas:existe'),
    polizasCargar: () => ipcRenderer.invoke('storage:polizas:cargar'),
    polizasGuardar: (polizas) => ipcRenderer.invoke('storage:polizas:guardar', polizas),
    perfilCargar: () => ipcRenderer.invoke('storage:perfil:cargar'),
    perfilGuardar: (perfil) => ipcRenderer.invoke('storage:perfil:guardar', perfil),
  },
  notificaciones: {
    solicitarPermiso: () => ipcRenderer.invoke('notificaciones:solicitarPermiso'),
    sincronizar: (avisos) => ipcRenderer.invoke('notificaciones:sincronizar', avisos),
    mostrarInmediata: (titulo, cuerpo) => ipcRenderer.invoke('notificaciones:mostrarInmediata', titulo, cuerpo),
  },
  backup: {
    exportarArchivo: (nombreSugerido, contenido) => ipcRenderer.invoke('backup:exportarArchivo', nombreSugerido, contenido),
    importarArchivo: () => ipcRenderer.invoke('backup:importarArchivo'),
  },
  actualizaciones: {
    comprobar: () => ipcRenderer.invoke('actualizaciones:comprobar'),
    instalarAhora: () => ipcRenderer.invoke('actualizaciones:instalarAhora'),
  },
});
