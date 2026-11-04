import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Types } from 'mongoose';

/** Convierte un id de la ruta en `ObjectId`; si no tiene el formato de Mongo, responde 400. */
@Injectable()
export class ParseObjectIdPipe implements PipeTransform<
  string,
  Types.ObjectId
> {
  transform(valor: string): Types.ObjectId {
    if (!/^[a-f\d]{24}$/i.test(valor)) {
      throw new BadRequestException('El id no es válido');
    }
    return new Types.ObjectId(valor);
  }
}
