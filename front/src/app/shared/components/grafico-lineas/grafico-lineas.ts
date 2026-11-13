import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, linkedSignal } from '@angular/core';
import { DatoGrafico } from '../../../core/models/estadistica.model';
import { cantidadCon } from '../../../core/utils/formato.utils';
import { escalaEje, maximoDe } from '../../../core/utils/graficos.utils';
import { limitar } from '../../../core/utils/numeros.utils';

/** Medidas del dibujo en unidades del `viewBox`; en pantalla se estira a lo ancho. */
const ANCHO = 600;
const ALTO = 160;
const MARCAS_EJE_X = 7;
const DIVISIONES_EJE_Y = 3;
/** Pasada esta parte del ancho, el detalle se abre a la izquierda del punto. */
const LIMITE_DETALLE_DERECHA = 70;

let siguienteId = 0;

/**
 * Línea de una sola serie con el área de abajo tramada. Marca el punto más
 * alto y, al pasar el mouse, el más cercano, con un detalle de su valor. La
 * tabla con los mismos datos está siempre para los lectores de pantalla y
 * se ve con `comoTabla`.
 */
@Component({
  selector: 'app-grafico-lineas',
  imports: [NgTemplateOutlet],
  templateUrl: './grafico-lineas.html',
  styleUrl: './grafico-lineas.css',
})
export class GraficoLineas {
  readonly datos = input.required<readonly DatoGrafico[]>();
  /** Qué se cuenta, en singular y en plural: `['comentario', 'comentarios']`. */
  readonly unidad = input.required<readonly [string, string]>();
  /** Encabezados de la tabla: la etiqueta y el valor. */
  readonly columnas = input.required<readonly [string, string]>();
  readonly comoTabla = input(false);
  /** Aclaración que acompaña al valor más alto en el detalle: «el día con más actividad». */
  readonly notaMaximo = input<string>();

  protected readonly ancho = ANCHO;
  protected readonly alto = ALTO;
  /** Id de la trama del área, único por gráfico porque los `<pattern>` comparten espacio en la página. */
  protected readonly idTrama = `trama-linea-${siguienteId++}`;

  protected readonly eje = computed(() => escalaEje(maximoDe(this.datos()), DIVISIONES_EJE_Y));

  /** Índice del valor más alto (el primero, si se repite). */
  private readonly indiceMaximo = computed(() => {
    const valores = this.datos().map(({ valor }) => valor);
    return valores.indexOf(Math.max(...valores));
  });

  /** Punto marcado: el que está bajo el mouse o, si no hay, el más alto. */
  protected readonly marcado = linkedSignal(() => this.indiceMaximo());

  protected readonly puntos = computed(() => {
    const datos = this.datos();
    const tope = this.eje().tope;
    return datos.map(({ valor }, indice) => ({
      x: datos.length === 1 ? ANCHO / 2 : (indice / (datos.length - 1)) * ANCHO,
      y: ALTO - (valor / tope) * ALTO,
    }));
  });

  protected readonly linea = computed(() =>
    this.puntos()
      .map(({ x, y }) => `${x.toFixed(1)},${y.toFixed(1)}`)
      .join(' '),
  );

  protected readonly area = computed(() => `0,${ALTO} ${this.linea()} ${ANCHO},${ALTO}`);

  protected readonly guias = computed(() =>
    this.eje().marcas.map((marca) => ({
      marca,
      y: ALTO - (marca / this.eje().tope) * ALTO,
      arriba: `${100 - (marca / this.eje().tope) * 100}%`,
    })),
  );

  /** Etiquetas del eje horizontal, repartidas entre el primer día y el último. */
  protected readonly marcasX = computed(() => {
    const datos = this.datos();
    const cantidad = Math.min(MARCAS_EJE_X, datos.length);
    const indices = new Set(
      Array.from({ length: cantidad }, (_, paso) =>
        cantidad === 1 ? 0 : Math.round((paso * (datos.length - 1)) / (cantidad - 1)),
      ),
    );
    return [...indices].map((indice) => datos[indice].etiquetaCorta ?? datos[indice].etiqueta);
  });

  protected readonly detalle = computed(() => {
    const indice = this.marcado();
    const dato = this.datos()[indice];
    const punto = this.puntos()[indice];
    if (!dato || !punto) return null;
    const [singular, plural] = this.unidad();
    const izquierda = (punto.x / ANCHO) * 100;
    return {
      etiqueta: dato.etiqueta,
      descripcion: cantidadCon(dato.valor, singular, plural),
      esMaximo: indice === this.indiceMaximo() && dato.valor > 0,
      izquierda: `${izquierda}%`,
      arriba: `${(punto.y / ALTO) * 100}%`,
      x: punto.x,
      haciaLaIzquierda: izquierda > LIMITE_DETALLE_DERECHA,
    };
  });

  /** Marca el punto más cercano al mouse. */
  protected seguirMouse(evento: MouseEvent): void {
    const area = (evento.currentTarget as HTMLElement).getBoundingClientRect();
    const fraccion = limitar((evento.clientX - area.left) / area.width, 0, 1);
    this.marcado.set(Math.round(fraccion * (this.datos().length - 1)));
  }

  protected volverAlMaximo(): void {
    this.marcado.set(this.indiceMaximo());
  }
}
