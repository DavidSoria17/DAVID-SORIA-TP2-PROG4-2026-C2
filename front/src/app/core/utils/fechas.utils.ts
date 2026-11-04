const FORMATO_FECHA = /^(\d{2})\/(\d{2})\/(\d{4})$/;
const dosDigitos = (numero: number) => String(numero).padStart(2, '0');

/** Deja solo dígitos y arma DD/MM/AAAA poniendo las barras sola. */
export function aplicarMascaraFecha(texto: string): string {
  const digitos = texto.replace(/\D/g, '').slice(0, 8);
  const partes = [digitos.slice(0, 2), digitos.slice(2, 4), digitos.slice(4, 8)];
  return partes.filter((parte) => parte.length).join('/');
}

/**
 * Convierte DD/MM/AAAA a AAAA-MM-DD (el formato que espera la API).
 * Devuelve `null` si el texto está incompleto o la fecha no existe (31/02, por ejemplo).
 */
export function textoAFechaIso(texto: string): string | null {
  const partes = FORMATO_FECHA.exec(texto);
  if (!partes) return null;
  const [, dia, mes, anio] = partes;
  const fecha = new Date(Date.UTC(Number(anio), Number(mes) - 1, Number(dia)));
  const existe =
    fecha.getUTCFullYear() === Number(anio) &&
    fecha.getUTCMonth() === Number(mes) - 1 &&
    fecha.getUTCDate() === Number(dia);
  return existe ? `${anio}-${mes}-${dia}` : null;
}

/** Fecha de hoy en hora local como AAAA-MM-DD, comparable con el resultado de `textoAFechaIso`. */
export function hoyComoFechaIso(): string {
  const hoy = new Date();
  return `${hoy.getFullYear()}-${dosDigitos(hoy.getMonth() + 1)}-${dosDigitos(hoy.getDate())}`;
}

/** Día y hora en pocas palabras: «hoy, 20:59», «ayer, 09:15» o «27/10, 18:00». */
export function diaYHora(fecha: Date, ahora: Date): string {
  const hora = `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;
  const mismoDia = (una: Date, otra: Date) => una.toDateString() === otra.toDateString();
  const ayer = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate() - 1);
  if (mismoDia(fecha, ahora)) return `hoy, ${hora}`;
  if (mismoDia(fecha, ayer)) return `ayer, ${hora}`;
  return `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}, ${hora}`;
}

const MINUTO_MS = 60_000;
const HORA_MS = 60 * MINUTO_MS;
const DIA_MS = 24 * HORA_MS;

/**
 * Cuánto pasó desde una fecha, en el formato corto de las tarjetas: «recién»,
 * «hace 5 min», «hace 20 h», «ayer, 18:40», «27/10, 09:15» o, si es de otro
 * año, «27/10/2025».
 */
export function tiempoRelativo(fecha: Date, ahora: Date): string {
  const transcurrido = ahora.getTime() - fecha.getTime();
  if (transcurrido < MINUTO_MS) return 'recién';
  if (transcurrido < HORA_MS) return `hace ${Math.floor(transcurrido / MINUTO_MS)} min`;
  if (transcurrido < DIA_MS) return `hace ${Math.floor(transcurrido / HORA_MS)} h`;
  if (fecha.getFullYear() !== ahora.getFullYear()) {
    return `${dosDigitos(fecha.getDate())}/${dosDigitos(fecha.getMonth() + 1)}/${fecha.getFullYear()}`;
  }
  return diaYHora(fecha, ahora);
}
