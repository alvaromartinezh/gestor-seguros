import type { ResultadoImportar } from '../../aplicacion/puertos/AlmacenBackup';

/**
 * Abre el selector de archivos nativo del sistema (vía un `<input type="file">`
 * invisible) y devuelve el contenido como texto. Funciona tanto en el
 * navegador como dentro del WebView de Capacitor — ambos son Chromium con
 * soporte completo de `File`/`FileReader`, así que no hace falta un plugin
 * nativo solo para leer un archivo elegido por el usuario.
 */
export function seleccionarArchivoTexto(): Promise<ResultadoImportar> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json,.json';
    input.style.display = 'none';

    let resuelto = false;
    const terminar = (resultado: ResultadoImportar) => {
      if (resuelto) return;
      resuelto = true;
      input.remove();
      resolve(resultado);
    };

    input.addEventListener('change', () => {
      const archivo = input.files?.[0];
      if (!archivo) {
        terminar({ ok: false, cancelado: true });
        return;
      }
      const lector = new FileReader();
      lector.onload = () => terminar({ ok: true, contenido: String(lector.result ?? '') });
      lector.onerror = () => terminar({ ok: false, error: 'No se pudo leer el archivo' });
      lector.readAsText(archivo, 'utf-8');
    });

    // Si el usuario cierra el selector sin elegir nada no hay evento 'change':
    // detectamos el cierre al recuperar el foco la ventana.
    window.addEventListener(
      'focus',
      () => setTimeout(() => terminar({ ok: false, cancelado: true }), 300),
      { once: true },
    );

    document.body.appendChild(input);
    input.click();
  });
}
