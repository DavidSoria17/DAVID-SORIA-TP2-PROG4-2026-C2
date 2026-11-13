import { Pipe, PipeTransform } from '@angular/core';
import { conArroba } from '../../../core/utils/formato.utils';

/** Nombre de usuario con arroba adelante: `'solcito' | arroba` → «@solcito». */
@Pipe({ name: 'arroba' })
export class ArrobaPipe implements PipeTransform {
  transform(nombreUsuario: string): string {
    return conArroba(nombreUsuario);
  }
}
