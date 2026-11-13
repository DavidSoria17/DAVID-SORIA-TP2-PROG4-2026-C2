import { DatosAltaUsuario, DatosRegistro } from '../models/usuario.model';

/**
 * Arma el multipart del registro o del alta de un usuario. La descripción va
 * solo si tiene texto y la imagen solo si se eligió una.
 */
export function formDataDeUsuario({
  imagen,
  descripcion,
  ...campos
}: DatosRegistro | DatosAltaUsuario): FormData {
  const formData = new FormData();
  for (const [campo, valor] of Object.entries(campos)) {
    formData.append(campo, valor);
  }
  if (descripcion.trim()) formData.append('descripcion', descripcion);
  if (imagen) formData.append('imagen', imagen);
  return formData;
}
