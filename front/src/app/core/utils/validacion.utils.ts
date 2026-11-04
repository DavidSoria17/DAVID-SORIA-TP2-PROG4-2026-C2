import { ValidationErrors } from '@angular/forms';

/**
 * Texto para mostrar del primer error de un control. Los validadores propios
 * traen su `mensaje`; los de Angular se traducen acá.
 */
export function mensajeDeValidacion(errores: ValidationErrors): string {
  const [clave, detalle] = Object.entries(errores)[0] ?? [];
  if (detalle && typeof detalle === 'object' && typeof detalle.mensaje === 'string') {
    return detalle.mensaje;
  }
  switch (clave) {
    case 'required':
      return 'Completá este campo.';
    case 'email':
      return 'El correo no tiene un formato válido.';
    case 'maxlength':
      return `Admite hasta ${detalle.requiredLength} caracteres.`;
    case 'minlength':
      return `Necesita al menos ${detalle.requiredLength} caracteres.`;
    default:
      return 'Revisá este campo.';
  }
}
