/**
 * Lee un valor guardado en `localStorage`. Si no existe, no es JSON válido o
 * no tiene la forma esperada (por ejemplo, quedó de una versión anterior),
 * devuelve `porDefecto` en vez de romper la pantalla.
 */
export function leerGuardado<T>(
  clave: string,
  esValido: (valor: unknown) => valor is T,
  porDefecto: T,
): T {
  try {
    const guardado = localStorage.getItem(clave);
    if (guardado === null) return porDefecto;
    const valor: unknown = JSON.parse(guardado);
    return esValido(valor) ? valor : porDefecto;
  } catch {
    return porDefecto;
  }
}

/**
 * Guarda un valor como JSON. Si el navegador no deja (modo privado, cuota
 * llena), el estado sigue en memoria y solo se pierde al recargar.
 */
export function guardar(clave: string, valor: unknown): void {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin almacenamiento disponible no hay nada que hacer: el valor sigue en memoria.
  }
}

/** Si el valor es un objeto plano cuyos valores cumplen `esValor`. */
export function esRegistroDe<T>(
  valor: unknown,
  esValor: (elemento: unknown) => elemento is T,
): valor is Record<string, T> {
  return (
    typeof valor === 'object' &&
    valor !== null &&
    !Array.isArray(valor) &&
    Object.values(valor).every(esValor)
  );
}
