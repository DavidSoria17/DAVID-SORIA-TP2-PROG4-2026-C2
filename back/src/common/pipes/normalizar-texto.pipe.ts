import { Injectable, PipeTransform } from '@nestjs/common';

const CAMPOS_A_NORMALIZAR = ['correo', 'nombreUsuario', 'usuario'];

/**
 * Pasa a minúsculas y recorta el correo y el nombre de usuario de un body.
 * En la base se guardan en minúsculas, así que las búsquedas por esos campos
 * tienen que llegar igual para aprovechar el índice único.
 */
@Injectable()
export class NormalizarTextoPipe implements PipeTransform {
  transform<T extends object>(body: T): T {
    const campos = body as Record<string, unknown>;
    for (const campo of CAMPOS_A_NORMALIZAR) {
      const valor = campos[campo];
      if (typeof valor === 'string') {
        campos[campo] = valor.trim().toLowerCase();
      }
    }
    return body;
  }
}
