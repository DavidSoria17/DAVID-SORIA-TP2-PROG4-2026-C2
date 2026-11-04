import { NgOptimizedImage } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { NombreIconoApp } from '../../../core/models/icono.model';
import { ICONOS_APPS } from '../../../core/utils/iconos-apps.constants';

/**
 * Ícono pixel de una app (PNG). Se muestra a tamaño nativo o al doble, con
 * la versión `@2x`, para que los píxeles no se deformen. Es decorativo: el
 * nombre de la app tiene que estar en texto al lado.
 */
@Component({
  selector: 'app-icono-app',
  imports: [NgOptimizedImage],
  templateUrl: './icono-app.html',
  styleUrl: './icono-app.css',
})
export class IconoApp {
  readonly nombre = input.required<NombreIconoApp>();
  readonly escala = input<1 | 2>(2);
  /** Carga la imagen antes que el resto: para los íconos que se ven apenas abre la página. */
  readonly prioridad = input(false);

  protected readonly tamano = computed(() => ICONOS_APPS[this.nombre()]);
  protected readonly ruta = computed(
    () => `iconos/apps/${this.nombre()}${this.escala() === 2 ? '@2x' : ''}.png`,
  );
}
