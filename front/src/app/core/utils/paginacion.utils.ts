/**
 * Números de página a mostrar en el paginador: la primera, la última y las
 * vecinas de la actual. Donde se saltean páginas va `null` (los puntos).
 * @param actual página actual, desde 1
 * @param total cantidad de páginas
 */
export function paginasVisibles(actual: number, total: number): (number | null)[] {
  const visibles = new Set([1, total, actual - 1, actual, actual + 1]);
  const ordenadas = [...visibles]
    .filter((pagina) => pagina >= 1 && pagina <= total)
    .sort((una, otra) => una - otra);

  const resultado: (number | null)[] = [];
  for (const pagina of ordenadas) {
    const anterior = resultado.at(-1);
    if (typeof anterior === 'number' && pagina - anterior > 1) resultado.push(null);
    resultado.push(pagina);
  }
  return resultado;
}
