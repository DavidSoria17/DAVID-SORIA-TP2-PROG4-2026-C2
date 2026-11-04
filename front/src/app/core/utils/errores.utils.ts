import { HttpErrorResponse } from '@angular/common/http';

/**
 * Convierte el error de una petición en un texto para mostrar.
 * La API responde `{ message }` con un texto o con una lista de textos de validación.
 */
export function mensajeDeError(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocurrió un error inesperado. Probá de nuevo.';
  }
  if (error.status === 0) {
    return 'No pudimos conectarnos con el servidor. Revisá tu conexión y probá de nuevo.';
  }
  const mensaje: unknown = error.error?.message;
  if (Array.isArray(mensaje)) return mensaje.join('. ');
  if (typeof mensaje === 'string') return mensaje;
  return 'El servidor no pudo procesar la solicitud. Probá de nuevo en unos minutos.';
}
