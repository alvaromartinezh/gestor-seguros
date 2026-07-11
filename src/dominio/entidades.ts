export interface Poliza {
  id: string | null;
  nombre: string;
  telefono: string;
  email: string;
  dni: string;
  tipo: string;
  compania: string;
  coche: string;
  matricula: string;
  fechaContratacion: string;
  fechaVencimiento: string;
  precio: number;
  notas: string;
  demo: boolean;
}

/** Datos "en bruto" tal y como llegan de un formulario, antes de normalizar. */
export type DatosPoliza = Partial<Omit<Poliza, 'precio'>> & { precio?: number | string };

export function nuevaPolizaVacia(): DatosPoliza {
  return {
    id: null,
    nombre: '', telefono: '', email: '', dni: '',
    tipo: '', compania: '',
    coche: '', matricula: '',
    fechaContratacion: '', fechaVencimiento: '',
    precio: '', notas: '',
    demo: false,
  };
}

export interface Perfil {
  nombre: string;
  foto: string;
  companias: string[];
  diasAviso: number;
}

export type DatosPerfil = Partial<Perfil>;

export function nuevoPerfilVacio(diasAvisoDefecto: number): DatosPerfil {
  return { nombre: '', foto: '', companias: [], diasAviso: diasAvisoDefecto };
}
