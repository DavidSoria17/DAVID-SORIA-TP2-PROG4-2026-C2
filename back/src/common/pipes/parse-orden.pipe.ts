import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

export const ORDENES_PUBLICACIONES = ['fecha', 'meGusta'] as const;
export type OrdenPublicaciones = (typeof ORDENES_PUBLICACIONES)[number];

/**
 * Valida el parámetro `orden` del listado de publicaciones. Sin valor, ordena
 * por fecha; con uno que no sea `fecha` ni `meGusta`, responde 400.
 */
@Injectable()
export class ParseOrdenPipe implements PipeTransform<
  string | undefined,
  OrdenPublicaciones
> {
  transform(valor: string | undefined): OrdenPublicaciones {
    if (!valor) return 'fecha';
    const orden = ORDENES_PUBLICACIONES.find((valido) => valido === valor);
    if (!orden) {
      throw new BadRequestException('El orden tiene que ser fecha o meGusta');
    }
    return orden;
  }
}
