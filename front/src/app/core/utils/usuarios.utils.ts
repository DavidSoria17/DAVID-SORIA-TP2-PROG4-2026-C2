import { DatosAltaUsuario, DatosPerfil, DatosRegistro } from '../models/usuario.model';

/**
 * Arma el multipart del registro, del alta de un usuario o de la edición del
 * perfil. Los textos van siempre (una descripción vacía borra la anterior al
 * editar) y la imagen solo si se eligió una.
 */
export function formDataDeUsuario({
  imagen,
  ...campos
}: DatosRegistro | DatosAltaUsuario | DatosPerfil): FormData {
  const formData = new FormData();
  for (const [campo, valor] of Object.entries(campos)) {
    formData.append(campo, valor);
  }
  if (imagen) formData.append('imagen', imagen);
  return formData;
}
