import { construirAdaptadores, type Plataforma } from '../../infraestructura/entorno';
import {
  ServicioPolizas,
  ServicioPerfil,
  ServicioBackup,
  calcularAgenda,
  calcularAvisos,
  calcularEstadisticas,
  companiasEnUso as calcularCompaniasEnUso,
  filtrarPolizas,
  polizasPorDia,
  type ResultadoGuardar,
  type ResultadoGuardarPerfil,
} from '../../aplicacion';
import {
  DIAS_AVISO_DEFECTO,
  COMPANIAS_SUGERIDAS,
  TIPOS_SEGURO,
  hoyISO,
  type DatosPerfil,
  type DatosPoliza,
  type Perfil,
  type Poliza,
} from '../../dominio';
import type { EstadoActualizacion } from '../../aplicacion/puertos/ComprobadorActualizaciones';
import type { Sesion } from '../../aplicacion/puertos/Autenticacion';
import { estadoConexion } from '../../infraestructura/nube/estadoConexion';

const INTERVALO_COMPROBAR_ACTUALIZACIONES_MS = 30 * 60 * 1000;
const AVISO_SIN_CONEXION = 'Necesitas conexión a internet para guardar cambios.';

export interface ItemNav {
  id: Vista;
  etiqueta: string;
  badge: number;
}

export type Vista = 'inicio' | 'polizas' | 'calendario' | 'avisos' | 'perfil';

export interface FiltrosUI {
  texto: string;
  compania: string;
  tipo: string;
  estado: string;
}

const FILTROS_VACIOS: FiltrosUI = { texto: '', compania: '', tipo: '', estado: '' };

/**
 * Store de presentación: estado reactivo de la UI + orquestación de los
 * casos de uso de aplicación. No contiene reglas de negocio — solo llama a
 * los servicios y guarda el resultado en variables `$state` para que los
 * componentes Svelte se actualicen.
 */
class AppStore {
  readonly adaptadores = construirAdaptadores();
  readonly servicioPolizas = new ServicioPolizas(this.adaptadores.repoPolizas);
  readonly servicioPerfil = new ServicioPerfil(this.adaptadores.repoPerfil, DIAS_AVISO_DEFECTO);
  readonly servicioBackup = new ServicioBackup(this.servicioPolizas, this.servicioPerfil, this.adaptadores.almacenBackup);

  plataforma: Plataforma = this.adaptadores.plataforma;

  listo = $state(false);
  sesion = $state<Sesion | null>(null);
  sinConexion = $state(false);
  polizas = $state<Poliza[]>([]);
  perfil = $state<Perfil | null>(null);
  hayDemo = $state(false);

  vista = $state<Vista>('inicio');
  filtros = $state<FiltrosUI>({ ...FILTROS_VACIOS });

  esMovil = $state(false);

  formVisible = $state(false);
  formPolizaId = $state<string | null>(null);

  confirmarBorradoId = $state<string | null>(null);

  toast = $state<{ titulo: string; cuerpo: string } | null>(null);

  actualizacion = $state<EstadoActualizacion>({ hayNueva: false });
  instalandoActualizacion = $state(false);

  get diasAviso(): number {
    return this.perfil?.diasAviso ?? DIAS_AVISO_DEFECTO;
  }

  get companiasDisponibles(): string[] {
    const propias = this.perfil?.companias ?? [];
    return propias.length ? propias : [...COMPANIAS_SUGERIDAS];
  }

  get tiposSeguro(): string[] {
    return [...TIPOS_SEGURO];
  }

  // ── Consultas reactivas ──
  // Leen `this.polizas`/`this.filtros`/`this.diasAviso` directamente (en vez
  // de pasar por la caché interna de ServicioPolizas) para que Svelte 5
  // detecte la dependencia y recalcule cuando cambian.

  get polizasFiltradas(): Poliza[] {
    return filtrarPolizas(this.polizas, this.filtros, hoyISO(), this.diasAviso);
  }

  get estadisticasCartera() {
    return calcularEstadisticas(this.polizas, hoyISO(), this.diasAviso);
  }

  get avisosRenovacion() {
    return calcularAvisos(this.polizas, hoyISO(), this.diasAviso);
  }

  get avisosCount(): number {
    return this.avisosRenovacion.length;
  }

  get agendaMeses() {
    return calcularAgenda(this.polizas, hoyISO(), 12);
  }

  get companiasEnCartera(): string[] {
    return calcularCompaniasEnUso(this.polizas);
  }

  polizasPorDia(fechaISO: string): Poliza[] {
    return polizasPorDia(this.polizas, fechaISO);
  }

  get navItems(): ItemNav[] {
    return [
      { id: 'inicio', etiqueta: 'Inicio', badge: 0 },
      { id: 'polizas', etiqueta: 'Pólizas', badge: 0 },
      { id: 'calendario', etiqueta: 'Calendario', badge: 0 },
      { id: 'avisos', etiqueta: 'Avisos', badge: this.avisosCount },
      { id: 'perfil', etiqueta: 'Perfil', badge: 0 },
    ];
  }

  async inicializar(): Promise<void> {
    this.sesion = await this.adaptadores.autenticacion.sesionActual();
    this.listo = true;
    if (this.sesion) await this.cargarDatosUsuario();
  }

