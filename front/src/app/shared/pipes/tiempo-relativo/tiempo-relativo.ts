import { Pipe, PipeTransform } from '@angular/core';
import { tiempoRelativo } from '../../../core/utils/fechas.utils';

/** Fecha ISO como tiempo transcurrido: «hace 5 min», «ayer, 18:40». Ver `tiempoRelativo`. */
@Pipe({ name: 'tiempoRelativo' })
export class TiempoRelativoPipe implements PipeTransform {
  transform(fechaIso: string): string {
    return tiempoRelativo(new Date(fechaIso), new Date());
  }
}
