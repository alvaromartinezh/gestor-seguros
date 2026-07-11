#!/usr/bin/env node
// Sincroniza la versión de Android con package.json, que es la única fuente
// de verdad (se bumpea con `npm version patch|minor|major`). Se ejecuta
// antes de compilar el APK (local y en CI) para que nadie tenga que acordarse
// de tocar dos sitios a la vez.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const pkg = JSON.parse(readFileSync(path.join(raiz, 'package.json'), 'utf-8'));
const version = pkg.version;

const [major, minor, patch] = version.split('.').map((n) => parseInt(n, 10));
if ([major, minor, patch].some(Number.isNaN)) {
  throw new Error(`Versión "${version}" en package.json no es X.Y.Z`);
}
// Esquema estable y siempre creciente mientras el semver crezca; con margen
// de sobra respecto al límite de versionCode (entero de 32 bits).
const versionCode = major * 1_000_000 + minor * 1_000 + patch;

const gradlePath = path.join(raiz, 'android', 'app', 'build.gradle');
let contenido = readFileSync(gradlePath, 'utf-8');
contenido = contenido.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
contenido = contenido.replace(/versionName\s+"[^"]*"/, `versionName "${version}"`);
writeFileSync(gradlePath, contenido);

console.log(`android/app/build.gradle -> versionName "${version}" (versionCode ${versionCode})`);