  private async cargarDatosUsuario(): Promise<void> {
    const [polizas, perfil] = await Promise.all([
      this.servicioPolizas.inicializar({ conDemo: false }),
      this.servicioPerfil.inicializar(),
    ]);
    this.polizas = polizas;
    this.perfil = perfil;
    this.hayDemo = this.servicioPolizas.hayDatosDemo();
    this.sinConexion = estadoConexion.sinConexion;
    await this.adaptadores.notificador.solicitarPermiso();
    await this.reprogramarNotificaciones();

    this.comprobarActualizaciones();
    setInterval(() => this.comprobarActualizaciones(), INTERVALO_COMPROBAR_ACTUALIZACIONES_MS);
  }

  async completarLogin(sesion: Sesion): Promise<void> {
    this.sesion = sesion;
    await this.cargarDatosUsuario();
  }

  async cerrarSesion(): Promise<void> {
    await this.adaptadores.autenticacion.cerrarSesion();
    this.sesion = null;
    this.perfil = null;
    this.polizas = [];
  }

  private async comprobarActualizaciones(): Promise<void> {
    this.actualizacion = await this.adaptadores.comprobadorActualizaciones.comprobar();
  }

  async instalarActualizacion(): Promise<void> {
    this.instalandoActualizacion = true;
    await this.adaptadores.comprobadorActualizaciones.instalarAhora(this.actualizacion);
    this.instalandoActualizacion = false;
  }

  private async reprogramarNotificaciones(): Promise<void> {
    await this.servicioPolizas.programarNotificaciones(this.adaptadores.notificador, this.diasAviso, hoyISO());
  }

  private refrescarPolizas(): void {
    this.polizas = this.servicioPolizas.todas();
    this.hayDemo = this.servicioPolizas.hayDatosDemo();
  }

  // ── Navegación ──

  cambiarVista(vista: Vista): void {
    this.vista = vista;
  }

  irFiltroEstado(estado: string): void {
    this.filtros = { ...FILTROS_VACIOS, estado };
    this.vista = 'polizas';
  }

  irFiltroCompania(compania: string): void {
    this.filtros = { ...FILTROS_VACIOS, compania };
    this.vista = 'polizas';
  }

  cambiarFiltro(parcial: Partial<FiltrosUI>): void {
    this.filtros = { ...this.filtros, ...parcial };
  }

  limpiarFiltros(): void {
    this.filtros = { ...FILTROS_VACIOS };
  }

  // ── Pólizas ──

  abrirNueva(): void {
    this.formPolizaId = null;
    this.formVisible = true;
  }

  abrirEditar(id: string): void {
    this.formPolizaId = id;
    this.formVisible = true;
  }

  cerrarForm(): void {
    this.formVisible = false;
    this.formPolizaId = null;
  }

  private avisarSinConexion(): void {
    this.sinConexion = true;
    this.mostrarToast('Sin conexión', AVISO_SIN_CONEXION);
  }

  async guardarPoliza(datos: DatosPoliza): Promise<ResultadoGuardar> {
    try {
      const resultado = await this.servicioPolizas.guardarPoliza(datos);
      if (resultado.ok) {
        this.refrescarPolizas();
        await this.reprogramarNotificaciones();
        this.cerrarForm();
      }
      return resultado;
    } catch {
      this.avisarSinConexion();
      return { ok: false, errores: {} };
    }
  }

  pedirBorrar(id: string): void {
    this.confirmarBorradoId = id;
  }

  cancelarBorrado(): void {
    this.confirmarBorradoId = null;
  }

  async confirmarBorrado(): Promise<void> {
    if (!this.confirmarBorradoId) return;
    try {
      await this.servicioPolizas.eliminarPoliza(this.confirmarBorradoId);
      this.confirmarBorradoId = null;
      this.refrescarPolizas();
      await this.reprogramarNotificaciones();
    } catch {
      this.avisarSinConexion();
    }
  }

  async renovar(id: string): Promise<void> {
    try {
      await this.servicioPolizas.renovarUnAnio(id);
      this.refrescarPolizas();
      await this.reprogramarNotificaciones();
    } catch {
      this.avisarSinConexion();
    }
  }

  async quitarDemo(): Promise<void> {
    try {
      await this.servicioPolizas.eliminarDatosDemo();
      this.refrescarPolizas();
      await this.reprogramarNotificaciones();
    } catch {
      this.avisarSinConexion();
    }
  }

  // ── Perfil ──

  async guardarPerfil(datos: DatosPerfil): Promise<ResultadoGuardarPerfil> {
    try {
      const resultado = await this.servicioPerfil.guardar(datos);
      if (resultado.ok) {
        this.perfil = resultado.perfil;
        await this.reprogramarNotificaciones();
      }
      return resultado;
    } catch {
      this.avisarSinConexion();
      return { ok: false, errores: {} };
    }
  }

  // ── Copia de seguridad ──

  async exportarBackup() {
    return this.servicioBackup.exportar();
  }

  async importarBackup() {
    try {
      const resultado = await this.servicioBackup.importar();
      if (resultado.ok) {
        this.refrescarPolizas();
        this.perfil = this.servicioPerfil.existe() ? this.servicioPerfil.actual() : null;
        await this.reprogramarNotificaciones();
      }
      return resultado;
    } catch {
      this.avisarSinConexion();
      return { ok: false as const, error: AVISO_SIN_CONEXION };
    }
  }

  // ── Toast ──

  mostrarToast(titulo: string, cuerpo: string): void {
    this.toast = { titulo, cuerpo };
  }

  cerrarToast(): void {
    this.toast = null;
  }
}

export const store = new AppStore();
