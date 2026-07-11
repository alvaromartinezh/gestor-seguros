export interface ResultadoExportar {
  ok: boolean;
  cancelado?: boolean;
  error?: string;
}

export interface ResultadoImportar {
  ok: boolean;
  cancelado?: boolean;
  contenido?: string;
  error?: string;
}

/** Puerto de copia de seguridad (DIP): guardar/leer un archivo fuera de la app. */
export interface AlmacenBackup {
  exportarArchivo(nombreSugerido: string, contenido: string): Promise<ResultadoExportar>;
  importarArchivo(): Promise<ResultadoImportar>;
}
