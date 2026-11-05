import { computed, Service, signal } from '@angular/core';
import { destroyDetachedRouteHandle, DetachedRouteHandle } from '@angular/router';
import { ConfigVentana, PantallaGuardada, VentanaAbierta } from '../models/interfaz.model';
import { rutaDeApp } from '../utils/rutas.utils';

/**
 * Apps abiertas en la barra de tareas. A la vista hay una sola ventana: la de
 * la ruta activa. Las demás quedan minimizadas con su pantalla guardada (lo
 * escrito en un formulario sigue ahí al volver), gracias a `VentanasReuseStrategy`.
 */
@Service()
export class VentanasService {
  private readonly listaAbiertas = signal<VentanaAbierta[]>([]);
  private readonly rutaActiva = signal<string | null>(null);
  private readonly activaMinimizada = signal(false);
  private readonly pantallasGuardadas = new Map<string, PantallaGuardada>();

  readonly abiertas = this.listaAbiertas.asReadonly();
  readonly activa = this.rutaActiva.asReadonly();
  readonly minimizada = this.activaMinimizada.asReadonly();

  /** Ventana a la vista, o `null` si se ve el escritorio. */
  readonly visible = computed(() => {
    const ruta = this.rutaActiva();
    if (ruta === null || this.activaMinimizada()) return null;
    return this.listaAbiertas().find((abierta) => abierta.ruta === ruta) ?? null;
  });

  /**
   * Registra que se mostró la app de `ruta` en la dirección `url`; si no
   * estaba abierta, se suma a la barra.
   */
  activar(ruta: string, config: ConfigVentana, url: string): void {
    this.listaAbiertas.update((abiertas) =>
      this.estaAbierta(ruta)
        ? abiertas.map((abierta) => (abierta.ruta === ruta ? { ...abierta, url } : abierta))
        : [...abiertas, { ruta, config, url }],
    );
    this.rutaActiva.set(ruta);
    this.activaMinimizada.set(false);
  }

  /** Se navegó al escritorio vacío: ninguna ventana activa, las abiertas siguen en la barra. */
  desactivar(): void {
    this.rutaActiva.set(null);
  }

  minimizar(): void {
    this.activaMinimizada.set(true);
  }

  restaurar(): void {
    this.activaMinimizada.set(false);
  }

  /** Saca la app de la barra y descarta las pantallas suyas que estaban guardadas. */
  cerrar(ruta: string): void {
    this.listaAbiertas.update((abiertas) => abiertas.filter((abierta) => abierta.ruta !== ruta));
    for (const [rutaPantalla, guardada] of this.pantallasGuardadas) {
      if (rutaDeApp(rutaPantalla) !== ruta) continue;
      destroyDetachedRouteHandle(guardada.pantalla);
      this.pantallasGuardadas.delete(rutaPantalla);
    }
  }

  /** Dirección a la que vuelve la app al traerla al frente, o `null` si no está abierta. */
  urlDe(ruta: string): string | null {
    return this.listaAbiertas().find((abierta) => abierta.ruta === ruta)?.url ?? null;
  }

  estaAbierta(ruta: string): boolean {
    return this.listaAbiertas().some((abierta) => abierta.ruta === ruta);
  }

  /**
   * Para `VentanasReuseStrategy`: guarda la pantalla de una ruta de una app
   * abierta, mostrando la dirección `url`, o la borra si se volvió a enganchar
   * (`null`). Hay un lugar por ruta: si había otra pantalla guardada para la
   * misma ruta con otra dirección (el detalle de otra publicación), se destruye.
   */
  guardarPantalla(ruta: string, pantalla: DetachedRouteHandle | null, url: string): void {
    if (!pantalla) {
      this.pantallasGuardadas.delete(ruta);
      return;
    }
    const anterior = this.pantallasGuardadas.get(ruta);
    if (anterior && anterior.pantalla !== pantalla) destroyDetachedRouteHandle(anterior.pantalla);
    this.pantallasGuardadas.set(ruta, { pantalla, url });
  }

  /** Pantalla guardada de la ruta, solo si quedó en la misma dirección. */
  pantallaGuardada(ruta: string, url: string): DetachedRouteHandle | null {
    const guardada = this.pantallasGuardadas.get(ruta);
    return guardada?.url === url ? guardada.pantalla : null;
  }
}
