/** Un recordatorio de renovación que debe dispararse en una fecha concreta. */
export interface AvisoProgramable {
  id: string; // id de la póliza a la que pertenece
  titulo: string;
  cuerpo: string;
  fechaISO: string; // fecha en la que debe mostrarse (YYYY-MM-DD)
}

/**
 * Puerto de notificaciones (DIP). "Sincronizar" reemplaza el conjunto completo
 * de avisos programados por el que se le pasa — así cada adaptador decide
 * cómo reconciliar (cancelar + reprogramar) sin que la aplicación conozca el
 * mecanismo nativo de cada plataforma.
 */
export interface Notificador {
  solicitarPermiso(): Promise<boolean>;
  sincronizar(avisos: AvisoProgramable[]): Promise<void>;
  mostrarInmediata(titulo: string, cuerpo: string): Promise<void>;
}
