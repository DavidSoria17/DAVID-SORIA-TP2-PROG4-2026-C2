/**
 * Lleva `valor` a quedar entre `minimo` y `maximo`. Si el rango está invertido
 * (el espacio disponible es menor que el mínimo), devuelve `maximo`.
 */
export const limitar = (valor: number, minimo: number, maximo: number): number =>
  Math.min(Math.max(valor, minimo), maximo);

/** Suma de una lista de números (0 si está vacía). */
export const sumar = (numeros: readonly number[]): number =>
  numeros.reduce((suma, numero) => suma + numero, 0);
