import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { DatoGrafico } from '../../../core/models/estadistica.model';
import { cantidadCon } from '../../../core/utils/formato.utils';
import { escalaEje, maximoDe, porcentaje, totalDe } from '../../../core/utils/graficos.utils';

/**
 * Barras horizontales de una sola serie, de un solo color, con su eje.
 * Al pasar el mouse o enfocar una barra muestra el valor y qué parte del
 * total representa. La tabla con los mismos datos está siempre para los
 * lectores de pantalla y se ve con `comoTabla`.
 */
@Component({
  selector: 'app-grafico-barras',
  imports: [NgTemplateOutlet],
  templateUrl: './grafico-barras.html',
  styleUrl: './grafico-barras.css',
})
export class GraficoBarras {
  readonly datos = input.required<readonly DatoGrafico[]>();
  /** Qué se cuenta, en singular y en plural: `['publicación', 'publicaciones']`. */
  readonly unidad = input.required<readonly [string, string]>();
  /** Encabezados de la tabla: la etiqueta y el valor. */
  readonly columnas = input.required<readonly [string, string]>();
  readonly comoTabla = input(false);

  /** Índice de la barra bajo el mouse o con el foco. */
  protected readonly resaltada = signal<number | null>(null);

  protected readonly eje = computed(() => escalaEje(maximoDe(this.datos())));

  protected readonly barras = computed(() => {
    const total = totalDe(this.datos());
    const [singular, plural] = this.unidad();
    return this.datos().map(({ etiqueta, valor }) => {
      const ancho = (valor / this.eje().tope) * 100;
      return {
        etiqueta,
        valor,
        ancho: `${ancho}%`,
        descripcion: cantidadCon(valor, singular, plural),
        parteDelTotal: `${porcentaje(valor, total)} % del total`,
        // Cerca del borde derecho, el detalle se abre hacia la izquierda de la barra.
        detalleALaIzquierda: ancho > 60,
      };
    });
  });
}
