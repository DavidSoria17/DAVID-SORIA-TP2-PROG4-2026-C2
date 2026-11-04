import { computed, Service, signal } from '@angular/core';

/** Un pedido corto no debe hacer parpadear el indicador. */
const DEMORA_MS = 400;

/**
 * Pedidos HTTP en vuelo. Los registra `cargaInterceptor`, así ningún
 * componente necesita su propio `cargando` para las esperas globales.
 *
 * Cada pedido recuerda desde qué ventana salió: la ventana muestra su propio
 * spinner (lo único que se ve en celular, donde no hay cursor) y en
 * computadora además aparece uno junto al cursor.
 *
 * Los indicadores aparecen recién pasados los 400 ms. Debajo de eso se
 * prenden y se apagan tan rápido que parece un parpadeo, y molestan más de lo
 * que informan.
 */
@Service()
export class CargaService {
  /** Ruta de la ventana activa al salir cada pedido; `null` si no había ninguna. */
  private readonly origenes = signal<readonly (string | null)[]>([]);
  private readonly mostrando = signal(false);
  private temporizador = 0;

  /** Si hay pedidos en vuelo hace más de la demora. */
  readonly visible = this.mostrando.asReadonly();

  /** Ventanas que esperan una respuesta hace más de la demora. */
  readonly ventanasCargando = computed(() => new Set(this.mostrando() ? this.origenes() : []));

  /** Registra un pedido que sale desde la ventana `origen` y programa los indicadores. */
  comenzar(origen: string | null): void {
    this.origenes.update((origenes) => [...origenes, origen]);
    if (this.temporizador || this.mostrando()) return;
    this.temporizador = window.setTimeout(() => {
      this.temporizador = 0;
      if (this.origenes().length > 0) this.mostrando.set(true);
    }, DEMORA_MS);
  }

  /** Quita un pedido terminado (bien, con error o cancelado); sin pedidos, apaga los indicadores. */
  terminar(origen: string | null): void {
    this.origenes.update((origenes) => {
      const indice = origenes.indexOf(origen);
      return indice === -1
        ? origenes
        : [...origenes.slice(0, indice), ...origenes.slice(indice + 1)];
    });
    if (this.origenes().length > 0) return;
    clearTimeout(this.temporizador);
    this.temporizador = 0;
    this.mostrando.set(false);
  }
}
