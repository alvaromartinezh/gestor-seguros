// Persistencia de escritorio: un fichero JSON por dato dentro de userData.
// Vive en el proceso principal (no en el renderer) porque es el único con
// acceso directo al sistema de archivos.
'use strict';

const fs = require('fs');
const path = require('path');

function rutaDatos(app, nombreArchivo) {
  return path.join(app.getPath('userData'), 'datos', nombreArchivo);
}

function leerJSON(ruta, porDefecto) {
  try {
    return JSON.parse(fs.readFileSync(ruta, 'utf-8'));
  } catch {
    return porDefecto;
  }
}

function escribirJSON(ruta, datos) {
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  const tmp = ruta + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(datos));
  fs.renameSync(tmp, ruta); // escritura atómica: evita corromper el archivo si la app se cierra a mitad
}

module.exports = { rutaDatos, leerJSON, escribirJSON };
