import { RequisitoContrasena } from '../models/interfaz.model';

export const REQUISITOS_CONTRASENA: readonly RequisitoContrasena[] = [
  { descripcion: 'Al menos 8 caracteres', cumple: (contrasena) => contrasena.length >= 8 },
  { descripcion: 'Una mayúscula', cumple: (contrasena) => /[A-Z]/.test(contrasena) },
  { descripcion: 'Un número', cumple: (contrasena) => /\d/.test(contrasena) },
];

/**
 * Devuelve el mensaje que corresponde a los requisitos que faltan, o `null`
 * si la contraseña los cumple todos.
 */
export function errorDeContrasena(contrasena: string): string | null {
  const faltantes = REQUISITOS_CONTRASENA.filter((requisito) => !requisito.cumple(contrasena));
  if (faltantes.length === 0) return null;
  return `La contraseña necesita: ${faltantes.map((requisito) => requisito.descripcion.toLowerCase()).join(', ')}.`;
}
