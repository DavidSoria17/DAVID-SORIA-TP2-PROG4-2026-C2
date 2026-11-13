import { Pipe, PipeTransform } from '@angular/core';
import { abreviarNumero } from '../../../core/utils/formato.utils';

/** Contador corto: 1234 → «1,2 k». Ver `abreviarNumero`. */
@Pipe({ name: 'abreviarNumero' })
export class AbreviarNumeroPipe implements PipeTransform {
  transform(cantidad: number): string {
    return abreviarNumero(cantidad);
  }
}
