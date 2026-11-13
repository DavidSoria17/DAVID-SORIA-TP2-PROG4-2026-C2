import { DatoGrafico } from '../models/estadistica.model';
import { sumar } from './numeros.utils';

/** Lado, en píxeles del dibujo, de la torta pixelada. */
export const LADO_TORTA = 42;
const RADIO_EXTERIOR = 20.5;
const RADIO_INTERIOR = 11;
/** Separación entre porciones, en píxeles medidos sobre el arco. */
const SEPARACION_PORCIONES = 0.75;

/**
 * Tope y marcas de un eje que empieza en cero, divididos en partes iguales y
 * enteras: con máximo 14 y 4 divisiones, el tope es 16 y las marcas 0, 4, 8, 12 y 16.
 */
export function escalaEje(maximo: number, divisiones = 4): { tope: number; marcas: number[] } {
  const paso = Math.max(1, Math.ceil(maximo / divisiones));
  const tope = paso * divisiones;
  return { tope, marcas: Array.from({ length: divisiones + 1 }, (_, indice) => indice * paso) };
}

/** Suma de los valores de los datos de un gráfico. */
export const totalDe = (datos: readonly DatoGrafico[]): number =>
  sumar(datos.map(({ valor }) => valor));

/** Mayor valor de los datos de un gráfico, o 0 si no hay ninguno positivo (base del eje). */
export const maximoDe = (datos: readonly DatoGrafico[]): number =>
  Math.max(0, ...datos.map(({ valor }) => valor));

/** Porcentaje entero de una parte sobre el total (0 si el total es 0). */
export const porcentaje = (parte: number, total: number): number =>
  total === 0 ? 0 : Math.round((parte / total) * 100);

/**
 * Dibuja una torta con agujero en una grilla de `LADO_TORTA` píxeles. Cada
 * porción arranca arriba y sigue en el sentido de las agujas del reloj, con
 * una línea vacía entre una y otra.
 * @param valores cantidad de cada porción, en orden
 * @returns el `d` de un `<path>` por porción, con un rectángulo por cada tramo de fila
 */
export function trazosTorta(valores: readonly number[]): string[] {
  const total = sumar(valores);
  const bordes: number[] = [];
  let acumulado = 0;
  for (const valor of valores) {
    bordes.push(acumulado);
    acumulado += total === 0 ? 0 : valor / total;
  }

  const filas = valores.map(() => new Map<number, number[]>());
  const centro = LADO_TORTA / 2;
  for (let y = 0; y < LADO_TORTA; y++) {
    for (let x = 0; x < LADO_TORTA; x++) {
      const dx = x + 0.5 - centro;
      const dy = y + 0.5 - centro;
      const radio = Math.hypot(dx, dy);
      if (radio > RADIO_EXTERIOR || radio < RADIO_INTERIOR) continue;

      // Fracción de vuelta desde arriba, en el sentido de las agujas del reloj.
      const vuelta = (Math.atan2(dx, -dy) / (2 * Math.PI) + 1) % 1;
      // Los bordes están en orden: la porción es la del último que ya se pasó.
      const porcion = bordes.filter((borde) => borde <= vuelta).length - 1;
      const enUnBorde =
        valores.filter((valor) => valor > 0).length > 1 &&
        bordes.some((borde) => {
          const distancia = Math.min(Math.abs(vuelta - borde), 1 - Math.abs(vuelta - borde));
          return distancia * 2 * Math.PI * radio < SEPARACION_PORCIONES;
        });
      if (porcion < 0 || enUnBorde) continue;

      const fila = filas[porcion].get(y) ?? [];
      fila.push(x);
      filas[porcion].set(y, fila);
    }
  }
  return filas.map(trazoDeFilas);
}

/** Une los píxeles consecutivos de cada fila en un solo rectángulo. */
function trazoDeFilas(filas: Map<number, number[]>): string {
  let trazo = '';
  for (const [y, columnas] of filas) {
    let inicio = columnas[0];
    for (let indice = 1; indice <= columnas.length; indice++) {
      if (columnas[indice] === columnas[indice - 1] + 1) continue;
      const largo = columnas[indice - 1] - inicio + 1;
      trazo += `M${inicio} ${y}h${largo}v1h-${largo}z`;
      inicio = columnas[indice];
    }
  }
  return trazo;
}
