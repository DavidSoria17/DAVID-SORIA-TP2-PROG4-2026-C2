/**
 * Copia de la lista con el elemento que tiene el mismo `_id` que `actualizado`
 * cambiado por este. Si no está, la lista queda igual.
 */
export function reemplazarPorId<T extends { _id: string }>(
  lista: readonly T[],
  actualizado: T,
): T[] {
  return lista.map((elemento) => (elemento._id === actualizado._id ? actualizado : elemento));
}
