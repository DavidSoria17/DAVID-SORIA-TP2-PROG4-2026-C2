import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { DatoGrafico, PorcionTorta } from '../../../core/models/estadistica.model';
import { COLOR_OTRAS, COLORES_TORTA } from '../../../core/utils/dashboard.constants';
import { LADO_TORTA, porcentaje, totalDe, trazosTorta } from '../../../core/utils/graficos.utils';

/**
 * Torta pixelada con agujero: el total en el centro y una leyenda con la
 * cantidad y el porcentaje de cada porción (nunca solo el color). `resto`
 * es la porción que junta lo que no tiene nombre propio («Otras»), en gris.
 * La tabla con los mismos datos está siempre para los lectores de pantalla
 * y se ve con `comoTabla`.
 */
@Component({
  selector: 'app-grafico-torta',
  imports: [NgTemplateOutlet],
  templateUrl: './grafico-torta.html',
  styleUrl: './grafico-torta.css',
})
export class GraficoTorta {
  readonly datos = input.required<readonly DatoGrafico[]>();
  readonly resto = input<DatoGrafico | null>(null);
  /** Qué se cuenta, en plural, debajo del total. */
  readonly unidad = input.required<string>();
  /** Encabezados de la tabla: la etiqueta y el valor. */
  readonly columnas = input.required<readonly [string, string]>();
  readonly comoTabla = input(false);

  protected readonly lado = LADO_TORTA;

  protected readonly todas = computed(() => {
    const resto = this.resto();
    return resto && resto.valor > 0 ? [...this.datos(), resto] : [...this.datos()];
  });

  protected readonly total = computed(() => totalDe(this.todas()));

  protected readonly porciones = computed<PorcionTorta[]>(() => {
    const todas = this.todas();
    const trazos = trazosTorta(todas.map(({ valor }) => valor));
    const conNombre = this.datos().length;
    return todas.map((dato, indice) => ({
      ...dato,
      color: `var(${indice < conNombre ? COLORES_TORTA[indice] : COLOR_OTRAS})`,
      trazo: trazos[indice],
      porcentaje: porcentaje(dato.valor, this.total()),
    }));
  });
}
