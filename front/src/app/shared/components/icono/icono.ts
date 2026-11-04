import { Component, computed, input } from '@angular/core';
import { IconoPixel, NombreIcono } from '../../../core/models/icono.model';
import { ICONOS } from '../../../core/utils/iconos.constants';

/** Ícono pixel decorativo. Lo que comunica tiene que estar también en texto o en un `aria-label`. */
@Component({
  selector: 'app-icono',
  templateUrl: './icono.html',
  styleUrl: './icono.css',
})
export class Icono {
  readonly nombre = input.required<NombreIcono>();
  /** Píxeles de pantalla por cada píxel del ícono. */
  readonly escala = input(2);

  protected readonly icono = computed((): IconoPixel => ICONOS[this.nombre()]);
}
