import { Usuario } from '../models/usuario.model';

const MIL = 1_000;
const MILLON = 1_000_000;

/** Nombre de usuario con arroba adelante, como se muestra en toda la app: «@solcito». */
export const conArroba = (nombreUsuario: string): string => `@${nombreUsuario}`;

/** Nombre y apellido juntos: «Sol Pérez». */
export const nombreCompleto = ({
  nombre,
  apellido,
}: Pick<Usuario, 'nombre' | 'apellido'>): string => `${nombre} ${apellido}`;

/** Número con hasta un decimal y coma decimal: «3,5», «12». */
export const conUnDecimal = (numero: number): string =>
  numero.toLocaleString('es-AR', { maximumFractionDigits: 1 });

/**
 * Cantidad corta para contadores: hasta 999 queda igual; después, «1,2 k» o
 * «3,4 M» con un decimal (que se omite si es cero: «12 k»).
 */
export function abreviarNumero(cantidad: number): string {
  if (Math.abs(cantidad) < MIL) return String(cantidad);
  const [divisor, sufijo] = Math.abs(cantidad) < MILLON ? [MIL, 'k'] : [MILLON, 'M'];
  const abreviado = Math.trunc((cantidad / divisor) * 10) / 10;
  return `${conUnDecimal(abreviado)} ${sufijo}`;
}

/** Cantidad con el sustantivo que corresponde: «1 comentario», «12 comentarios». */
export const cantidadCon = (cantidad: number, singular: string, plural: string): string =>
  `${cantidad} ${cantidad === 1 ? singular : plural}`;
