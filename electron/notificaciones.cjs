// Notificaciones nativas de Windows/Linux/macOS. La app puede estar
// minimizada a la bandeja del sistema: por eso la comprobación vive en el
// proceso principal (sigue vivo) y se repite periódicamente, no solo al
// abrir la ventana.
'use strict';

const { Notification } = require('electron');
const { rutaDatos, leerJSON, escribirJSON } = require('./almacen.cjs');

const UNA_HORA_MS = 60 * 60 * 1000;

function hoyISO() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function crearGestorNotificaciones(app) {
  const rutaMostrados = rutaDatos(app, 'avisos-notificados.json');
  let programados = [];
  let mostrados = new Set(leerJSON(rutaMostrados, []));

  function persistirMostrados() {
    escribirJSON(rutaMostrados, [...mostrados]);
  }

  function mostrar(titulo, cuerpo) {
    if (!Notification.isSupported()) return;
    new Notification({ title: titulo, body: cuerpo }).show();
  }

  function revisar() {
    const hoy = hoyISO();
    for (const aviso of programados) {
      if (aviso.fechaISO > hoy) continue;
      const clave = `${aviso.id}|${aviso.fechaISO}`;
      if (mostrados.has(clave)) continue;
      mostrar(aviso.titulo, aviso.cuerpo);
      mostrados.add(clave);
    }
    persistirMostrados();
  }

  function sincronizar(avisos) {
    programados = avisos;
    // Solo se conservan como "ya mostrados" los que siguen programados con la
    // misma fecha; así una póliza reprogramada vuelve a avisar.
    const clavesVigentes = new Set(avisos.map((a) => `${a.id}|${a.fechaISO}`));
    mostrados = new Set([...mostrados].filter((c) => clavesVigentes.has(c)));
    revisar();
  }

  const intervalo = setInterval(revisar, UNA_HORA_MS);
  intervalo.unref?.();

  return {
    sincronizar,
    mostrarInmediata: mostrar,
    revisarAhora: revisar,
  };
}

module.exports = { crearGestorNotificaciones };
