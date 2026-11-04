import { Component, computed, input, output } from '@angular/core';
import { paginasVisibles } from '../../../core/utils/paginacion.utils';
import { Icono } from '../icono/icono';

/**
 * Paginador con anterior, siguiente y los números cercanos a la página
 * actual, más un resumen («Mostrando 11–20 de 64 publicaciones»). Con una
 * sola página muestra solo el resumen.
 */
@Component({
  selector: 'app-paginador',
  imports: [Icono],
  templateUrl: './paginador.html',
  styleUrl: './paginador.css',
})
export class Paginador {
  /** Página actual, desde 1. */
  readonly pagina = input.required<number>();
  readonly porPagina = input.required<number>();
  readonly total = input.required<number>();
  /** Qué se cuenta, en plural, para el resumen. */
  readonly elementos = input('resultados');

  readonly cambiar = output<number>();

  protected readonly totalPaginas = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.porPagina())),
  );
  protected readonly paginas = computed(() => paginasVisibles(this.pagina(), this.totalPaginas()));

  protected readonly resumen = computed(() => {
    const desde = (this.pagina() - 1) * this.porPagina() + 1;
    const hasta = Math.min(this.pagina() * this.porPagina(), this.total());
    return `Mostrando ${desde}–${hasta} de ${this.total()} ${this.elementos()}`;
  });
}
