import type { RepositorioPolizas } from '../aplicacion/puertos/RepositorioPolizas';
import type { RepositorioPerfil } from '../aplicacion/puertos/RepositorioPerfil';
import type { Notificador } from '../aplicacion/puertos/Notificador';
import type { AlmacenBackup } from '../aplicacion/puertos/AlmacenBackup';
import type { ComprobadorActualizaciones } from '../aplicacion/puertos/ComprobadorActualizaciones';

import { RepositorioPolizasElectron } from './almacenamiento/RepositorioPolizasElectron';
import { RepositorioPerfilElectron } from './almacenamiento/RepositorioPerfilElectron';
import { RepositorioPolizasCapacitor } from './almacenamiento/RepositorioPolizasCapacitor';
import { RepositorioPerfilCapacitor } from './almacenamiento/RepositorioPerfilCapacitor';
import { RepositorioPolizasWeb } from './almacenamiento/RepositorioPolizasWeb';
import { RepositorioPerfilWeb } from './almacenamiento/RepositorioPerfilWeb';

import { NotificadorElectron } from './notificaciones/NotificadorElectron';
import { NotificadorCapacitor } from './notificaciones/NotificadorCapacitor';
import { NotificadorNulo } from './notificaciones/NotificadorNulo';

import { AlmacenBackupElectron } from './backup/AlmacenBackupElectron';
import { AlmacenBackupCapacitor } from './backup/AlmacenBackupCapacitor';
import { AlmacenBackupWeb } from './backup/AlmacenBackupWeb';

import { ComprobadorActualizacionesElectron } from './actualizaciones/ComprobadorActualizacionesElectron';
import { ComprobadorActualizacionesCapacitor } from './actualizaciones/ComprobadorActualizacionesCapacitor';
import { ComprobadorActualizacionesNulo } from './actualizaciones/ComprobadorActualizacionesNulo';

export type Plataforma = 'electron' | 'capacitor' | 'web';

export interface Adaptadores {
  plataforma: Plataforma;
  repoPolizas: RepositorioPolizas;
  repoPerfil: RepositorioPerfil;
  notificador: Notificador;
  almacenBackup: AlmacenBackup;
  comprobadorActualizaciones: ComprobadorActualizaciones;
}

function detectarPlataforma(): Plataforma {
  if (typeof window !== 'undefined' && window.gestorSeguros) return 'electron';
  const capacitorGlobal = (globalThis as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  if (capacitorGlobal?.isNativePlatform?.()) return 'capacitor';
  return 'web';
}

/**
 * Composition root: el único lugar de toda la aplicación que sabe en qué
 * plataforma se ejecuta y qué adaptador concreto corresponde a cada puerto.
 * El resto del código (aplicación y presentación) solo ve las interfaces.
 */
export function construirAdaptadores(): Adaptadores {
  const plataforma = detectarPlataforma();
  switch (plataforma) {
    case 'electron':
      return {
        plataforma,
        repoPolizas: new RepositorioPolizasElectron(),
        repoPerfil: new RepositorioPerfilElectron(),
        notificador: new NotificadorElectron(),
        almacenBackup: new AlmacenBackupElectron(),
        comprobadorActualizaciones: new ComprobadorActualizacionesElectron(),
      };
    case 'capacitor':
      return {
        plataforma,
        repoPolizas: new RepositorioPolizasCapacitor(),
        repoPerfil: new RepositorioPerfilCapacitor(),
        notificador: new NotificadorCapacitor(),
        almacenBackup: new AlmacenBackupCapacitor(),
        comprobadorActualizaciones: new ComprobadorActualizacionesCapacitor(),
      };
    default:
      return {
        plataforma,
        repoPolizas: new RepositorioPolizasWeb(),
        repoPerfil: new RepositorioPerfilWeb(),
        notificador: new NotificadorNulo(),
        almacenBackup: new AlmacenBackupWeb(),
        comprobadorActualizaciones: new ComprobadorActualizacionesNulo(),
      };
  }
}
