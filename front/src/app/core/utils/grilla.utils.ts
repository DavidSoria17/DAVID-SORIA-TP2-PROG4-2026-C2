import { Celda, Grilla, PedidoUbicacion } from '../models/interfaz.model';

/** Clave de texto de un casillero, para guardarlo en un `Set`. */
export function claveCelda({ columna, fila }: Celda): string {
  return `${columna},${fila}`;
}

/** Si un valor leído del navegador tiene forma de casillero. */
export function esCelda(valor: unknown): valor is Celda {
  if (typeof valor !== 'object' || valor === null) return false;
  const { columna, fila } = valor as Record<string, unknown>;
  return Number.isInteger(columna) && Number.isInteger(fila);
}

export function estaEnGrilla({ columna, fila }: Celda, grilla: Grilla): boolean {
  return columna >= 0 && fila >= 0 && columna < grilla.columnas && fila < grilla.filas;
}

/** Lleva un casillero dentro de los límites de la grilla. */
export function ajustarAGrilla({ columna, fila }: Celda, grilla: Grilla): Celda {
  return {
    columna: Math.min(Math.max(0, columna), Math.max(0, grilla.columnas - 1)),
    fila: Math.min(Math.max(0, fila), Math.max(0, grilla.filas - 1)),
  };
}

/** Casillero número `indice` contando columna por columna, de arriba hacia abajo. */
export function celdaDeIndice(indice: number, grilla: Grilla): Celda {
  const filas = Math.max(1, grilla.filas);
  return { columna: Math.floor(indice / filas), fila: indice % filas };
}

/**
 * Primer casillero libre recorriendo columna por columna, de arriba hacia
 * abajo. Si la grilla está llena, sigue en columnas fuera de ella (quedan
 * tapadas, pero nunca dos íconos en el mismo lugar).
 */
export function primeraCeldaLibre(ocupadas: ReadonlySet<string>, grilla: Grilla): Celda {
  for (let indice = 0; ; indice++) {
    const celda = celdaDeIndice(indice, grilla);
    if (!ocupadas.has(claveCelda(celda))) return celda;
  }
}

/** Casillero libre más cercano a `origen`; ante empates, el de más arriba y a la izquierda. */
export function celdaLibreMasCercana(
  origen: Celda,
  ocupadas: ReadonlySet<string>,
  grilla: Grilla,
): Celda {
  const libres: Celda[] = [];
  for (let columna = 0; columna < grilla.columnas; columna++) {
    for (let fila = 0; fila < grilla.filas; fila++) {
      if (!ocupadas.has(claveCelda({ columna, fila }))) libres.push({ columna, fila });
    }
  }
  const distancia = (celda: Celda) =>
    (celda.columna - origen.columna) ** 2 + (celda.fila - origen.fila) ** 2;
  libres.sort((una, otra) => distancia(una) - distancia(otra));
  return libres[0] ?? primeraCeldaLibre(ocupadas, grilla);
}

/**
 * Reparte los íconos en la grilla sin repetir casilleros. Los pedidos llegan
 * por prioridad: ante dos que quieren el mismo casillero, gana el primero.
 *
 * 1. Cada ícono cuya celda preferida entra en la grilla y está libre, va ahí.
 * 2. El resto va al casillero libre más cercano a su preferida llevada al
 *    borde (si la pantalla se achicó, el ícono queda pegado al costado más
 *    cercano en vez de saltar al otro extremo) o, si no tiene, a su celda inicial.
 *
 * @returns el casillero de cada pedido, por `id`
 */
export function ubicarIconos(
  pedidos: readonly PedidoUbicacion[],
  grilla: Grilla,
): Map<string, Celda> {
  const ubicadas = new Map<string, Celda>();
  const ocupadas = new Set<string>();
  const ocupar = (id: string, celda: Celda) => {
    ubicadas.set(id, celda);
    ocupadas.add(claveCelda(celda));
  };

  for (const { id, preferida } of pedidos) {
    if (preferida && estaEnGrilla(preferida, grilla) && !ocupadas.has(claveCelda(preferida))) {
      ocupar(id, preferida);
    }
  }
  for (const { id, preferida, inicial } of pedidos) {
    if (ubicadas.has(id)) continue;
    const origen = ajustarAGrilla(preferida ?? inicial, grilla);
    ocupar(id, celdaLibreMasCercana(origen, ocupadas, grilla));
  }
  return ubicadas;
}
