import { conUnDecimal } from './formato.utils';
import {
  KILOBYTE,
  MEGABYTE,
  TAMANO_MAXIMO_IMAGEN,
  TIPOS_IMAGEN_PERMITIDOS,
} from './imagenes.constants';

/** Devuelve el motivo por el que la imagen no se puede subir, o `null` si es válida. */
export function errorDeImagen(imagen: File | null): string | null {
  if (!imagen) return null;
  if (!TIPOS_IMAGEN_PERMITIDOS.includes(imagen.type)) {
    return 'La imagen tiene que ser JPG, PNG o WebP.';
  }
  if (imagen.size > TAMANO_MAXIMO_IMAGEN) {
    return 'La imagen no puede superar los 2 MB.';
  }
  return null;
}

/** Tamaño de archivo legible: "84 KB", "1,2 MB". */
export function formatearTamano(bytes: number): string {
  if (bytes < MEGABYTE) return `${Math.ceil(bytes / KILOBYTE)} KB`;
  return `${conUnDecimal(bytes / MEGABYTE)} MB`;
}
