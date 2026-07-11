import { normalizarPoliza, esTipoVehiculo, TIPOS_SEGURO, hoyISO, type Poliza } from '../../dominio';

/** Generador de reproducible aleatoriedad (Mulberry32) — mismos datos demo cada vez. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NOMBRES = ['Antonio', 'Carmen', 'José', 'María', 'Manuel', 'Isabel', 'Francisco', 'Dolores', 'Juan', 'Pilar', 'Pedro', 'Teresa', 'Luis', 'Rosa', 'Miguel', 'Ana', 'Javier', 'Lucía', 'Rafael', 'Elena', 'Andrés', 'Marta', 'Fernando', 'Cristina', 'Sergio'];
const APELLIDOS = ['García', 'Martínez', 'López', 'Sánchez', 'González', 'Rodríguez', 'Fernández', 'Moreno', 'Jiménez', 'Ruiz', 'Hernández', 'Díaz', 'Álvarez', 'Romero', 'Navarro', 'Torres', 'Ramírez', 'Gil', 'Serrano', 'Molina'];
const COCHES = ['Seat León', 'Seat Ibiza', 'Renault Clio', 'Peugeot 208', 'Peugeot 3008', 'Volkswagen Golf', 'Toyota Corolla', 'Ford Focus', 'Opel Corsa', 'Citroën C3', 'Hyundai Tucson', 'Kia Sportage', 'Dacia Sandero', 'Fiat Panda', 'Nissan Qashqai', 'Toyota Yaris', 'Renault Captur', 'Audi A3'];
const MOTOS = ['Honda PCX 125', 'Yamaha MT-07', 'Kymco Agility', 'Vespa Primavera', 'BMW GS 310'];
const FURGOS = ['Citroën Berlingo', 'Ford Transit', 'Renault Kangoo', 'Fiat Ducato'];
const LETRAS_MAT = 'BCDFGHJKLMNPRSTVWXYZ';
const COMPANIAS_DEMO = ['Mapfre', 'AXA', 'Allianz', 'Mutua Madrileña', 'Línea Directa', 'Zurich', 'Generali', 'Catalana Occidente', 'Reale', 'Pelayo', 'Soliss'];

const PRECIO_BASE: Record<string, number> = {
  Coche: 380, Moto: 210, Furgoneta: 520, Hogar: 240, Vida: 320, Salud: 640,
  Decesos: 180, Comercio: 560, 'Responsabilidad Civil': 300, Viaje: 90,
};

export function generarPolizasDemo(n = 50): Poliza[] {
  const rnd = mulberry32(20260711);
  const el = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)];
  const hoy = new Date();
  const polizas: Poliza[] = [];
  const usados = new Set<string>();

  for (let i = 0; i < n; i++) {
    let nombre: string;
    do {
      nombre = `${el(NOMBRES)} ${el(APELLIDOS)} ${el(APELLIDOS)}`;
    } while (usados.has(nombre));
    usados.add(nombre);

    const tipo = el(TIPOS_SEGURO);
    const esVehiculo = esTipoVehiculo(tipo);
    const coche = tipo === 'Moto' ? el(MOTOS) : tipo === 'Furgoneta' ? el(FURGOS) : el(COCHES);
    const matricula = `${1000 + Math.floor(rnd() * 9000)} ${el([...LETRAS_MAT])}${el([...LETRAS_MAT])}${el([...LETRAS_MAT])}`;

    const r = rnd();
    let offsetDias: number;
    if (r < 0.08) offsetDias = -Math.floor(rnd() * 40) - 1;
    else if (r < 0.3) offsetDias = Math.floor(rnd() * 30) + 1;
    else offsetDias = Math.floor(rnd() * 330) + 31;

    const venc = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + offsetDias);
    const contr = new Date(venc.getFullYear() - 1, venc.getMonth(), venc.getDate());

    const base = PRECIO_BASE[tipo] ?? 300;
    const precio = Math.round((base * (0.75 + rnd() * 0.7)) / 5) * 5;

    polizas.push(
      normalizarPoliza({
        id: 'demo-' + String(i + 1).padStart(3, '0'),
        nombre,
        telefono: rnd() < 0.8 ? `6${Math.floor(10000000 + rnd() * 89999999)}` : '',
        email:
          rnd() < 0.6
            ? nombre.toLowerCase().replace(/ /g, '.').normalize('NFD').replace(/[\u0300-\u036f]/g, '') + '@gmail.com'
            : '',
        dni: rnd() < 0.7 ? `${Math.floor(10000000 + rnd() * 89999999)}${el([...'TRWAGMYFPDXBNJZSQVHLCKE'])}` : '',
        tipo,
        compania: el(COMPANIAS_DEMO),
        coche: esVehiculo ? coche : '',
        matricula: esVehiculo ? matricula : '',
        fechaContratacion: hoyISO(contr),
        fechaVencimiento: hoyISO(venc),
        precio,
        notas: '',
        demo: true,
      }),
    );
  }
  return polizas;
}
